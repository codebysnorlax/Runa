import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";
import { GoogleGenAI, Type } from "@google/genai";

export const generateInsightsAndPlan = action({
  args: {
    userId: v.string(),
    clientDate: v.string(),
    runs: v.any(),
    goals: v.any(),
    profile: v.any(),
  },
  handler: async (ctx, args) => {
    // 1. Secure Database Check - Verify standard rate limit with "lazy reset"
    await ctx.runMutation(internal.insights.checkLimitAndIncrement, {
      userId: args.userId,
      clientDate: args.clientDate,
    });

    // 2. Fetch Gemini configuration securely
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      await ctx.runMutation(internal.insights.decrementLimit, { userId: args.userId, clientDate: args.clientDate });
      throw new Error("GEMINI_API_KEY is not configured in Convex environment.");
    }
    const ai = new GoogleGenAI({ apiKey });

    // 3. Prepare the EXACT original AI prompt from your legacy aiService
    const prompt = `
    Analyze the following running data for a user and generate fitness insights and a weekly plan.

    User Profile:
    - Age: ${args.profile?.age || "N/A"}
    - Weight: ${args.profile?.weight_kg || "N/A"} kg
    - Height: ${args.profile?.height_cm || "N/A"} cm

    User Goals:
    - Weekly Distance Target: ${args.goals?.weekly_distance_km || 0} km
    - Weekly Running Days Target: ${args.goals?.weekly_runs || 0} days
    - Distance Goals: ${args.goals?.distance_goals?.map((g: any) => `${g.name}: ${g.distance_km}km in ${g.target_time}`).join(', ') || 'None set'}

    Recent Runs (up to last 10, most recent first):
    ${args.runs.slice(0, 10).map((r: any) =>
      `- Date: ${r.date}, Distance: ${r.distance_m}m, Time: ${r.total_time_sec}s, Avg Speed: ${r.avg_speed_kmh.toFixed(2)} km/h`
    ).join('\n')}

    Based on this data, provide:
    1.  An overall "Improvement Score" from 0 to 100, where 100 is excellent progress. Keep this harsh but fair based strictly on consistency.
    2.  4-6 concise "Insight Cards". Each card should have a title, content, and a type ('positive', 'negative', 'neutral'). 
        RULES: 
        - Reference exact distances/speeds or notes from their past runs (e.g. "Your 3.2km run at 10.5km/h was excellent..."). Avoid generic platitudes.
        - If their data is sparse or they consistently miss targets, explicitly call them out on it with tough-love motivation.
    3.  A "Weekly Recommendation Plan" with a short, actionable suggestion for each day of the week (Monday to Sunday).
        RULES:
        - Carefully weave rest days ("Rest day 🧘") directly into heavy training blocks.
        - Describe exactly what kind of run they should do (e.g. "5km Tempo Run at 10km/h" instead of just "Run").
        - Ensure the total weekly distance exactly matches their target of ${args.goals?.weekly_distance_km || 0}km.
    `;

    // 4. Exactly matched structured output configurations
    const generateConfig = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          improvementScore: {
            type: Type.INTEGER,
            description: "A score from 0 to 100 representing user's improvement.",
          },
          insights: {
            type: Type.ARRAY,
            description: "A list of insight cards.",
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['positive', 'negative', 'neutral'] },
              },
              required: ["title", "content", "type"],
            },
          },
          weeklyPlan: {
            type: Type.OBJECT,
            description: "A recommended plan for the week.",
            properties: {
              monday: { type: Type.STRING },
              tuesday: { type: Type.STRING },
              wednesday: { type: Type.STRING },
              thursday: { type: Type.STRING },
              friday: { type: Type.STRING },
              saturday: { type: Type.STRING },
              sunday: { type: Type.STRING },
            },
            required: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
          },
        },
        required: ["improvementScore", "insights", "weeklyPlan"],
      },
    };

    // 5. Secure AI Generation (with 503 fallback mechanism preserved)
    try {
      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: generateConfig,
        });
      } catch (e: any) {
        if (e.message?.includes("503") || e.message?.includes("Overloaded") || e.status === 503) {
          console.log("503 on gemini-2.5-flash. Falling back to gemini-1.5-pro.");
          response = await ai.models.generateContent({
            model: "gemini-1.5-pro",
            contents: prompt,
            config: generateConfig,
          });
        } else {
          throw e; // throw other errors directly to the outer catch
        }
      }

      if (!response.text) {
        throw new Error("No text response generated from AI.");
      }

      // 6. JSON Structure handling
      const jsonText = response.text.trim();
      const parsedData = JSON.parse(jsonText);

      // Validate formatting loosely before injecting into DB
      if (!parsedData.insights || !parsedData.weeklyPlan || typeof parsedData.improvementScore !== "number") {
         throw new Error("Invalid AI response structure generated.");
      }

      // 7. Update user insights table in Convex
      await ctx.runMutation(api.insights.upsert, {
        userId: args.userId,
        insights: parsedData.insights.map((i: any) => ({
           id: i.id || crypto.randomUUID(),
           title: i.title || "Insight",
           content: i.content || "",
           type: ["positive", "negative", "neutral"].includes(i.type) ? i.type : "neutral"
        })),
        weeklyPlan: parsedData.weeklyPlan,
        improvementScore: parsedData.improvementScore
      });

      return { success: true };

    } catch (error: any) {
      console.error("AI Generation Error: ", error.message || error);
      
      // Critical: Refund the user's daily count if AI generation failed
      await ctx.runMutation(internal.insights.decrementLimit, {
        userId: args.userId,
        clientDate: args.clientDate
      });

      throw new Error("AI service error: " + (error.message || "Could not complete the process"));
    }
  },
});

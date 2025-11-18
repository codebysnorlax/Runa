
import { GoogleGenAI, Type } from "@google/genai";
import { Run, Goal, Profile, InsightsData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateInsightsAndPlan = async (runs: Run[], goals: Goal, profile: Profile): Promise<InsightsData | null> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
    return null;
  }

  const prompt = `
    Analyze the following running data for a user and generate fitness insights and a weekly plan.

    User Profile:
    - Age: ${profile.age}
    - Weight: ${profile.weight_kg} kg
    - Height: ${profile.height_cm} cm

    User Goals:
    - Weekly Distance Target: ${goals.weekly_distance_km} km
    - Weekly Running Days Target: ${goals.weekly_runs} days
    - Distance Goals: ${goals.distance_goals.map(g => `${g.name}: ${g.distance_km}km in ${g.target_time}`).join(', ') || 'None set'}

    Recent Runs (up to last 10, most recent first):
    ${runs.slice(0, 10).map(r => 
      `- Date: ${r.date}, Distance: ${r.distance_m}m, Time: ${r.total_time_sec}s, Avg Speed: ${r.avg_speed_kmh.toFixed(2)} km/h`
    ).join('\n')}

    Based on this data, provide:
    1.  An overall "Improvement Score" from 0 to 100, where 100 is excellent progress.
    2.  4-6 concise "Insight Cards". Each card should have a title, content, and a type ('positive', 'negative', 'neutral'). Focus on trends, fatigue, consistency, and goal progress.
    3.  A "Weekly Recommendation Plan" with a short, actionable suggestion for each day of the week (Monday to Sunday).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
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
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    // Add unique IDs to insights
    const insightsWithIds = result.insights.map((insight: any) => ({
      ...insight,
      id: crypto.randomUUID(),
    }));

    return { ...result, insights: insightsWithIds };
  } catch (error) {
    console.error("Error generating insights from Gemini API:", error);
    return null;
  }
};

import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

const insightValidator = v.object({
  id: v.string(),
  title: v.string(),
  content: v.string(),
  type: v.union(v.literal("positive"), v.literal("negative"), v.literal("neutral")),
});

const weeklyPlanValidator = v.object({
  monday: v.string(),
  tuesday: v.string(),
  wednesday: v.string(),
  thursday: v.string(),
  friday: v.string(),
  saturday: v.string(),
  sunday: v.string(),
});

export const getByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("insights")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const upsert = mutation({
  args: {
    userId: v.string(),
    insights: v.array(insightValidator),
    weeklyPlan: weeklyPlanValidator,
    improvementScore: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("insights")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userId: _, ...fields } = args;
      await ctx.db.patch(existing._id, fields);
      return existing._id;
    } else {
      return await ctx.db.insert("insights", args);
    }
  },
});

export const checkLimitAndIncrement = internalMutation({
  args: { 
    userId: v.string(),
    clientDate: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("insights")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const today = args.clientDate;

    if (!existing) {
      // First time ever creating insights
      await ctx.db.insert("insights", {
        userId: args.userId,
        insights: [],
        weeklyPlan: { monday: "", tuesday: "", wednesday: "", thursday: "", friday: "", saturday: "", sunday: "" },
        improvementScore: 0,
        lastGeneratedDate: today,
        dailyCount: 1,
      });
      return true;
    }

    if (existing.lastGeneratedDate === today) {
      const currentCount = existing.dailyCount || 0;
      if (currentCount >= 2) {
        throw new Error("Daily limit reached. Try again tomorrow.");
      }
      await ctx.db.patch(existing._id, {
        dailyCount: currentCount + 1,
      });
    } else {
      // Lazy reset for a new day
      await ctx.db.patch(existing._id, {
        lastGeneratedDate: today,
        dailyCount: 1,
      });
    }
    
    return true;
  },
});

export const decrementLimit = internalMutation({
  args: { 
    userId: v.string(),
    clientDate: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("insights")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing && existing.lastGeneratedDate === args.clientDate) {
      const currentCount = existing.dailyCount || 0;
      if (currentCount > 0) {
         await ctx.db.patch(existing._id, {
           dailyCount: currentCount - 1,
         });
      }
    }
  }
});

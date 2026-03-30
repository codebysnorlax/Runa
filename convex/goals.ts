import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const distanceGoalValidator = v.object({
  id: v.string(),
  distance_km: v.number(),
  target_time: v.string(),
  name: v.string(),
});

export const getByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("goals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const upsert = mutation({
  args: {
    userId: v.string(),
    weekly_distance_km: v.number(),
    weekly_runs: v.number(),
    distance_goals: v.array(distanceGoalValidator),
    start_date: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("goals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userId: _, ...fields } = args;
      await ctx.db.patch(existing._id, fields);
      return existing._id;
    } else {
      return await ctx.db.insert("goals", args);
    }
  },
});

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const runs = await ctx.db
      .query("runs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    // Sort by date descending (newest first)
    return runs.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },
});

export const add = mutation({
  args: {
    userId: v.string(),
    userEmail: v.optional(v.string()),
    date: v.string(),
    distance_m: v.number(),
    total_time_sec: v.number(),
    avg_speed_kmh: v.number(),
    max_speed_kmh: v.number(),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("runs", args);
  },
});

export const edit = mutation({
  args: {
    id: v.id("runs"),
    date: v.string(),
    distance_m: v.number(),
    total_time_sec: v.number(),
    avg_speed_kmh: v.number(),
    max_speed_kmh: v.number(),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("runs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Bulk insert for migration from localStorage
export const bulkAdd = mutation({
  args: {
    runs: v.array(
      v.object({
        userId: v.string(),
        userEmail: v.optional(v.string()),
        date: v.string(),
        distance_m: v.number(),
        total_time_sec: v.number(),
        avg_speed_kmh: v.number(),
        max_speed_kmh: v.number(),
        notes: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const run of args.runs) {
      await ctx.db.insert("runs", run);
    }
  },
});

export const bulkRestore = mutation({
    args: {
        userId: v.string(),
        userEmail: v.optional(v.string()),
        runs: v.array(
          v.object({
            id: v.string(),
            date: v.string(),
            distance_m: v.number(),
            total_time_sec: v.number(),
            avg_speed_kmh: v.number(),
            max_speed_kmh: v.number(),
            notes: v.string(),
          })
        ),
      },
      handler: async (ctx, args) => {
        // 1. Delete all existing runs for the user
        const existingRuns = await ctx.db
          .query("runs")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .collect();
    
        for (const run of existingRuns) {
          await ctx.db.delete(run._id);
        }
    
        // 2. Insert all the new runs
        for (const run of args.runs) {
          const { id, ...runData } = run;
          await ctx.db.insert("runs", { ...runData, userId: args.userId, userEmail: args.userEmail });
        }
      },
})

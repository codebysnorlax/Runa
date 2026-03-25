import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const upsert = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    height_cm: v.number(),
    weight_kg: v.number(),
    age: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        height_cm: args.height_cm,
        weight_kg: args.weight_kg,
        age: args.age,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("profiles", args);
    }
  },
});

// Only creates a profile if one doesn't exist yet (used on login)
export const initIfNew = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!existing) {
      return await ctx.db.insert("profiles", {
        userId: args.userId,
        name: args.name,
        height_cm: 0,
        weight_kg: 0,
        age: 0,
      });
    }
    return existing._id;
  },
});

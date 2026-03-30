import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  runs: defineTable({
    userId: v.string(),
    date: v.string(),
    distance_m: v.number(),
    total_time_sec: v.number(),
    avg_speed_kmh: v.number(),
    max_speed_kmh: v.number(),
    notes: v.string(),
  }).index("by_user", ["userId"]),

  profiles: defineTable({
    userId: v.string(),
    name: v.string(),
    height_cm: v.number(),
    weight_kg: v.number(),
    age: v.number(),
  }).index("by_user", ["userId"]),

  goals: defineTable({
    userId: v.string(),
    weekly_distance_km: v.number(),
    weekly_runs: v.number(),
    distance_goals: v.array(
      v.object({
        id: v.string(),
        distance_km: v.number(),
        target_time: v.string(),
        name: v.string(),
      })
    ),
    start_date: v.string(),
  }).index("by_user", ["userId"]),

  globalChat: defineTable({
    userId: v.string(),
    userName: v.string(),
    userImage: v.optional(v.string()),
    userEmail: v.optional(v.string()),
    message: v.string(),
    deleted: v.optional(v.boolean()),
    edited: v.optional(v.boolean()),
  }).index("by_time", ["userId"]),

  insights: defineTable({
    userId: v.string(),
    insights: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        content: v.string(),
        type: v.union(
          v.literal("positive"),
          v.literal("negative"),
          v.literal("neutral")
        ),
      })
    ),
    weeklyPlan: v.object({
      monday: v.string(),
      tuesday: v.string(),
      wednesday: v.string(),
      thursday: v.string(),
      friday: v.string(),
      saturday: v.string(),
      sunday: v.string(),
    }),
    improvementScore: v.number(),
    lastGeneratedDate: v.optional(v.string()),
    dailyCount: v.optional(v.number()),
  }).index("by_user", ["userId"]),
});

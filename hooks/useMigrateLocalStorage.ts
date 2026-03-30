import { useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Run, Profile, Goal, InsightsData } from "@/types";

const MIGRATION_FLAG_PREFIX = "convex-migrated-";

/**
 * One-time migration hook: reads localStorage data for the current user
 * and pushes it to Convex, then sets a flag so it never runs again.
 */
export function useMigrateLocalStorage() {
  const { user, isLoaded } = useUser();
  const hasRun = useRef(false);

  const bulkAddRuns = useMutation(api.runs.bulkAdd);
  const upsertProfile = useMutation(api.profile.upsert);
  const upsertGoals = useMutation(api.goals.upsert);
  const upsertInsights = useMutation(api.insights.upsert);

  useEffect(() => {
    if (!isLoaded || !user || hasRun.current) return;

    const migrationKey = `${MIGRATION_FLAG_PREFIX}${user.id}`;
    if (localStorage.getItem(migrationKey)) return;

    hasRun.current = true;

    const migrate = async () => {
      try {
        const userId = user.id;
        const userEmail = user.primaryEmailAddress?.emailAddress || undefined;

        // Migrate runs
        const runsRaw = localStorage.getItem(`${userId}-runs.json`);
        if (runsRaw) {
          const runs: Run[] = JSON.parse(runsRaw);
          if (runs.length > 0) {
            await bulkAddRuns({
              runs: runs.map((r) => ({
                userId,
                userEmail,
                date: r.date,
                distance_m: r.distance_m,
                total_time_sec: r.total_time_sec,
                avg_speed_kmh: r.avg_speed_kmh,
                max_speed_kmh: r.max_speed_kmh,
                notes: r.notes || "",
              })),
            });
          }
        }

        // Migrate profile
        const profileRaw = localStorage.getItem(`${userId}-profile.json`);
        if (profileRaw) {
          const profile: Profile = JSON.parse(profileRaw);
          await upsertProfile({
            userId,
            userEmail,
            name: profile.name || "User",
            height_cm: profile.height_cm || 0,
            weight_kg: profile.weight_kg || 0,
            age: profile.age || 0,
          });
        }

        // Migrate goals
        const goalsRaw = localStorage.getItem(`${userId}-goals.json`);
        if (goalsRaw) {
          const goals: Goal = JSON.parse(goalsRaw);
          await upsertGoals({
            userId,
            userEmail,
            weekly_distance_km: goals.weekly_distance_km || 0,
            weekly_runs: goals.weekly_runs || 0,
            distance_goals: (goals.distance_goals || []).map((dg) => ({
              id: dg.id,
              distance_km: dg.distance_km,
              target_time: dg.target_time,
              name: dg.name,
            })),
            start_date: goals.start_date || new Date().toISOString(),
          });
        }

        // Migrate insights
        const insightsRaw = localStorage.getItem(`${userId}-insights.json`);
        if (insightsRaw) {
          const insights: InsightsData = JSON.parse(insightsRaw);
          await upsertInsights({
            userId,
            userEmail,
            insights: (insights.insights || []).map((i) => ({
              id: i.id,
              title: i.title,
              content: i.content,
              type: i.type,
            })),
            weeklyPlan: insights.weeklyPlan || {
              monday: "",
              tuesday: "",
              wednesday: "",
              thursday: "",
              friday: "",
              saturday: "",
              sunday: "",
            },
            improvementScore: insights.improvementScore || 0,
          });
        }

        // Mark migration complete
        localStorage.setItem(migrationKey, "true");
        console.log("[Convex Migration] Successfully migrated localStorage data for user:", userId);
      } catch (error) {
        console.error("[Convex Migration] Failed to migrate localStorage data:", error);
        // Reset so it can retry next time
        hasRun.current = false;
      }
    };

    migrate();
  }, [isLoaded, user, bulkAddRuns, upsertProfile, upsertGoals, upsertInsights]);
}

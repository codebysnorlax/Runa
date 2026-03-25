import React, { createContext, useContext, ReactNode } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Goal } from "@/types";

interface GoalsContextType {
  goals: Goal | null;
  updateGoals: (newGoals: Goal) => void;
  isLoading: boolean;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export const GoalsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const userId = isLoaded && user ? user.id : undefined;

  const convexGoals = useQuery(
    api.goals.getByUser,
    userId ? { userId } : "skip"
  );

  const upsertMutation = useMutation(api.goals.upsert);

  // Map Convex document to the existing Goal shape
  const goals: Goal | null = convexGoals
    ? {
        weekly_distance_km: convexGoals.weekly_distance_km,
        weekly_runs: convexGoals.weekly_runs,
        distance_goals: convexGoals.distance_goals,
        start_date: convexGoals.start_date,
      }
    : convexGoals === undefined
      ? null // still loading
      : null; // no data yet

  const isLoading = convexGoals === undefined;

  const updateGoals = (newGoals: Goal) => {
    if (!userId) return;
    upsertMutation({
      userId,
      weekly_distance_km: newGoals.weekly_distance_km,
      weekly_runs: newGoals.weekly_runs,
      distance_goals: newGoals.distance_goals.map((dg) => ({
        id: dg.id,
        distance_km: dg.distance_km,
        target_time: dg.target_time,
        name: dg.name,
      })),
      start_date: newGoals.start_date,
    });
  };

  return (
    <GoalsContext.Provider value={{ goals, updateGoals, isLoading }}>
      {children}
    </GoalsContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error("useGoals must be used within a GoalsProvider");
  }
  return context;
};

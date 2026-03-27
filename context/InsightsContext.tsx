import React, { createContext, useContext, ReactNode } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { InsightsData } from "@/types";

interface InsightsContextType {
  insights: InsightsData | null;
  updateInsights: (newInsights: InsightsData) => void;
  isLoading: boolean;
}

const InsightsContext = createContext<InsightsContextType | undefined>(undefined);

export const InsightsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const userId = isLoaded && user ? user.id : undefined;

  const convexInsights = useQuery(
    api.insights.getByUser,
    userId ? { userId } : "skip"
  );

  const upsertMutation = useMutation(api.insights.upsert);

  // Map Convex document to the augmented InsightsData shape
  const insights: InsightsData | null = convexInsights
    ? {
        insights: convexInsights.insights,
        weeklyPlan: convexInsights.weeklyPlan,
        improvementScore: convexInsights.improvementScore,
        dailyCount: convexInsights.dailyCount,
        lastGeneratedDate: convexInsights.lastGeneratedDate,
      }
    : null;

  const isLoading = convexInsights === undefined;

  const updateInsights = (newInsights: InsightsData) => {
    if (!userId) return;
    upsertMutation({
      userId,
      insights: newInsights.insights.map((i) => ({
        id: i.id,
        title: i.title,
        content: i.content,
        type: i.type,
      })),
      weeklyPlan: newInsights.weeklyPlan,
      improvementScore: newInsights.improvementScore,
    });
  };

  return (
    <InsightsContext.Provider value={{ insights, updateInsights, isLoading }}>
      {children}
    </InsightsContext.Provider>
  );
};

// It's a common pattern to export the consumer hook alongside the provider.
// eslint-disable-next-line react-refresh/only-export-components
export const useInsights = () => {
  const context = useContext(InsightsContext);
  if (context === undefined) {
    throw new Error("useInsights must be used within an InsightsProvider");
  }
  return context;
};

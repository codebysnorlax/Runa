import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser } from "@clerk/clerk-react";
import { InsightsData } from "@/types";
import * as storage from "@/services/storageService";

interface InsightsContextType {
  insights: InsightsData | null;
  updateInsights: (newInsights: InsightsData) => void;
}

const InsightsContext = createContext<InsightsContextType | undefined>(undefined);

export const InsightsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [insights, setInsights] = useState<InsightsData | null>(null);

  useEffect(() => {
    const loadInsights = () => {
      if (isLoaded && user) {
        setInsights(storage.getInsights(user.id));
      }
    };
    loadInsights();
    window.addEventListener("appDataRefresh", loadInsights);
    return () => window.removeEventListener("appDataRefresh", loadInsights);
  }, [user, isLoaded]);

  const updateInsights = (newInsights: InsightsData) => {
    if (!user) return;
    setInsights(newInsights);
    storage.saveInsights(newInsights, user.id);
  };

  return (
    <InsightsContext.Provider value={{ insights, updateInsights }}>
      {children}
    </InsightsContext.Provider>
  );
};

export const useInsights = () => {
  const context = useContext(InsightsContext);
  if (context === undefined) {
    throw new Error("useInsights must be used within an InsightsProvider");
  }
  return context;
};

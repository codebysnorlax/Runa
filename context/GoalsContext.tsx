import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser } from "@clerk/clerk-react";
import { Goal } from "@/types";
import * as storage from "@/services/storageService";

interface GoalsContextType {
  goals: Goal | null;
  updateGoals: (newGoals: Goal) => void;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export const GoalsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [goals, setGoals] = useState<Goal | null>(null);

  useEffect(() => {
    const loadGoals = () => {
      if (isLoaded && user) {
        setGoals(storage.getGoals(user.id));
      }
    };
    loadGoals();
    window.addEventListener("appDataRefresh", loadGoals);
    return () => window.removeEventListener("appDataRefresh", loadGoals);
  }, [user, isLoaded]);

  const updateGoals = (newGoals: Goal) => {
    if (!user) return;
    setGoals(newGoals);
    storage.saveGoals(newGoals, user.id);
  };

  return (
    <GoalsContext.Provider value={{ goals, updateGoals }}>
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

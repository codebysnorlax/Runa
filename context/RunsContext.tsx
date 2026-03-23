import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser } from "@clerk/clerk-react";
import { Run } from "@/types";
import * as storage from "@/services/storageService";

interface RunsContextType {
  runs: Run[];
  addRun: (newRun: Omit<Run, "id">) => void;
  editRun: (updatedRun: Run) => void;
  deleteRun: (runId: string) => void;
}

const RunsContext = createContext<RunsContextType | undefined>(undefined);

export const RunsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [runs, setRuns] = useState<Run[]>([]);

  useEffect(() => {
    const loadRuns = () => {
      if (isLoaded && user) {
        setRuns(storage.getRuns(user.id));
      }
    };
    loadRuns();
    window.addEventListener("appDataRefresh", loadRuns);
    return () => window.removeEventListener("appDataRefresh", loadRuns);
  }, [user, isLoaded]);

  const addRun = (newRunData: Omit<Run, "id">) => {
    if (!user) return;
    const newRun: Run = { ...newRunData, id: crypto.randomUUID() };
    const updatedRuns = [newRun, ...runs];
    setRuns(updatedRuns);
    storage.saveRuns(updatedRuns, user.id);
  };

  const editRun = (updatedRun: Run) => {
    if (!user) return;
    const updatedRuns = runs.map((run) => (run.id === updatedRun.id ? updatedRun : run));
    setRuns(updatedRuns);
    storage.saveRuns(updatedRuns, user.id);
  };

  const deleteRun = (runId: string) => {
    if (!user) return;
    const updatedRuns = runs.filter((run) => run.id !== runId);
    setRuns(updatedRuns);
    storage.saveRuns(updatedRuns, user.id);
  };

  return (
    <RunsContext.Provider value={{ runs, addRun, editRun, deleteRun }}>
      {children}
    </RunsContext.Provider>
  );
};

export const useRuns = () => {
  const context = useContext(RunsContext);
  if (context === undefined) {
    throw new Error("useRuns must be used within a RunsProvider");
  }
  return context;
};

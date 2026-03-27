import React, { createContext, useContext, ReactNode } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Run } from "@/types";
import { Id } from "@/convex/_generated/dataModel";

interface RunsContextType {
  runs: Run[];
  addRun: (newRun: Omit<Run, "id">) => void;
  editRun: (updatedRun: Run) => void;
  deleteRun: (runId: string) => void;
  isLoading: boolean;
}

const RunsContext = createContext<RunsContextType | undefined>(undefined);

export const RunsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const userId = isLoaded && user ? user.id : undefined;

  // Convex reactive query — returns undefined while loading, then the data
  const convexRuns = useQuery(
    api.runs.getByUser,
    userId ? { userId } : "skip"
  );

  const addMutation = useMutation(api.runs.add);
  const editMutation = useMutation(api.runs.edit);
  const removeMutation = useMutation(api.runs.remove);

  // Map Convex documents to the existing Run shape
  // Convex docs have _id (Id<"runs">) but our app uses `id: string`
  const runs: Run[] = (convexRuns ?? []).map((doc) => ({
    id: doc._id as string,
    date: doc.date,
    distance_m: doc.distance_m,
    total_time_sec: doc.total_time_sec,
    avg_speed_kmh: doc.avg_speed_kmh,
    max_speed_kmh: doc.max_speed_kmh,
    notes: doc.notes,
  }));

  const isLoading = convexRuns === undefined;

  const addRun = (newRunData: Omit<Run, "id">) => {
    if (!userId) return;
    addMutation({
      userId,
      date: newRunData.date,
      distance_m: newRunData.distance_m,
      total_time_sec: newRunData.total_time_sec,
      avg_speed_kmh: newRunData.avg_speed_kmh,
      max_speed_kmh: newRunData.max_speed_kmh,
      notes: newRunData.notes,
    });
  };

  const editRun = (updatedRun: Run) => {
    if (!userId) return;
    editMutation({
      id: updatedRun.id as Id<"runs">,
      date: updatedRun.date,
      distance_m: updatedRun.distance_m,
      total_time_sec: updatedRun.total_time_sec,
      avg_speed_kmh: updatedRun.avg_speed_kmh,
      max_speed_kmh: updatedRun.max_speed_kmh,
      notes: updatedRun.notes,
    });
  };

  const deleteRun = (runId: string) => {
    if (!userId) return;
    removeMutation({ id: runId as Id<"runs"> });
  };

  return (
    <RunsContext.Provider value={{ runs, addRun, editRun, deleteRun, isLoading }}>
      {children}
    </RunsContext.Provider>
  );
};

// It's a common pattern to export the consumer hook alongside the provider.
// eslint-disable-next-line react-refresh/only-export-components
export const useRuns = () => {
  const context = useContext(RunsContext);
  if (context === undefined) {
    throw new Error("useRuns must be used within a RunsProvider");
  }
  return context;
};

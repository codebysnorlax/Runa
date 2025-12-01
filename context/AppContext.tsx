import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Profile, Run, Goal, InsightsData } from '../types';
import * as storage from '../services/storageService';

interface AppContextType {
  profile: Profile | null;
  runs: Run[];
  goals: Goal | null;
  insights: InsightsData | null;
  loading: boolean;
  currentUser: string | null;
  addRun: (newRun: Omit<Run, 'id'>) => void;
  editRun: (updatedRun: Run) => void;
  deleteRun: (runId: string) => void;
  updateGoals: (newGoals: Goal) => void;
  updateProfile: (newProfile: Profile) => void;
  updateInsights: (newInsights: InsightsData) => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [goals, setGoals] = useState<Goal | null>(null);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      const username = user.id;
      setCurrentUser(user.firstName || user.username || 'User');
      refreshUserData(username);
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [user, isLoaded]);

  const refreshUserData = (username: string) => {
    setLoading(true);
    const { profile, runs, goals, insights } = storage.initializeDefaults(username);
    setProfile(profile);
    setRuns(runs);
    setGoals(goals);
    setInsights(insights);
    setLoading(false);
  };
  
  const addRun = (newRunData: Omit<Run, 'id'>) => {
    if (!user) return;
    const newRun: Run = { ...newRunData, id: Date.now().toString() + Math.random().toString(36).substr(2, 9) };
    const updatedRuns = [newRun, ...runs];
    setRuns(updatedRuns);
    storage.saveRuns(updatedRuns, user.id);
  };

  const editRun = (updatedRun: Run) => {
    if (!user) return;
    const updatedRuns = runs.map(run => run.id === updatedRun.id ? updatedRun : run);
    setRuns(updatedRuns);
    storage.saveRuns(updatedRuns, user.id);
  };

  const deleteRun = (runId: string) => {
    if (!user) return;
    const updatedRuns = runs.filter(run => run.id !== runId);
    setRuns(updatedRuns);
    storage.saveRuns(updatedRuns, user.id);
  };

  const updateGoals = (newGoals: Goal) => {
    if (!user) return;
    setGoals(newGoals);
    storage.saveGoals(newGoals, user.id);
  };

  const updateProfile = (newProfile: Profile) => {
    if (!user) return;
    setProfile(newProfile);
    storage.saveProfile(newProfile, user.id);
  };
  
  const updateInsights = (newInsights: InsightsData) => {
    if (!user) return;
    setInsights(newInsights);
    storage.saveInsights(newInsights, user.id);
  };

  const refreshData = () => {
    if (user) {
      refreshUserData(user.id);
    }
  };

  return (
    <AppContext.Provider value={{ profile, runs, goals, insights, loading, currentUser, addRun, editRun, deleteRun, updateGoals, updateProfile, updateInsights, refreshData }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
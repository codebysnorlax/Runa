import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
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
  login: (username: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [goals, setGoals] = useState<Goal | null>(null);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const user = storage.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    } else {
      setLoading(false);
    }
  }, []);

  const refreshUserData = (username: string) => {
    setLoading(true);
    const { profile, runs, goals, insights } = storage.initializeDefaults(username);
    setProfile(profile);
    setRuns(runs);
    setGoals(goals);
    setInsights(insights);
    setLoading(false);
  };
  
  useEffect(() => {
    if (currentUser) {
      refreshUserData(currentUser);
    }
  }, [currentUser]);

  const login = (username: string) => {
    storage.setCurrentUser(username);
    setCurrentUser(username);
  };

  const logout = () => {
    storage.clearCurrentUser();
    setCurrentUser(null);
    setProfile(null);
    setRuns([]);
    setGoals(null);
    setInsights(null);
  };

  const addRun = (newRunData: Omit<Run, 'id'>) => {
    if (!currentUser) return;
    const newRun: Run = { ...newRunData, id: crypto.randomUUID() };
    const updatedRuns = [newRun, ...runs];
    setRuns(updatedRuns);
    storage.saveRuns(updatedRuns, currentUser);
  };

  const editRun = (updatedRun: Run) => {
    if (!currentUser) return;
    const updatedRuns = runs.map(run => run.id === updatedRun.id ? updatedRun : run);
    setRuns(updatedRuns);
    storage.saveRuns(updatedRuns, currentUser);
  };

  const deleteRun = (runId: string) => {
    if (!currentUser) return;
    const updatedRuns = runs.filter(run => run.id !== runId);
    setRuns(updatedRuns);
    storage.saveRuns(updatedRuns, currentUser);
  };

  const updateGoals = (newGoals: Goal) => {
    if (!currentUser) return;
    setGoals(newGoals);
    storage.saveGoals(newGoals, currentUser);
  };

  const updateProfile = (newProfile: Profile) => {
    if (!currentUser) return;
    setProfile(newProfile);
    storage.saveProfile(newProfile, currentUser);
  };
  
  const updateInsights = (newInsights: InsightsData) => {
    if (!currentUser) return;
    setInsights(newInsights);
    storage.saveInsights(newInsights, currentUser);
  };

  const refreshData = () => {
    if (currentUser) {
      refreshUserData(currentUser);
    }
  };

  return (
    <AppContext.Provider value={{ profile, runs, goals, insights, loading, currentUser, addRun, editRun, deleteRun, updateGoals, updateProfile, updateInsights, refreshData, login, logout }}>
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
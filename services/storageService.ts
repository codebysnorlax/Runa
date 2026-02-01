import { Profile, Run, Goal, InsightsData } from '../types';

const PROFILE_KEY = 'profile.json';
const RUNS_KEY = 'runs.json';
const GOALS_KEY = 'goals.json';
const INSIGHTS_KEY = 'insights.json';
const CURRENT_USER_KEY = 'currentUser';

// Helper to create a user-specific key
const userKey = (key: string, username: string) => `${username}-${key}`;

// Session management
export const getCurrentUser = (): string | null => window.localStorage.getItem(CURRENT_USER_KEY);
export const setCurrentUser = (username: string): void => window.localStorage.setItem(CURRENT_USER_KEY, username);
export const clearCurrentUser = (): void => window.localStorage.removeItem(CURRENT_USER_KEY);


const defaultProfile: Profile = {
  name: 'User',
  height_cm: 0,
  weight_kg: 0,
  age: 0,
};

const defaultRuns: Run[] = [];

const defaultGoals: Goal = {
  weekly_distance_km: 0,
  weekly_runs: 0,
  distance_goals: [],
  start_date: new Date().toISOString(),
};

const defaultInsights: InsightsData = {
  insights: [],
  weeklyPlan: {
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: '',
  },
  improvementScore: 0,
};


export const loadJSON = <T,>(key: string, defaultValue: T, username: string, firstName?: string): T => {
  try {
    const item = window.localStorage.getItem(userKey(key, username));
    if (item) {
      const parsed = JSON.parse(item);
      // Handle case where profile name is default "User" and we have a firstName
      if (key === PROFILE_KEY && parsed.name === 'User' && firstName) {
        parsed.name = firstName;
      }
      return parsed;
    }
    // If it's a new user and we're loading the profile, set the name from firstName
    if (key === PROFILE_KEY && (defaultValue as any).name === 'User' && firstName) {
      (defaultValue as Profile).name = firstName;
    }
    return defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${userKey(key, username)}":`, error);
    return defaultValue;
  }
};

export const saveJSON = <T,>(key: string, data: T, username: string): void => {
  try {
    const serializedData = JSON.stringify(data);
    window.localStorage.setItem(userKey(key, username), serializedData);
  } catch (error) {
    console.error(`Error writing to localStorage key "${userKey(key, username)}":`, error);
  }
};

export const initializeDefaults = (username: string, firstName?: string): { profile: Profile; runs: Run[]; goals: Goal; insights: InsightsData } => {
  const profile = loadJSON<Profile>(PROFILE_KEY, { ...defaultProfile }, username, firstName);
  const runs = loadJSON<Run[]>(RUNS_KEY, defaultRuns, username);
  const goals = loadJSON<Goal>(GOALS_KEY, { ...defaultGoals }, username);
  const insights = loadJSON<InsightsData>(INSIGHTS_KEY, { ...defaultInsights }, username);

  saveJSON(PROFILE_KEY, profile, username);
  saveJSON(RUNS_KEY, runs, username);
  saveJSON(GOALS_KEY, goals, username);
  saveJSON(INSIGHTS_KEY, insights, username);

  return { profile, runs, goals, insights };
};

export const getProfile = (username: string) => loadJSON<Profile>(PROFILE_KEY, defaultProfile, username);
export const saveProfile = (data: Profile, username: string) => saveJSON(PROFILE_KEY, data, username);

export const getRuns = (username: string) => loadJSON<Run[]>(RUNS_KEY, defaultRuns, username);
export const saveRuns = (data: Run[], username: string) => saveJSON(RUNS_KEY, data, username);
export const addRun = (run: Run, username: string) => {
  const runs = getRuns(username);
  saveRuns([run, ...runs], username);
}

export const getGoals = (username: string) => loadJSON<Goal>(GOALS_KEY, defaultGoals, username);
export const saveGoals = (data: Goal, username: string) => saveJSON(GOALS_KEY, data, username);

export const getInsights = (username: string) => loadJSON<InsightsData>(INSIGHTS_KEY, defaultInsights, username);
export const saveInsights = (data: InsightsData, username: string) => saveJSON(INSIGHTS_KEY, data, username);

// Backup functionality
export const exportUserData = (username: string) => {
  const profile = getProfile(username);
  const runs = getRuns(username);
  const goals = getGoals(username);
  const insights = getInsights(username);

  const backupData = {
    username,
    exportDate: new Date().toISOString(),
    profile,
    runs,
    goals,
    insights
  };

  return JSON.stringify(backupData, null, 2);
};

export const downloadBackup = (username: string) => {
  const data = exportUserData(username);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `runa-backup-${username}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importUserData = (jsonData: string, username: string): boolean => {
  try {
    const backupData = JSON.parse(jsonData);

    if (!backupData.profile || !backupData.runs || !backupData.goals || !backupData.insights) {
      throw new Error('Invalid backup file format');
    }

    saveProfile(backupData.profile, username);
    saveRuns(backupData.runs, username);
    saveGoals(backupData.goals, username);
    saveInsights(backupData.insights, username);

    console.log('Data saved successfully for user:', username);
    console.log('Checking localStorage:', {
      profile: localStorage.getItem(`profile_${username}`),
      runs: localStorage.getItem(`runs_${username}`),
      goals: localStorage.getItem(`goals_${username}`),
      insights: localStorage.getItem(`insights_${username}`)
    });

    return true;
  } catch (error) {
    console.error('Error importing backup:', error);
    return false;
  }
};

export const recreateBackupFile = (username: string) => {
  const data = exportUserData(username);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `data.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

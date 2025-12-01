import { Run } from '../types';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalRuns: number;
  lastRunDate: string | null;
}

export const calculateStreak = (runs: Run[]): StreakData => {
  if (runs.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalRuns: 0, lastRunDate: null };
  }

  const sortedRuns = [...runs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const uniqueDates = [...new Set(sortedRuns.map(r => new Date(r.date).toDateString()))];
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  const lastRunDate = new Date(uniqueDates[0]);
  lastRunDate.setHours(0, 0, 0, 0);
  
  if (lastRunDate.getTime() === today.getTime() || lastRunDate.getTime() === yesterday.getTime()) {
    currentStreak = 1;
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i]);
      const prevDate = new Date(uniqueDates[i - 1]);
      const diffDays = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = new Date(uniqueDates[i]);
    const prevDate = new Date(uniqueDates[i - 1]);
    const diffDays = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  
  longestStreak = Math.max(longestStreak, currentStreak, 1);
  
  return {
    currentStreak,
    longestStreak,
    totalRuns: runs.length,
    lastRunDate: sortedRuns[0].date
  };
};

export const getHeatmapData = (runs: Run[], months: number = 3): { date: string; count: number }[] => {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setMonth(today.getMonth() - months);
  startDate.setHours(0, 0, 0, 0);
  
  const dateMap = new Map<string, number>();
  
  runs.forEach(run => {
    const runDate = new Date(run.date);
    if (runDate >= startDate) {
      const dateStr = runDate.toISOString().split('T')[0];
      dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
    }
  });
  
  const result: { date: string; count: number }[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split('T')[0];
    result.push({ date: dateStr, count: dateMap.get(dateStr) || 0 });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return result;
};

import { expect, test, describe } from 'vitest';
import { calculateStreak, getHeatmapData } from '@/utils/streakUtils';
import { Run } from '@/types';

describe('calculateStreak', () => {
  test('returns zeros for empty runs', () => {
    const result = calculateStreak([]);
    expect(result).toEqual({ currentStreak: 0, longestStreak: 0, totalRuns: 0, lastRunDate: null });
  });

  test('calculates correct streaks for consecutive days', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const runs: Run[] = [
      { id: '1', date: today.toISOString(), distance: 5, duration: 30, speed: 10, calories: 300, date_ms: today.getTime() },
      { id: '2', date: yesterday.toISOString(), distance: 5, duration: 30, speed: 10, calories: 300, date_ms: yesterday.getTime() },
    ];
    
    const result = calculateStreak(runs);
    expect(result.currentStreak).toBe(2);
    expect(result.longestStreak).toBe(2);
  });
});

describe('getHeatmapData', () => {
  test('returns data within the specified months', () => {
    const runs: Run[] = [];
    const heatmap = getHeatmapData(runs, 1);
    expect(heatmap.length).toBeGreaterThan(0);
  });
});

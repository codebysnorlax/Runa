import { useMemo } from 'react';
import { Run, Goal } from '@/types';

export const useAnalyticsData = (
  runs: Run[],
  goals: Goal | null,
  appliedTime: number | null,
  appliedDistRange: [number, number] | null
) => {
  const now = useMemo(() => Date.now(), [appliedTime]);
  const cutoff = appliedTime ? now - appliedTime * 86400000 : null;

  const chartData = useMemo(() => {
    return runs
      .map((run) => ({
        ...run,
        dateObj: new Date(run.date),
      }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
      .map((run) => ({
        name: run.dateObj.toLocaleDateString("en-IN"),
        pace:
          run.distance_m > 0
            ? run.total_time_sec / 60 / (run.distance_m / 1000)
            : 0,
        speed: run.avg_speed_kmh,
        distance: run.distance_m / 1000,
        time: run.total_time_sec / 60,
      }));
  }, [runs]);

  const filteredChartData = useMemo(() => {
    let filtered = runs;
    if (cutoff) {
      filtered = filtered.filter((run) => new Date(run.date).getTime() >= cutoff);
    }
    if (appliedDistRange) {
      filtered = filtered.filter((run) => run.distance_m >= appliedDistRange[0] && run.distance_m <= appliedDistRange[1]);
    }
    return filtered
      .map((run) => ({ ...run, dateObj: new Date(run.date) }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
      .map((run) => ({
        name: run.dateObj.toLocaleDateString("en-IN"),
        pace: run.distance_m > 0 ? run.total_time_sec / 60 / (run.distance_m / 1000) : 0,
        speed: run.avg_speed_kmh,
        distance: run.distance_m / 1000,
        time: run.total_time_sec / 60,
      }));
  }, [runs, cutoff, appliedDistRange]);

  const weeklyDistanceData = useMemo(() => {
    const weeks: {
      [key: string]: { distance: number; runs: number; avgPace: number };
    } = {};
    runs.forEach((run) => {
      const date = new Date(run.date);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date);
      monday.setDate(diff);
      const weekStart = monday.toLocaleDateString("en-IN");

      if (!weeks[weekStart])
        weeks[weekStart] = { distance: 0, runs: 0, avgPace: 0 };
      weeks[weekStart].distance += run.distance_m / 1000;
      weeks[weekStart].runs += 1;
      weeks[weekStart].avgPace +=
        run.distance_m > 0
          ? run.total_time_sec / 60 / (run.distance_m / 1000)
          : 0;
    });
    return Object.keys(weeks)
      .sort()
      .map((week) => ({
        name: week,
        distance: weeks[week].distance,
        runs: weeks[week].runs,
        avgPace: weeks[week].avgPace / weeks[week].runs,
        goal: goals?.weekly_distance_km || 0,
      }))
      .slice(-8);
  }, [runs, goals]);

  const monthlyData = useMemo(() => {
    const months: {
      [key: string]: { distance: number; runs: number; time: number };
    } = {};

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    months[currentMonthKey] = { distance: 0, runs: 0, time: 0 };

    runs.forEach((run) => {
      const date = new Date(run.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!months[monthKey])
        months[monthKey] = { distance: 0, runs: 0, time: 0 };
      months[monthKey].distance += run.distance_m / 1000;
      months[monthKey].runs += 1;
      months[monthKey].time += run.total_time_sec / 3600;
    });
    return Object.keys(months)
      .sort()
      .map((month) => ({
        name: month,
        distance: months[month].distance,
        runs: months[month].runs,
        time: months[month].time,
      }))
      .slice(-6);
  }, [runs]);

  const goalProgressData = useMemo(() => {
    if (!goals?.distance_goals?.length) return [];
    return goals.distance_goals.map((goal) => {
      const relevantRuns = runs.filter((run) => {
        const runDistKm = run.distance_m / 1000;
        return runDistKm >= goal.distance_km * 0.9 && runDistKm <= goal.distance_km * 1.1;
      });
      const bestTime =
        relevantRuns.length > 0
          ? Math.min(...relevantRuns.map((run) => run.total_time_sec))
          : 0;
      const targetSeconds = goal.target_time
        .split(":")
        .reduce((acc, time) => 60 * acc + +time, 0);
      const progress =
        bestTime > 0 ? Math.min((targetSeconds / bestTime) * 100, 100) : 0;

      return {
        name: goal.name,
        progress,
        best: bestTime / 60,
        target: targetSeconds / 60,
        distance: goal.distance_km,
      };
    });
  }, [runs, goals]);

  const performanceData = useMemo(() => {
    return chartData.map((item, index) => ({
      ...item,
      cumDistance: chartData
        .slice(0, index + 1)
        .reduce((sum, run) => sum + run.distance, 0),
      efficiency: item.speed / (item.pace || 1),
    }));
  }, [chartData]);

  const filteredPerformanceData = useMemo(() => {
    return filteredChartData.map((item, index) => ({
      ...item,
      cumDistance: filteredChartData.slice(0, index + 1).reduce((sum, run) => sum + run.distance, 0),
      efficiency: item.speed / (item.pace || 1),
    }));
  }, [filteredChartData]);

  return {
    chartData,
    filteredChartData,
    weeklyDistanceData,
    monthlyData,
    goalProgressData,
    performanceData,
    filteredPerformanceData
  };
};

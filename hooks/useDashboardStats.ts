import { useMemo } from 'react';
import { Run, Goal, PersonalRecords } from '../types';
import { calculateStreak, getHeatmapData, StreakData } from '../utils/streakUtils';

export interface DashboardStats {
    personalRecords: PersonalRecords;
    streakData: StreakData;
    heatmapData: { date: string; count: number }[];
    todayRun: Run | undefined;
    yesterdayRun: Run | undefined;
    currentWeekDistance: number;
    goalProgress: number;
    totalDistance: number;
    latestInsight: { id: string; title: string; content: string; type: string } | undefined;
}

const useDashboardStats = (
    runs: Run[],
    goals: Goal | null,
    insights?: { insights?: { id: string; title: string; content: string; type: string }[] } | null
): DashboardStats => {

    const personalRecords = useMemo<PersonalRecords>(() =>
        runs.reduce(
            (acc, run) => ({
                longestDistance: Math.max(acc.longestDistance, run.distance_m),
                longestDuration: Math.max(acc.longestDuration, run.total_time_sec),
                fastestAvgSpeed: Math.max(acc.fastestAvgSpeed, run.avg_speed_kmh),
            }),
            { longestDistance: 0, longestDuration: 0, fastestAvgSpeed: 0 }
        ), [runs]);

    const streakData = useMemo(() => calculateStreak(runs), [runs]);

    const heatmapData = useMemo(() => getHeatmapData(runs, 3), [runs]);

    const { todayRun, yesterdayRun } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        return {
            todayRun: runs.find(
                (run) => new Date(run.date).setHours(0, 0, 0, 0) === today.getTime()
            ),
            yesterdayRun: runs.find(
                (run) => new Date(run.date).setHours(0, 0, 0, 0) === yesterday.getTime()
            ),
        };
    }, [runs]);

    const { currentWeekDistance, goalProgress, totalDistance } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calculate current week (Monday to Sunday)
        const currentWeekStart = new Date(today);
        const dayOfWeek = currentWeekStart.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        currentWeekStart.setDate(currentWeekStart.getDate() + diff);
        currentWeekStart.setHours(0, 0, 0, 0);

        const currentWeekRuns = runs.filter((run) => {
            const runDate = new Date(run.date);
            runDate.setHours(0, 0, 0, 0);
            return runDate >= currentWeekStart && runDate <= today;
        });

        const weekDist = currentWeekRuns.reduce((sum, run) => sum + run.distance_m, 0) / 1000;

        const progress =
            goals && goals.weekly_distance_km > 0
                ? (weekDist / goals.weekly_distance_km) * 100
                : 0;

        const total = runs.reduce((sum, run) => sum + run.distance_m, 0) / 1000;

        return { currentWeekDistance: weekDist, goalProgress: progress, totalDistance: total };
    }, [runs, goals]);

    const latestInsight = useMemo(() => insights?.insights?.[0], [insights]);

    return {
        personalRecords,
        streakData,
        heatmapData,
        todayRun,
        yesterdayRun,
        currentWeekDistance,
        goalProgress,
        totalDistance,
        latestInsight,
    };
};

export default useDashboardStats;

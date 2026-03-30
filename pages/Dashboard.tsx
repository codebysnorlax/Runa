import React from "react";
import { useAppCore } from '@/context/AppCoreContext';
import { useProfile } from '@/context/ProfileContext';
import { useRuns } from '@/context/RunsContext';
import { useGoals } from '@/context/GoalsContext';
import { useInsights } from '@/context/InsightsContext';
import DashboardSkeleton from "@/components/DashboardSkeleton";

import StreakHeatmap from "@/components/StreakHeatmap";
import useDashboardStats from "@/hooks/useDashboardStats";
import { CalendarDays } from "lucide-react";

import { EmptyDashboard } from "@/components/dashboard/EmptyDashboard";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { WeeklyGoal } from "@/components/dashboard/WeeklyGoal";
import { TodayRun } from "@/components/dashboard/TodayRun";
import { LatestInsight } from "@/components/dashboard/LatestInsight";
import { PersonalRecords } from "@/components/dashboard/PersonalRecords";
import { RecentRuns } from "@/components/dashboard/RecentRuns";

const Dashboard: React.FC = () => {
  const { loading, currentUser } = useAppCore();
  const { profile, isLoading: profileLoading } = useProfile();
  const { runs, isLoading: runsLoading } = useRuns();
  const { goals, isLoading: goalsLoading } = useGoals();
  const { insights, isLoading: insightsLoading } = useInsights();

  const betaTextStyle = {
    fontFamily: 'Caveat, cursive',
  };

  // Always call hooks before any early returns (Rules of Hooks)
  const dashboardStats = useDashboardStats(runs, goals, insights);

  const isDataLoading = loading || runsLoading || profileLoading || goalsLoading || insightsLoading;
  if (isDataLoading) return <DashboardSkeleton />;

  const {
    personalRecords,
    streakData,
    heatmapData,
    todayRun,
    yesterdayRun,
    currentWeekDistance,
    goalProgress,
    totalDistance,
    latestInsight,
  } = dashboardStats;

  // ── Show onboarding when no runs ──
  if (runs.length === 0) {
    const hasProfile = !!(profile && profile.name && (profile.age > 0 || profile.height_cm > 0 || profile.weight_kg > 0));
    const hasGoals = !!(goals && (goals.weekly_distance_km > 0 || goals.weekly_runs > 0));
    return (
      <EmptyDashboard
        currentUser={currentUser || "Runner"}
        hasProfile={hasProfile}
        hasGoals={hasGoals}
      />
    );
  }

  // ── Normal dashboard with data ──

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 lg:pb-6 px-4 sm:px-0">
      {/* ── Header ── */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {getGreeting()}, {currentUser || "Runner"}!
          </h1>
          <span className="px-1.5 py-0 text-[11px] font-bold italic bg-brand-orange/20 text-brand-orange rounded border border-brand-orange/30" style={betaTextStyle}>Beta</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">Here's your fitness overview</p>
      </div>

      <StatsRow 
        totalDistance={totalDistance}
        runsCount={runs.length}
        currentWeekDistance={currentWeekDistance}
        currentStreak={streakData.currentStreak}
      />

      {/* ── Main Row: Goal | Today | Insight ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mb-4">
        <WeeklyGoal goals={goals} currentWeekDistance={currentWeekDistance} goalProgress={goalProgress} />
        <TodayRun todayRun={todayRun} yesterdayRun={yesterdayRun} />
        <LatestInsight latestInsight={latestInsight} />
      </div>

      {/* ── Bottom Row: Heatmap | Records ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-4">
        {/* Heatmap */}
        <div className="bg-transparent border border-dashed border-gray-700/50 rounded-2xl px-3.5 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-3 h-3 text-green-400" />
              <h2 className="text-[11px] font-bold text-white uppercase tracking-wide">Activity</h2>
            </div>
            <span className="text-[9px] text-gray-600">Last 3 months</span>
          </div>
          <StreakHeatmap data={heatmapData} />
        </div>

        <PersonalRecords personalRecords={personalRecords} longestStreak={streakData.longestStreak} />
      </div>

      <RecentRuns runs={runs} />
    </div>
  );
};

export default Dashboard;

import React, { useMemo, useEffect, useState, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import Card from "../components/Card";
import ProgressRing from "../components/ProgressRing";
import DashboardSkeleton from "../components/DashboardSkeleton";
import { useToast } from "../context/ToastContext";

import StreakHeatmap from "../components/StreakHeatmap";
import AnimatedNumber from "../components/AnimatedNumber";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Trophy,
  Zap,
  Clock,
  Route,
  Target,
  Activity,
  Flame,
  Award,
  ChevronRight,
  User,
  Footprints,
  BarChart3,
  Brain,
  CalendarDays,
  CheckCircle2,
  Circle,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Run, PersonalRecords } from "../types";
import { calculateStreak, getHeatmapData } from "../utils/streakUtils";

/* ═══════════════════════════════════════════════════════
   Empty Dashboard — Clean Onboarding
   ═══════════════════════════════════════════════════════ */

const EmptyDashboard: React.FC<{
  currentUser: string;
  hasProfile: boolean;
  hasGoals: boolean;
}> = ({ currentUser, hasProfile, hasGoals }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const steps = [
    { title: "Profile", desc: "Add your details", icon: User, done: hasProfile, link: "#/settings", iconColor: "text-blue-400", bg: "from-blue-500/15 to-blue-600/5", border: "border-blue-500/25" },
    { title: "Goals", desc: "Set weekly targets", icon: Target, done: hasGoals, link: "#/settings", iconColor: "text-purple-400", bg: "from-purple-500/15 to-purple-600/5", border: "border-purple-500/25" },
    { title: "First Run", desc: "Record a run", icon: Footprints, done: false, link: "#/add-run", iconColor: "text-brand-orange", bg: "from-orange-500/15 to-orange-600/5", border: "border-orange-500/25" },
  ];

  const features = [
    { title: "Heatmap", icon: CalendarDays, color: "text-green-400" },
    { title: "AI Coach", icon: Brain, color: "text-purple-400" },
    { title: "Records", icon: Trophy, color: "text-yellow-400" },
    { title: "Analytics", icon: BarChart3, color: "text-cyan-400" },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-24 lg:pb-6 px-4 sm:px-0 space-y-5">
      {/* ── Hero ── */}
      <div className="relative border-2 border-dashed border-gray-700/60 rounded-2xl p-8 sm:p-12 text-center animate-fade-in">
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-orange/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-purple-500/8 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" style={{ animation: "pulse 3s ease-in-out infinite" }} />

        <div className="relative z-10">
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
            {getGreeting()}, {currentUser || "Runner"}!
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            Log your first run to unlock the full dashboard
          </p>

          <Link
            to="/add-run"
            className="inline-flex items-center gap-2 bg-brand-orange/80 text-white font-semibold py-2.5 px-6 rounded-xl hover:bg-brand-orange transition-colors duration-200"
          >
            <Footprints className="w-5 h-5" />
            Log Your First Run
          </Link>
        </div>
      </div>

      {/* ── Setup Steps ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 animate-slide-up">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <a
              key={step.title}
              href={step.link}
              className={`group rounded-xl bg-gradient-to-br ${step.bg} border ${step.border} p-4 flex items-center gap-3 transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className={`p-2 rounded-lg bg-gray-800/60 ${step.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-white group-hover:text-brand-orange transition-colors">{step.title}</p>
                  {step.done && <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
                </div>
                <p className="text-xs text-gray-400">{step.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-brand-orange group-hover:translate-x-1 transition-all" />
            </a>
          );
        })}
      </div>

      {/* ── What You'll Unlock ── */}
      <div className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">What you'll unlock</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="flex items-center gap-2.5 p-3 rounded-lg bg-gray-800/40 border border-gray-700/30">
                <Icon className={`w-4 h-4 ${f.color}`} />
                <span className="text-xs font-semibold text-gray-300">{f.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};



/* ═══════════════════════════════════════════════════════
   Main Dashboard
   ═══════════════════════════════════════════════════════ */

const Dashboard: React.FC = () => {
  const { profile, runs, goals, insights, loading, currentUser } =
    useAppContext();
  const { addToast } = useToast();
  const backupReminderShown = useRef(false);

  useEffect(() => {
    if (backupReminderShown.current) return;
    const lastBackupReminder = localStorage.getItem("lastBackupReminder");
    const today = new Date().toDateString();
    const hour = new Date().getHours();

    if (lastBackupReminder !== today && hour >= 6 && hour < 12) {
      addToast("💾 Backup your data in Settings", "success");
      localStorage.setItem("lastBackupReminder", today);
      backupReminderShown.current = true;
    }
  }, [addToast]);

  if (loading) return <DashboardSkeleton />;

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
  const personalRecords = runs.reduce(
    (acc, run) => ({
      longestDistance: Math.max(acc.longestDistance, run.distance_m),
      longestDuration: Math.max(acc.longestDuration, run.total_time_sec),
      fastestAvgSpeed: Math.max(acc.fastestAvgSpeed, run.avg_speed_kmh),
    }),
    { longestDistance: 0, longestDuration: 0, fastestAvgSpeed: 0 }
  );

  const streakData = calculateStreak(runs);
  const heatmapData = getHeatmapData(runs, 3);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const todayRun = runs.find(
    (run) => new Date(run.date).setHours(0, 0, 0, 0) === today.getTime()
  );
  const yesterdayRun = runs.find(
    (run) => new Date(run.date).setHours(0, 0, 0, 0) === yesterday.getTime()
  );

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

  const currentWeekDistance = currentWeekRuns.reduce((sum, run) => sum + run.distance_m, 0) / 1000;

  const goalProgress =
    goals && goals.weekly_distance_km > 0
      ? (currentWeekDistance / goals.weekly_distance_km) * 100
      : 0;
  const latestInsight = insights?.insights?.[0];

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const totalDistance =
    runs.reduce((sum, run) => sum + run.distance_m, 0) / 1000;

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-24 lg:pb-6 px-4 sm:px-0">

      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {getGreeting()}, {currentUser || "Runner"}!
          </h1>
          <span className="px-2 py-0.5 text-xs font-semibold bg-brand-orange/20 text-brand-orange rounded-full border border-brand-orange/30">BETA</span>
        </div>
        <p className="text-sm text-gray-400">Here's your fitness overview</p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-slide-up">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4 hover:scale-105 transition-transform h-full flex flex-col justify-center">
          <Route className="w-5 h-5 text-blue-400 mb-2" />
          <p className="text-xs text-gray-400 mb-1">Total Distance</p>
          <p className="text-xl sm:text-2xl font-bold text-white">
            <AnimatedNumber value={totalDistance} decimals={0} duration={1200} />
            <span className="text-xs ml-1">km</span>
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-4 hover:scale-105 transition-transform h-full flex flex-col justify-center">
          <Activity className="w-5 h-5 text-green-400 mb-2" />
          <p className="text-xs text-gray-400 mb-1">Total Runs</p>
          <p className="text-xl sm:text-2xl font-bold text-white">
            <AnimatedNumber value={runs.length} duration={1000} />
            <span className="text-xs ml-1">runs</span>
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4 hover:scale-105 transition-transform h-full flex flex-col justify-center">
          <Flame className="w-5 h-5 text-orange-400 mb-2" />
          <p className="text-xs text-gray-400 mb-1">This Week</p>
          <p className="text-xl sm:text-2xl font-bold text-white">
            <AnimatedNumber value={currentWeekDistance} decimals={0} duration={1200} />
            <span className="text-xs ml-1">km</span>
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-4 hover:scale-105 transition-transform h-full flex flex-col justify-center">
          <Zap className="w-5 h-5 text-yellow-400 mb-2" />
          <p className="text-xs text-gray-400 mb-1">Streak</p>
          <p className="text-xl sm:text-2xl font-bold text-white">
            <AnimatedNumber value={streakData.currentStreak} duration={1000} />
            <span className="text-xs ml-1">days</span>
          </p>
        </div>
      </div>

      {/* Focus Row: Goal, Today's Run, Insight */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6">

        {/* Weekly Goal - Spans 4 on Desktop */}
        <Card className="lg:col-span-4 h-full animate-scale-in !p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-orange-400 flex-shrink-0" />
            <h2 className="text-lg font-bold text-white">Weekly Goal</h2>
          </div>

          <div className="flex flex-col items-center flex-grow justify-center py-2">
            <div className="relative mb-6 w-40 h-40 flex items-center justify-center">
              <ProgressRing radius={70} stroke={10} progress={goalProgress} />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-lg font-bold text-white">
                  {Math.min(goalProgress, 100).toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="w-full space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Progress</span>
                <span className="font-bold text-white">
                  {currentWeekDistance.toFixed(1)} km
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Target</span>
                <span className="font-bold text-orange-400">
                  {goals?.weekly_distance_km || 0} km
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                <span className="text-gray-400">Remaining</span>
                <span className="font-bold text-white">
                  {Math.max(0, (goals?.weekly_distance_km || 0) - currentWeekDistance).toFixed(1)} km
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Today's Run - Spans 5 on Desktop */}
        <Card className="lg:col-span-5 h-full animate-slide-right flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Today's Run</h2>
            {todayRun && yesterdayRun && yesterdayRun.distance_m > 0 && (
              <div
                className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${todayRun.distance_m > yesterdayRun.distance_m
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
                  }`}
              >
                {todayRun.distance_m > yesterdayRun.distance_m ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(
                  ((todayRun.distance_m - yesterdayRun.distance_m) /
                    yesterdayRun.distance_m) *
                  100
                ).toFixed(0)}
                %
              </div>
            )}
          </div>

          <div className="flex-grow flex flex-col justify-center">
            {todayRun ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="text-center p-4 bg-gray-800/50 rounded-lg flex flex-col justify-center">
                  <Route className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 mb-1">Distance</p>
                  <p className="text-lg font-bold text-white">
                    {(todayRun.distance_m / 1000).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">km</p>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg flex flex-col justify-center">
                  <Clock className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 mb-1">Time</p>
                  <p className="text-lg font-bold text-white">
                    {formatDuration(todayRun.total_time_sec)}
                  </p>
                  <p className="text-xs text-gray-500">duration</p>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg flex flex-col justify-center col-span-2 sm:col-span-1">
                  <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 mb-1">Speed</p>
                  <p className="text-lg font-bold text-white">
                    {todayRun.avg_speed_kmh.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">km/h</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm mb-4">
                  No run logged today
                </p>
                <Link
                  to="/add-run"
                  className="inline-block bg-brand-orange hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm"
                >
                  Log Run
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* AI Insight - Spans 3 on Desktop */}
        <Card className="lg:col-span-3 h-full animate-slide-left flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">Insight</h2>
            </div>
            {latestInsight && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${latestInsight.type === "positive"
                  ? "bg-green-500/20 text-green-400"
                  : latestInsight.type === "negative"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-blue-500/20 text-blue-400"
                  }`}
              >
                {latestInsight.type}
              </span>
            )}
          </div>

          <div className="flex-grow flex flex-col">
            {latestInsight ? (
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-brand-orange font-bold mb-2 text-sm leading-tight">
                    {latestInsight.title}
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed mb-4 line-clamp-4">
                    {latestInsight.content}
                  </p>
                </div>
                <Link
                  to="/insights"
                  className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-semibold group self-start"
                >
                  View Details
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 flex flex-col items-center justify-center h-full">
                <p className="text-sm text-gray-400 mb-3">
                  Need coaching?
                </p>
                <Link
                  to="/insights"
                  className="inline-block bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm"
                >
                  Generate
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* History & Records Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6">

        {/* Heatmap & Recent Runs - Spans 8 */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6 flex flex-col h-full">
          {/* Heatmap */}
          <Card className="animate-slide-left">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-green-400" />
              <h2 className="text-lg font-bold text-white">Activity Heatmap</h2>
              <span className="text-xs text-gray-400 ml-auto">
                Last 3 months
              </span>
            </div>
            <StreakHeatmap data={heatmapData} />
          </Card>

          {/* Recent Runs List */}
          <Card className="animate-slide-up flex-grow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Recent Runs</h2>
              <Link
                to="/history"
                className="text-xs text-brand-orange hover:text-orange-400 font-semibold flex items-center gap-1"
              >
                View History <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {runs.slice(0, 4).map((run) => (
                <div
                  key={run.id}
                  className="flex items-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {new Date(run.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {run.notes || "No notes"}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-bold text-white">
                      {(run.distance_m / 1000).toFixed(2)} km
                    </p>
                    <p className="text-xs text-gray-400">
                      {run.avg_speed_kmh.toFixed(1)} km/h
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Personal Records - Spans 4 */}
        <Card className="lg:col-span-4 h-full animate-slide-left flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-bold text-white">Personal Records</h2>
          </div>

          <div className="space-y-4 flex-grow">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-full">
                  <Route className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Longest</p>
                  <p className="text-sm text-gray-300">Distance</p>
                </div>
              </div>
              <p className="text-xl font-bold text-white">
                {(personalRecords.longestDistance / 1000).toFixed(2)} <span className="text-sm font-normal text-gray-400">km</span>
              </p>
            </div>

            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-full">
                  <Clock className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Longest</p>
                  <p className="text-sm text-gray-300">Duration</p>
                </div>
              </div>
              <p className="text-xl font-bold text-white">
                {formatDuration(personalRecords.longestDuration)}
              </p>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-full">
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Top</p>
                  <p className="text-sm text-gray-300">Speed</p>
                </div>
              </div>
              <p className="text-xl font-bold text-white">
                {personalRecords.fastestAvgSpeed.toFixed(2)} <span className="text-sm font-normal text-gray-400">km/h</span>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;


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
      <div className="relative overflow-hidden border-2 border-dashed border-gray-700/60 rounded-2xl p-8 sm:p-12 text-center animate-fade-in">
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
    <div className="max-w-7xl mx-auto pb-24 lg:pb-6 px-4 sm:px-0">

      {/* ── Header ── */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {getGreeting()}, {currentUser || "Runner"}!
          </h1>
          <span className="px-1.5 py-0 text-[11px] font-bold italic bg-brand-orange/20 text-brand-orange rounded border border-brand-orange/30" style={{ fontFamily: "'Caveat', cursive" }}>Beta</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">Here's your fitness overview</p>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
        {[
          { label: "Distance", value: totalDistance, unit: "km", decimals: 0, icon: Route, color: "text-blue-400", accent: "border-blue-500/30", bg: "bg-blue-500/10" },
          { label: "Runs", value: runs.length, unit: "runs", decimals: 0, icon: Activity, color: "text-green-400", accent: "border-green-500/30", bg: "bg-green-500/10" },
          { label: "This Week", value: currentWeekDistance, unit: "km", decimals: 1, icon: Flame, color: "text-orange-400", accent: "border-orange-500/30", bg: "bg-orange-500/10" },
          { label: "Streak", value: streakData.currentStreak, unit: "days", decimals: 0, icon: Zap, color: "text-yellow-400", accent: "border-yellow-500/30", bg: "bg-yellow-500/10" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${s.bg} border ${s.accent} rounded-lg px-3.5 py-3 backdrop-blur-sm`}>
              <div className="flex items-center gap-1.5 mb-2">
                <Icon className={`w-3 h-3 ${s.color}`} />
                <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">{s.label}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-white leading-none">
                  <AnimatedNumber value={s.value} decimals={s.decimals} duration={1000} />
                </span>
                <span className="text-[11px] text-gray-400 font-medium">{s.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Row: Goal | Today | Insight ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mb-4">

        {/* Weekly Goal — progress bar */}
        <div className="bg-transparent border border-dashed border-gray-700/50 rounded-2xl px-3.5 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Target className="w-3 h-3 text-orange-400" />
              <h2 className="text-[11px] font-bold text-white uppercase tracking-wide">Weekly Goal</h2>
            </div>
            <span className="text-[11px] font-bold text-white">{Math.min(goalProgress, 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-700/50 rounded-full mb-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-orange to-orange-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(goalProgress, 100)}%` }} />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-500">Done</span>
              <span className="text-white font-medium">{currentWeekDistance.toFixed(1)} km</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-500">Target</span>
              <span className="text-orange-400 font-medium">{goals?.weekly_distance_km || 0} km</span>
            </div>
            <div className="flex justify-between text-[11px] pt-1 border-t border-gray-700/30">
              <span className="text-gray-500">Left</span>
              <span className="text-white font-medium">{Math.max(0, (goals?.weekly_distance_km || 0) - currentWeekDistance).toFixed(1)} km</span>
            </div>
          </div>
        </div>

        {/* Today's Run */}
        <div className="bg-transparent border border-dashed border-gray-700/50 rounded-2xl px-3.5 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Footprints className="w-3 h-3 text-blue-400" />
              <h2 className="text-[11px] font-bold text-white uppercase tracking-wide">Today's Run</h2>
            </div>
            {todayRun && yesterdayRun && yesterdayRun.distance_m > 0 && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${todayRun.distance_m > yesterdayRun.distance_m ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                {todayRun.distance_m > yesterdayRun.distance_m ? "↑" : "↓"}
                {Math.abs(((todayRun.distance_m - yesterdayRun.distance_m) / yesterdayRun.distance_m) * 100).toFixed(0)}%
              </span>
            )}
          </div>

          {todayRun ? (
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: (todayRun.distance_m / 1000).toFixed(2), unit: "km", color: "text-blue-400" },
                { val: formatDuration(todayRun.total_time_sec), unit: "time", color: "text-purple-400" },
                { val: todayRun.avg_speed_kmh.toFixed(1), unit: "km/h", color: "text-yellow-400" },
              ].map((m) => (
                <div key={m.unit} className="text-center py-2 bg-gray-900/50 rounded-md">
                  <p className="text-sm font-bold text-white">{m.val}</p>
                  <p className="text-[9px] text-gray-500 uppercase">{m.unit}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Activity className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-[11px] text-gray-500 mb-2">No run today</p>
              <Link to="/add-run" className="text-[11px] font-semibold text-brand-orange hover:text-orange-400 transition-colors">
                + Log Run
              </Link>
            </div>
          )}
        </div>

        {/* Latest Insight */}
        <div className="bg-transparent border border-dashed border-gray-700/50 rounded-2xl px-3.5 py-3 sm:col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Brain className="w-3 h-3 text-purple-400" />
              <h2 className="text-[11px] font-bold text-white uppercase tracking-wide">Insight</h2>
            </div>
            {latestInsight && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${latestInsight.type === "positive" ? "bg-green-500/20 text-green-400"
                : latestInsight.type === "negative" ? "bg-red-500/20 text-red-400"
                  : "bg-blue-500/20 text-blue-400"
                }`}>{latestInsight.type}</span>
            )}
          </div>

          {latestInsight ? (
            <div>
              <h3 className="text-brand-orange font-bold text-xs mb-1 leading-tight">{latestInsight.title}</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed mb-2 line-clamp-3">{latestInsight.content}</p>
              <Link to="/insights" className="inline-flex items-center gap-0.5 text-[10px] text-purple-400 hover:text-purple-300 font-semibold">
                View Details <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <Sparkles className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-[11px] text-gray-500 mb-2">No insights yet</p>
              <Link to="/insights" className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                Generate →
              </Link>
            </div>
          )}
        </div>
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

        {/* Personal Records */}
        <div className="bg-transparent border border-dashed border-gray-700/50 rounded-2xl px-3.5 py-3">
          <div className="flex items-center gap-1.5 mb-3">
            <Trophy className="w-3 h-3 text-yellow-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Personal Records</h2>
          </div>
          <div className="space-y-2">
            {[
              { label: "Distance", sub: "Longest", val: `${(personalRecords.longestDistance / 1000).toFixed(2)}`, unit: "km", icon: Route, bg: "bg-blue-500/10", border: "border-blue-500/15", color: "text-blue-400" },
              { label: "Duration", sub: "Longest", val: formatDuration(personalRecords.longestDuration), unit: "", icon: Clock, bg: "bg-purple-500/10", border: "border-purple-500/15", color: "text-purple-400" },
              { label: "Speed", sub: "Top", val: `${personalRecords.fastestAvgSpeed.toFixed(1)}`, unit: "km/h", icon: Zap, bg: "bg-yellow-500/10", border: "border-yellow-500/15", color: "text-yellow-400" },
              { label: "Streak", sub: "Highest", val: `${streakData.longestStreak}`, unit: "days", icon: Flame, bg: "bg-orange-500/10", border: "border-orange-500/15", color: "text-orange-400" },
            ].map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.label} className={`flex items-center justify-between p-2.5 ${r.bg} border ${r.border} rounded-lg`}>
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${r.color}`} />
                    <div>
                      <p className="text-[9px] text-gray-500 uppercase font-semibold">{r.sub}</p>
                      <p className="text-[11px] text-gray-300">{r.label}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-white">
                    {r.val}{r.unit && <span className="text-[10px] font-normal text-gray-500 ml-0.5">{r.unit}</span>}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Recent Runs ── */}
      <div className="bg-transparent border border-dashed border-gray-700/50 rounded-2xl px-3.5 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-green-400" />
            <h2 className="text-[11px] font-bold text-white uppercase tracking-wide">Recent Runs</h2>
          </div>
          <Link to="/history" className="text-[10px] text-brand-orange hover:text-orange-400 font-semibold flex items-center gap-0.5">
            View All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {runs.slice(0, 4).map((run) => (
            <div key={run.id} className="flex items-center justify-between p-2.5 bg-gray-900/40 rounded-md hover:bg-gray-900/60 transition-colors">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-white">
                  {new Date(run.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
                <p className="text-[10px] text-gray-500 truncate">{run.notes || "No notes"}</p>
              </div>
              <div className="text-right ml-2 flex-shrink-0">
                <p className="text-[11px] font-bold text-white">{(run.distance_m / 1000).toFixed(2)} km</p>
                <p className="text-[10px] text-gray-500">{run.avg_speed_kmh.toFixed(1)} km/h</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


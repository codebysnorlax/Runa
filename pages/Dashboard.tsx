import React, { useMemo, useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import Card from "../components/Card";
import ProgressRing from "../components/ProgressRing";
import DashboardSkeleton from "../components/DashboardSkeleton";
import Toast from "../components/Toast";

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
} from "lucide-react";
import { Link } from "react-router-dom";
import { Run, PersonalRecords } from "../types";
import { calculateStreak, getHeatmapData } from "../utils/streakUtils";

const Dashboard: React.FC = () => {
  const { profile, runs, goals, insights, loading, currentUser } =
    useAppContext();
  const [showBackupReminder, setShowBackupReminder] = useState(false);

  useEffect(() => {
    const lastBackupReminder = localStorage.getItem("lastBackupReminder");
    const today = new Date().toDateString();
    const hour = new Date().getHours();

    if (lastBackupReminder !== today && hour >= 6 && hour < 12) {
      setShowBackupReminder(true);
      localStorage.setItem("lastBackupReminder", today);
    }
  }, []);

  const personalRecords = useMemo<PersonalRecords | null>(() => {
    if (runs.length === 0) return null;
    return runs.reduce(
      (acc, run) => ({
        longestDistance: Math.max(acc.longestDistance, run.distance_m),
        longestDuration: Math.max(acc.longestDuration, run.total_time_sec),
        fastestAvgSpeed: Math.max(acc.fastestAvgSpeed, run.avg_speed_kmh),
      }),
      { longestDistance: 0, longestDuration: 0, fastestAvgSpeed: 0 }
    );
  }, [runs]);

  const streakData = useMemo(() => calculateStreak(runs), [runs]);
  const heatmapData = useMemo(() => getHeatmapData(runs, 3), [runs]);

  if (loading) return <DashboardSkeleton />;

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
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days, else go to Monday
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
      {showBackupReminder && (
        <Toast
          message="💾 Backup your data in Settings"
          type="success"
          onClose={() => setShowBackupReminder(false)}
        />
      )}

      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
          {getGreeting()}, {currentUser || "Runner"}!
        </h1>
        <p className="text-sm text-gray-400">Here's your fitness overview</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-slide-up">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4 hover:scale-105 transition-transform">
          <Route className="w-5 h-5 text-blue-400 mb-2" />
          <p className="text-xs text-gray-400 mb-1">Total Distance</p>
          <p className="text-xl sm:text-2xl font-bold text-white">
            <AnimatedNumber
              value={totalDistance}
              decimals={0}
              duration={1200}
            />
            <span className="text-xs ml-1">km</span>
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-4 hover:scale-105 transition-transform">
          <Activity className="w-5 h-5 text-green-400 mb-2" />
          <p className="text-xs text-gray-400 mb-1">Total Runs</p>
          <p className="text-xl sm:text-2xl font-bold text-white">
            <AnimatedNumber value={runs.length} duration={1000} />
            <span className="text-xs ml-1">runs</span>
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4 hover:scale-105 transition-transform">
          <Flame className="w-5 h-5 text-orange-400 mb-2" />
          <p className="text-xs text-gray-400 mb-1">This Week</p>
          <p className="text-xl sm:text-2xl font-bold text-white">
            <AnimatedNumber
              value={currentWeekDistance}
              decimals={0}
              duration={1200}
            />
            <span className="text-xs ml-1">km</span>
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-4 hover:scale-105 transition-transform">
          <Zap className="w-5 h-5 text-yellow-400 mb-2" />
          <p className="text-xs text-gray-400 mb-1">Streak</p>
          <p className="text-xl sm:text-2xl font-bold text-white">
            <AnimatedNumber value={streakData.currentStreak} duration={1000} />
            <span className="text-xs ml-1">days</span>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column - Main Content */}
        <div className="space-y-4 sm:space-y-6">
          {/* Today's Run */}
          <Card className="animate-slide-right">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Today's Run</h2>
              {todayRun && yesterdayRun && yesterdayRun.distance_m > 0 && (
                <div
                  className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                    todayRun.distance_m > yesterdayRun.distance_m
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

            {todayRun ? (
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <Route className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 mb-1">Distance</p>
                  <p className="text-lg font-bold text-white">
                    {(todayRun.distance_m / 1000).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">km</p>
                </div>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 mb-1">Time</p>
                  <p className="text-lg font-bold text-white">
                    {formatDuration(todayRun.total_time_sec)}
                  </p>
                  <p className="text-xs text-gray-500">duration</p>
                </div>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
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
          </Card>

          {/* AI Insight */}
          <Card className="animate-slide-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white">AI Insight</h2>
              </div>
              {latestInsight && (
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${
                    latestInsight.type === "positive"
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

            {latestInsight ? (
              <div>
                <h3 className="text-brand-orange font-bold mb-2">
                  {latestInsight.title}
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-4">
                  {latestInsight.content}
                </p>
                <Link
                  to="/insights"
                  className="inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 font-semibold group"
                >
                  View All{" "}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-400 mb-3">
                  Generate AI insights
                </p>
                <Link
                  to="/insights"
                  className="inline-block bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm"
                >
                  Generate
                </Link>
              </div>
            )}
          </Card>

          {/* Recent Runs */}
          <Card className="animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Recent Runs</h2>
              <Link
                to="/history"
                className="text-xs text-brand-orange hover:text-orange-400 font-semibold flex items-center gap-1"
              >
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {runs.length > 0 ? (
              <div className="space-y-2">
                {runs.slice(0, 4).map((run) => (
                  <div
                    key={run.id}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
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
                    <div className="text-right ml-4">
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
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-400 mb-3">No runs yet</p>
                <Link
                  to="/add-run"
                  className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm"
                >
                  Add First Run
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Weekly Goal */}
          <Card className="animate-scale-in !p-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <h2 className="text-lg font-bold text-white">Weekly Goal</h2>
            </div>

            <div className="flex flex-col items-center py-4">
              <div className="relative mb-6">
                <ProgressRing radius={70} stroke={10} progress={goalProgress} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl sm:text-3xl font-bold text-white">
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
                    {Math.max(
                      0,
                      (goals?.weekly_distance_km || 0) - currentWeekDistance
                    ).toFixed(1)}{" "}
                    km
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Personal Records */}
          {personalRecords && (
            <Card className="animate-slide-left">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-bold text-white">Records</h2>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Route className="w-4 h-4 text-blue-400" />
                    <p className="text-xs text-gray-400">Longest Distance</p>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {(personalRecords.longestDistance / 1000).toFixed(2)} km
                  </p>
                </div>

                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <p className="text-xs text-gray-400">Longest Duration</p>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {formatDuration(personalRecords.longestDuration)}
                  </p>
                </div>

                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <p className="text-xs text-gray-400">Fastest Speed</p>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {personalRecords.fastestAvgSpeed.toFixed(2)} km/h
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Activity Heatmap */}
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { generateInsightsAndPlan } from "../services/aiService";
import Card from "../components/Card";
import Skeleton from "../components/Skeleton";
import {
  Loader2,
  Zap,
  HeartPulse,
  ShieldCheck,
  ThumbsDown,
  Target,
  Lock,
  Sparkles,
  CheckCircle2,
  Circle,
  User,
  Footprints,
  ArrowRight,
  TrendingUp,
  Brain,
  BarChart3,
} from "lucide-react";
import { useToast } from "../context/ToastContext";

const AiInsightsSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <Skeleton className="h-9 w-1/3" />
      <Skeleton className="h-10 w-48" />
    </div>
    <Card className="flex items-center justify-between p-6">
      <div className="w-2/3 space-y-2">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-16 w-1/4" />
    </Card>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="space-y-3 p-6">
          <div className="flex items-start space-x-4">
            <Skeleton className="w-6 h-6 rounded-full" />
            <div className="w-full space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </Card>
      ))}
    </div>
    <Card>
      <Skeleton className="h-7 w-1/2 mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="space-y-2 p-3 bg-gray-800 rounded-md">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const GeneratingContentSkeleton: React.FC = () => (
  <div className="space-y-6">
    <Card className="flex items-center justify-between p-6">
      <div className="w-2/3 space-y-2">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-16 w-1/4" />
    </Card>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="space-y-3 p-6">
          <div className="flex items-start space-x-4">
            <Skeleton className="w-6 h-6 rounded-full" />
            <div className="w-full space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </Card>
      ))}
    </div>
    <Card>
      <Skeleton className="h-7 w-1/2 mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="space-y-2 p-3 bg-gray-800 rounded-md">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const AiInsights: React.FC = () => {
  const {
    runs,
    goals,
    profile,
    insights,
    updateInsights,
    loading: contextLoading,
  } = useAppContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  const [usageCount, setUsageCount] = useState(0);
  const [resetTime, setResetTime] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      const today = new Date().toDateString();
      const savedDate = localStorage.getItem("insightsDate");
      const savedCount = parseInt(localStorage.getItem("insightsCount") || "0");

      if (savedDate === today) {
        setUsageCount(savedCount);
      } else {
        // Reset count for new day
        localStorage.setItem("insightsDate", today);
        localStorage.setItem("insightsCount", "0");
        setUsageCount(0);
      }

      // Calculate reset time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const hours = Math.floor(
        (tomorrow.getTime() - Date.now()) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        ((tomorrow.getTime() - Date.now()) % (1000 * 60 * 60)) / (1000 * 60)
      );
      setResetTime(`${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = async () => {
    if (!profile || !goals || runs.length === 0) {
      addToast(
        "Complete your profile, set goals, and add at least one run to generate insights.",
        "error"
      );
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const newInsightsData = await generateInsightsAndPlan(
        runs,
        goals,
        profile
      );
      if (newInsightsData) {
        updateInsights(newInsightsData);
        addToast("Insights generated successfully!", "success");

        // Increment count on successful generation
        const today = new Date().toDateString();
        const savedDate = localStorage.getItem("insightsDate");

        if (savedDate === today) {
          const currentCount = parseInt(
            localStorage.getItem("insightsCount") || "0"
          );
          const newCount = currentCount + 1;
          localStorage.setItem("insightsCount", newCount.toString());
          setUsageCount(newCount);
        } else {
          // First use of the day
          localStorage.setItem("insightsDate", today);
          localStorage.setItem("insightsCount", "1");
          setUsageCount(1);
        }
      } else {
        setError(
          "AI service is currently unavailable. Please try again later."
        );
      }
    } catch (err: any) {
      if (err.message?.includes("API key")) {
        setError(
          "AI service configuration error. Please check API key settings."
        );
      } else if (
        err.message?.includes("network") ||
        err.message?.includes("fetch")
      ) {
        setError(
          "Network error. Please check your internet connection and try again."
        );
      } else if (
        err.message?.includes("quota") ||
        err.message?.includes("limit")
      ) {
        setError("AI service quota exceeded. Please try again later.");
      } else {
        setError(
          `AI service error: ${err.message || "Unknown error occurred. Please try again."
          }`
        );
      }
    }
    setIsGenerating(false);
  };

  const getInsightIcon = (type: "positive" | "negative" | "neutral") => {
    const iconClass = "w-5 h-5 flex-shrink-0";
    switch (type) {
      case "positive":
        return <ShieldCheck className={`${iconClass} text-emerald-400`} />;
      case "negative":
        return <ThumbsDown className={`${iconClass} text-rose-400`} />;
      case "neutral":
        return <HeartPulse className={`${iconClass} text-sky-400`} />;
      default:
        return <Zap className={`${iconClass} text-amber-400`} />;
    }
  };

  const insightTheme = (type: "positive" | "negative" | "neutral") => {
    switch (type) {
      case "positive":
        return { border: "border-dashed border-gray-700/50", bg: "bg-emerald-500/5", badge: "bg-emerald-500/15", accent: "from-emerald-500/20 via-transparent" };
      case "negative":
        return { border: "border-dashed border-gray-700/50", bg: "bg-rose-500/5", badge: "bg-rose-500/15", accent: "from-rose-500/20 via-transparent" };
      case "neutral":
        return { border: "border-dashed border-gray-700/50", bg: "bg-sky-500/5", badge: "bg-sky-500/15", accent: "from-sky-500/20 via-transparent" };
      default:
        return { border: "border-dashed border-gray-700/50", bg: "bg-gray-800/20", badge: "bg-gray-700/30", accent: "from-gray-500/20 via-transparent" };
    }
  };

  if (contextLoading) {
    return <AiInsightsSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-24 lg:pb-6 lg:px-4">

      <div className="px-4 lg:px-0">
        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-brand-orange/15">
              <Brain className="w-5 h-5 text-brand-orange" />
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-white truncate">
              AI Insights
            </h1>
            <span className="px-2 py-0 text-[12px] font-bold italic tracking-wider bg-purple-500/15 text-purple-400 rounded-full border border-purple-500/25" style={{ fontFamily: "'Caveat', cursive" }}>Beta</span>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || usageCount >= 2}
            className="group flex items-center justify-center bg-gradient-to-r from-brand-orange to-orange-600 text-white font-semibold py-2 px-4 sm:px-5 rounded-xl hover:shadow-lg hover:shadow-brand-orange/20 transition-all disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
            title={usageCount >= 2 ? "Daily limit reached" : ""}
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                <span className="hidden sm:inline">Generating...</span>
                <span className="sm:hidden">Gen...</span>
              </>
            ) : usageCount >= 2 ? (
              <>
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                <span className="hidden sm:inline">Resets in {resetTime}</span>
                <span className="sm:hidden">{resetTime}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 group-hover:rotate-12 transition-transform" />
                Generate
              </>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex items-center gap-1">
            {[0, 1].map((i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < usageCount ? 'bg-brand-orange' : 'bg-gray-700'}`} />
            ))}
          </div>
          <p className="text-[11px] text-gray-500">{usageCount}/2 used today · Resets in {resetTime}</p>
        </div>
      </div>

      {isGenerating ? (
        <GeneratingContentSkeleton />
      ) : (
        <>
          {insights && insights.improvementScore > 0 && (
            <div className="mx-4 lg:mx-0 rounded-2xl bg-gray-800/40 border border-dashed border-gray-700/50 p-5">
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <p className="text-5xl font-black text-white leading-none tracking-tight"
                    style={{ background: 'linear-gradient(135deg, #FF7A00, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                  >
                    {insights.improvementScore}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium mt-1 tracking-wide text-center">OUT OF 100</p>
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                    Improvement Score
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Based on your recent activity
                  </p>
                  <div className="mt-3 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-orange via-orange-400 to-purple-500"
                      style={{ width: `${insights.improvementScore}%`, transition: 'width 1s ease-out' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4 lg:px-0">
            {insights?.insights?.map((insight) => {
              const theme = insightTheme(insight.type);
              return (
                <div
                  key={insight.id}
                  className={`relative overflow-hidden rounded-xl ${theme.bg} border ${theme.border} p-4 hover:scale-[1.01] transition-all duration-200 group`}
                >
                  {/* Subtle left accent gradient */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${theme.accent}`} />
                  <div className="flex items-start gap-3 pl-2">
                    <div className={`p-2 rounded-lg ${theme.badge} flex-shrink-0 mt-0.5`}>
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white mb-1.5">
                        {insight.title}
                      </h3>
                      <p className="text-[13px] text-gray-400 leading-relaxed">
                        {insight.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {insights &&
            insights.weeklyPlan &&
            Object.values(insights.weeklyPlan).some((p) => p) && (
              <div className="px-4 lg:px-0">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-gray-500" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                    Weekly Training Plan
                  </h2>
                </div>
                {/* Mobile: Horizontal scroll */}
                <div className="flex gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory lg:hidden scrollbar-hide -mx-4 px-4">
                  {Object.entries(insights.weeklyPlan).map(([day, plan]) => {
                    const today = new Date()
                      .toLocaleDateString("en-US", { weekday: "long" })
                      .toLowerCase();
                    const isToday = day === today;
                    return (
                      <div
                        key={day}
                        className={`flex flex-col flex-shrink-0 w-40 rounded-xl overflow-hidden snap-start transition-all bg-gray-800/30 border border-dashed ${isToday
                          ? "border-brand-orange/50 shadow-lg shadow-brand-orange/10"
                          : "border-gray-700/50"
                          }`}
                      >
                        <div className={`px-3 py-2 text-center ${isToday
                          ? "bg-brand-orange/15"
                          : "bg-gray-700/40"
                          }`}>
                          <p className={`text-xs font-bold uppercase tracking-wider ${isToday ? "text-brand-orange" : "text-gray-300"
                            }`}>
                            {day.slice(0, 3)}
                          </p>
                        </div>
                        <div className="p-3 flex-1">
                          <p className="text-[11px] text-gray-300 leading-relaxed">
                            {plan || "Rest day 🧘"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Desktop: Grid */}
                <div className="hidden lg:grid grid-cols-7 gap-2.5">
                  {Object.entries(insights.weeklyPlan).map(([day, plan]) => {
                    const today = new Date()
                      .toLocaleDateString("en-US", { weekday: "long" })
                      .toLowerCase();
                    const isToday = day === today;
                    return (
                      <div
                        key={day}
                        className={`flex flex-col rounded-xl overflow-hidden transition-all border border-dashed ${isToday
                          ? "border-brand-orange/50 shadow-md shadow-brand-orange/10"
                          : "border-gray-700/50 hover:border-gray-600/60"
                          }`}
                      >
                        <div className={`px-3 py-2 text-center flex-shrink-0 ${isToday
                          ? "bg-brand-orange/15"
                          : "bg-gray-700/40"
                          }`}>
                          <p className={`text-xs font-bold uppercase tracking-wider ${isToday ? "text-brand-orange" : "text-gray-300"
                            }`}>
                            {day.slice(0, 3)}
                          </p>
                        </div>
                        <div className="p-3 flex-1 bg-gray-800/30">
                          <p className="text-[11px] text-gray-300 leading-relaxed">
                            {plan || "Rest day 🧘"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {error && (
            <Card className="mx-4 lg:mx-0">
              <div className="text-center py-12">
                <ThumbsDown className="w-16 h-16 mx-auto text-red-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  AI Service Error
                </h3>
                <p className="text-gray-400 mb-4">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-brand-orange hover:text-orange-400 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </Card>
          )}

          {!error && (!insights || insights?.insights?.length === 0) && (
            <div className="mx-4 lg:mx-0 space-y-6">
              {/* ── AI Coach Hero ── */}
              <div className="relative border-2 border-dashed border-gray-700/60 rounded-2xl p-8 sm:p-12 text-center">
                <div className="relative z-10">
                  {/* Sparkle icon cluster */}
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <Sparkles className="w-5 h-5 text-purple-400 opacity-60" />
                    <Brain className="w-10 h-10 text-purple-400" />
                    <Sparkles className="w-5 h-5 text-purple-400 opacity-60" />
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                    Your AI Running Coach
                  </h3>
                  <p className="text-sm text-gray-400 max-w-md mx-auto mb-3">
                    Get personalized insights, weekly training plans, and performance analysis powered by AI
                  </p>
                  <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 border border-gray-700/50 rounded-full">
                    Complete the steps below to activate
                  </span>
                </div>
              </div>

              {/* ── Dynamic Requirements Checklist ── */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-bold text-white">Requirements</h3>
                  <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
                    {[
                      !!(profile && profile.name && (profile.age > 0 || profile.height_cm > 0 || profile.weight_kg > 0)),
                      !!(goals && (goals.weekly_distance_km > 0 || goals.weekly_runs > 0)),
                      runs.length > 0,
                    ].filter(Boolean).length}/3
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(() => {
                    const hasProfile = !!(profile && profile.name && (profile.age > 0 || profile.height_cm > 0 || profile.weight_kg > 0));
                    const hasGoals = !!(goals && (goals.weekly_distance_km > 0 || goals.weekly_runs > 0));
                    const hasRuns = runs.length > 0;

                    const items = [
                      {
                        done: hasProfile,
                        icon: User,
                        title: "Complete Profile",
                        description: "Add your age, height, and weight",
                        link: "#/settings",
                        gradient: "from-blue-500/10 to-transparent",
                        border: "border-dashed border-gray-700/50",
                        iconColor: "text-blue-400",
                      },
                      {
                        done: hasGoals,
                        icon: Target,
                        title: "Set Goals",
                        description: "Define your weekly targets",
                        link: "#/settings",
                        gradient: "from-purple-500/10 to-transparent",
                        border: "border-dashed border-gray-700/50",
                        iconColor: "text-purple-400",
                      },
                      {
                        done: hasRuns,
                        icon: Footprints,
                        title: "Log a Run",
                        description: "Record at least one run",
                        link: "#/add-run",
                        gradient: "from-orange-500/10 to-transparent",
                        border: "border-dashed border-gray-700/50",
                        iconColor: "text-brand-orange",
                      },
                    ];

                    return items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={item.title}
                          href={item.link}
                          className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${item.gradient} border ${item.border} p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            {item.done ? (
                              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            )}
                            <div className={`p-1.5 rounded-lg bg-gray-800/60 ${item.iconColor}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <h4 className="text-sm font-bold text-white group-hover:text-brand-orange transition-colors">
                              {item.title}
                            </h4>
                          </div>
                          <p className="text-xs text-gray-400 ml-8">{item.description}</p>
                          <div className="mt-2 ml-8 flex items-center gap-1 text-[11px] font-semibold text-gray-500 group-hover:text-brand-orange transition-colors">
                            {item.done ? "Completed" : "Get Started"}
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </a>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* ── Feature Preview ── */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-gray-500" />
                  <h3 className="text-lg font-bold text-white">What You'll Get</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-green-500/5 to-transparent border border-dashed border-gray-700/50 p-4 sm:p-5 opacity-80 hover:opacity-100 transition-opacity">
                    <TrendingUp className="w-6 h-6 text-green-400 mb-3" />
                    <h4 className="text-sm font-bold text-white mb-1">Performance Insights</h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed">Detailed analysis of your speed, endurance, and improvement trends</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-blue-500/5 to-transparent border border-dashed border-gray-700/50 p-4 sm:p-5 opacity-80 hover:opacity-100 transition-opacity">
                    <BarChart3 className="w-6 h-6 text-blue-400 mb-3" />
                    <h4 className="text-sm font-bold text-white mb-1">Weekly Training Plan</h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed">AI-generated schedule tailored to your goals and fitness level</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-yellow-500/5 to-transparent border border-dashed border-gray-700/50 p-4 sm:p-5 opacity-80 hover:opacity-100 transition-opacity">
                    <Zap className="w-6 h-6 text-yellow-400 mb-3" />
                    <h4 className="text-sm font-bold text-white mb-1">Improvement Score</h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed">AI-rated metric tracking your overall running progression</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AiInsights;

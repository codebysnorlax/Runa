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
} from "lucide-react";
import Toast from "../components/Toast";

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
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
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
      setToast({
        message:
          "Complete your profile, set goals, and add at least one run to generate insights.",
        type: "error",
      });
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
        setToast({
          message: "Insights generated successfully!",
          type: "success",
        });

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
          `AI service error: ${
            err.message || "Unknown error occurred. Please try again."
          }`
        );
      }
    }
    setIsGenerating(false);
  };

  const getInsightIcon = (type: "positive" | "negative" | "neutral") => {
    switch (type) {
      case "positive":
        return <ShieldCheck className="w-6 h-6 text-green-400 flex-shrink-0" />;
      case "negative":
        return <ThumbsDown className="w-6 h-6 text-red-400 flex-shrink-0" />;
      case "neutral":
        return <HeartPulse className="w-6 h-6 text-blue-400 flex-shrink-0" />;
      default:
        return <Zap className="w-6 h-6 text-yellow-400 flex-shrink-0" />;
    }
  };

  const insightBgColor = (type: "positive" | "negative" | "neutral") => {
    switch (type) {
      case "positive":
        return "border-green-500/50";
      case "negative":
        return "border-red-500/50";
      case "neutral":
        return "border-blue-500/50";
      default:
        return "border-dark-border";
    }
  };

  if (contextLoading) {
    return <AiInsightsSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-24 lg:pb-6 lg:px-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="px-4 lg:px-0">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-white truncate">
              AI Insights
            </h1>
            <span className="px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold bg-brand-orange/20 text-brand-orange rounded-full border border-brand-orange/30 whitespace-nowrap">BETA</span>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || usageCount >= 2}
            className="flex items-center justify-center bg-brand-orange text-white font-semibold py-2 px-3 sm:px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
            title={usageCount >= 2 ? "Daily limit reached" : ""}
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                <span className="hidden sm:inline">Generating...</span>
                <span className="sm:hidden">Gen...</span>
              </>
            ) : usageCount >= 2 ? (
              <>
                <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                <span className="hidden sm:inline">Resets in {resetTime}</span>
                <span className="sm:hidden">{resetTime}</span>
              </>
            ) : (
              <>
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                Generate
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">Daily usage: <span className="text-red-500 font-medium">{usageCount}/2</span> • Resets in {resetTime}</p>
      </div>

      {isGenerating ? (
        <GeneratingContentSkeleton />
      ) : (
        <>
          {insights && insights.improvementScore > 0 && (
            <Card className="bg-gradient-to-br from-orange-500/10 to-purple-500/10 border border-orange-500/20 p-4 mx-4 lg:mx-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Improvement Score
                  </h2>
                  <p className="text-xs text-gray-500">
                    Based on recent activity
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-8 h-8 text-brand-orange" />
                  <div>
                    <p className="text-3xl font-bold text-white leading-none">
                      {insights.improvementScore}
                    </p>
                    <p className="text-xs text-gray-500">out of 100</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 lg:px-0">
            {insights?.insights?.map((insight) => (
              <Card
                key={insight.id}
                className={`border-l-4 ${insightBgColor(
                  insight.type
                )} hover:scale-[1.02] transition-transform`}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white mb-2">
                      {insight.title}
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {insight.content}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {insights &&
            insights.weeklyPlan &&
            Object.values(insights.weeklyPlan).some((p) => p) && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4 px-4 lg:px-0">
                  Weekly Training Plan
                </h2>
                {/* Mobile: Horizontal scroll - full width */}
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory lg:hidden scrollbar-hide">
                  {Object.entries(insights.weeklyPlan).map(([day, plan]) => {
                    const today = new Date()
                      .toLocaleDateString("en-US", { weekday: "long" })
                      .toLowerCase();
                    const isToday = day === today;
                    return (
                      <div
                        key={day}
                        className={`flex-shrink-0 w-40 p-3 bg-gray-800/50 rounded-lg border-2 transition-all snap-start first:ml-4 ${
                          isToday
                            ? "border-red-500"
                            : "border-gray-700 hover:border-brand-orange/50"
                        }`}
                        style={{ aspectRatio: '2/3' }}
                      >
                        <p className="font-semibold capitalize text-brand-orange mb-2 text-sm">
                          {day}
                        </p>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {plan || "Rest day"}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {/* Desktop: Grid */}
                <div className="hidden lg:grid grid-cols-7 gap-3">
                  {Object.entries(insights.weeklyPlan).map(([day, plan]) => {
                    const today = new Date()
                      .toLocaleDateString("en-US", { weekday: "long" })
                      .toLowerCase();
                    const isToday = day === today;
                    return (
                      <div
                        key={day}
                        className={`p-4 bg-gray-800/50 rounded-lg border-2 transition-all ${
                          isToday
                            ? "border-red-500"
                            : "border-gray-700 hover:border-brand-orange/50"
                        }`}
                      >
                        <p className="font-semibold capitalize text-brand-orange mb-2 text-sm">
                          {day}
                        </p>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {plan || "Rest day"}
                        </p>
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
            <Card className="mx-4 lg:mx-0">
              <div className="text-center py-6 sm:py-8 px-4">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                  AI is Judging Your Silence
                </h3>
                <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 max-w-xs sm:max-w-md mx-auto px-2">
                  Your AI coach is sitting here, tapping its digital fingers, waiting for some data to roast you with insights
                </p>

                <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 max-w-xs sm:max-w-sm mx-auto mb-4 sm:mb-6">
                  <p className="text-sm text-gray-300 mb-2 sm:mb-3">What's missing:</p>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                    <div>• Complete your profile</div>
                    <div>• Set some goals</div>
                    <div>• Actually go for a run</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
                  <button
                    onClick={() => window.location.hash = '#/add-run'}
                    className="bg-brand-orange hover:bg-orange-600 text-white font-medium px-4 sm:px-6 py-3 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    Add First Run
                  </button>
                  <button
                    onClick={() => window.location.hash = '#/settings'}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 sm:px-6 py-3 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    Setup Profile
                  </button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default AiInsights;

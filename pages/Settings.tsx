import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Goal, Profile, DistanceGoal } from "../types";
import Card from "../components/Card";
import Skeleton from "../components/Skeleton";
import { useToast } from "../context/ToastContext";
import AudioHelp from "../components/AudioHelp";
import { AudioProvider } from "../context/AudioContext";
import {
  User,
  Target,
  Download,
  Upload,
  Database,
  Plus,
  Trash2,
  Info,
  Mail,
  MessageSquare,
  HelpCircle,
  Flame,
  Zap,
  TrendingUp,
  CheckCircle,
  Activity,
  Heart,
  Clock,
  AlertTriangle,
  AlertCircle,
  HeartCrack,
  Moon,
} from "lucide-react";
import * as storage from "../services/storageService";
import FeedbackStep, {
  FeedbackQuestion,
  UserResponse,
} from "../components/FeedbackStep";
import FeedbackSummary from "../components/FeedbackSummary";
import FAQ from "../components/FAQ";
import InfoPage from "./Info";
import { calculateStreak } from "../utils/streakUtils";

const SettingsSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto">
    <Skeleton className="h-9 w-1/2 mb-6" />
    <Card>
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    </Card>
  </div>
);

type ActiveTab = "profile" | "goals" | "backup" | "feedback" | "faq" | "info";

const Settings: React.FC = () => {
  const { user } = useUser();
  const {
    profile,
    goals,
    updateProfile,
    updateGoals,
    loading,
    currentUser,
    refreshData,
    runs,
  } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const params = new URLSearchParams(
      window.location.hash.split("?")[1] || "",
    );
    return (params.get("tab") as ActiveTab) || "profile";
  });

  const [profileState, setProfileState] = useState<Profile | null>(null);
  const [goalState, setGoalState] = useState<Goal | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Feedback state
  const [feedbackStep, setFeedbackStep] = useState(0);
  const [feedbackResponses, setFeedbackResponses] = useState<UserResponse[]>(
    [],
  );
  const [feedbackCompleted, setFeedbackCompleted] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [cooldownTimer, setCooldownTimer] = useState(0);
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);

  const FEEDBACK_QUESTIONS: FeedbackQuestion[] = [
    {
      id: 1,
      question: "How would you rate your overall experience with Runa?",
      type: "single-choice",
      options: ["Excellent", "Good", "Average", "Poor", "Very Poor"],
      icon: "rating",
    },
    {
      id: 2,
      question: "Which features do you use most often?",
      type: "multi-choice",
      options: [
        "Dashboard",
        "Add Run",
        "Analytics",
        "Goals Tracking",
        "Data Backup",
        "AI Insights",
      ],
      icon: "features",
    },
    {
      id: 3,
      question: "How easy is it to navigate and use the app?",
      type: "single-choice",
      options: ["Very Easy", "Easy", "Neutral", "Difficult", "Very Difficult"],
      icon: "experience",
    },
    {
      id: 4,
      question: "What improvements would you like to see?",
      type: "multi-choice",
      options: [
        "Better UI/UX",
        "More Analytics",
        "Social Features",
        "Mobile App",
        "Export Options",
        "Custom Goals",
      ],
      icon: "improvement",
    },
    {
      id: 5,
      question: "Any additional comments or suggestions?",
      type: "text",
      placeholder: "Share your thoughts, suggestions, or report any issues...",
      charLimit: 500,
      icon: "message",
    },
  ];

  const { addToast } = useToast();

  useEffect(() => {
    if (profile) {
      setProfileState(profile);
    }
    if (goals) {
      setGoalState({
        ...goals,
        distance_goals: goals.distance_goals || [],
      });
    }
  }, [profile, goals]);

  // Timer for rate limiting - updates every second
  useEffect(() => {
    // Initial check
    import("../services/telegramService").then(({ getRemainingCooldown }) => {
      setCooldownTimer(getRemainingCooldown());
    });

    // Update every second
    const interval = setInterval(async () => {
      const { getRemainingCooldown } =
        await import("../services/telegramService");
      const remaining = getRemainingCooldown();
      setCooldownTimer(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (profileState) {
      setProfileState({ ...profileState, [e.target.name]: e.target.value });
    }
  };

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (goalState) {
      setGoalState({ ...goalState, [e.target.name]: e.target.value });
    }
  };

  const addDistanceGoal = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (goalState) {
      const newGoal: DistanceGoal = {
        id: crypto.randomUUID(),
        distance_km: 1,
        target_time: "06:00",
        name: "New Goal",
      };
      setGoalState({
        ...goalState,
        distance_goals: [...goalState.distance_goals, newGoal],
      });
    }
  };

  const updateDistanceGoal = (
    id: string,
    field: keyof DistanceGoal,
    value: string | number,
  ) => {
    if (goalState) {
      setGoalState({
        ...goalState,

        distance_goals: goalState.distance_goals.map((goal) =>
          goal.id === id ? { ...goal, [field]: value } : goal,
        ),
      });
    }
  };

  const removeDistanceGoal = (
    id: string,
    e?: React.MouseEvent | React.TouchEvent,
  ) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (goalState) {
      setGoalState({
        ...goalState,
        distance_goals: goalState.distance_goals.filter(
          (goal) => goal.id !== id,
        ),
      });
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileState) {
      const finalProfile = {
        ...profileState,
        age: Number(profileState.age) || 0,
        height_cm: Number(profileState.height_cm) || 0,
        weight_kg: Number(profileState.weight_kg) || 0,
      };
      updateProfile(finalProfile);
      addToast("Profile updated successfully!", "success");
    }
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goalState) {
      const finalGoals = {
        ...goalState,
        weekly_distance_km: Number(goalState.weekly_distance_km) || 0,
        weekly_runs: Number(goalState.weekly_runs) || 0,
      };
      updateGoals(finalGoals);
      addToast("Goals updated successfully!", "success");
    }
  };

  const handleDownloadBackup = () => {
    if (user?.id) {
      storage.downloadBackup(user.id);
      addToast("Backup downloaded successfully!", "success");
    }
  };

  const handleRecreateDataFile = () => {
    if (user?.id) {
      storage.recreateBackupFile(user.id);
      addToast("data.json file created successfully!", "success");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      addToast("No file selected", "error");
      return;
    }
    if (!user?.id) {
      addToast("User not authenticated", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = storage.importUserData(content, user.id);
        if (success) {
          addToast("Data restored successfully! Reloading...", "success");
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          addToast("Failed to restore data. Invalid file format.", "error");
        }
      } catch (error) {
        addToast("Error reading file. Please try again.", "error");
      }
    };
    reader.onerror = () => {
      addToast("Failed to read file.", "error");
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Feedback handlers
  const handleFeedbackResponse = (
    questionId: number,
    answer: string | string[],
  ) => {
    setFeedbackResponses((prev) => {
      const filtered = prev.filter((r) => r.questionId !== questionId);
      return [...filtered, { questionId, answer }];
    });
  };

  const handleFeedbackNext = async () => {
    if (feedbackStep < FEEDBACK_QUESTIONS.length - 1) {
      setFeedbackStep((prev) => prev + 1);
    } else {
      // Check if at least one question is answered with non-empty value
      const hasValidResponse = feedbackResponses.some((r) => {
        if (Array.isArray(r.answer)) {
          return r.answer.length > 0;
        }
        return r.answer && r.answer.trim() !== "";
      });

      if (!hasValidResponse) {
        addToast(
          "Please answer at least one question before submitting",
          "error",
        );
        return;
      }

      // Check cooldown before attempting to send
      const { canSendFeedback } = await import("../services/telegramService");
      if (!canSendFeedback()) {
        addToast("Please wait before sending another feedback", "error");
        return;
      }

      // Send to Telegram with user info
      setFeedbackSubmitting(true);
      try {
        const { sendFeedbackToTelegram } =
          await import("../services/telegramService");
        const result = await sendFeedbackToTelegram(
          FEEDBACK_QUESTIONS,
          feedbackResponses,
          user,
        );

        if (result.success) {
          // Send confirmation email
          if (user?.primaryEmailAddress?.emailAddress && user?.fullName) {
            const { sendFeedbackConfirmation } =
              await import("../services/emailService");
            await sendFeedbackConfirmation(
              user.primaryEmailAddress.emailAddress,
              user.fullName || user.firstName || "User",
            );
          }
          setFeedbackCompleted(true);
          addToast(result.message, "success");
        } else {
          addToast(result.message, "error");
        }
      } catch (error) {
        addToast("Failed to send feedback. Please try again.", "error");
      } finally {
        setFeedbackSubmitting(false);
      }
    }
  };

  const handleFeedbackBack = () => {
    if (feedbackStep > 0) {
      setFeedbackStep((prev) => prev - 1);
    }
  };

  const handleFeedbackRestart = () => {
    setFeedbackResponses([]);
    setFeedbackStep(0);
    setFeedbackCompleted(false);
  };

  /* User Status Logic — must stay before early return to respect Rules of Hooks */
  const getUserStatus = (): {
    label: string;
    color: string;
    icon: React.ElementType;
  } => {
    if (!runs || runs.length === 0)
      return { label: "New Runner", color: "text-blue-400", icon: User };

    const sortedRuns = [...runs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate streak
    let streak = 0;
    let checkDate = new Date(today);
    const runDates = new Set(
      sortedRuns.map((r) => {
        const d = new Date(r.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      }),
    );

    while (runDates.has(checkDate.getTime())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // If no run today, check if yesterday started a streak
    if (streak === 0) {
      checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - 1);
      while (runDates.has(checkDate.getTime())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    const lastRunDate = new Date(sortedRuns[0].date);
    lastRunDate.setHours(0, 0, 0, 0);
    const daysSinceLastRun = Math.floor(
      (today.getTime() - lastRunDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Get last 7 days activity
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRuns = runs.filter((r) => new Date(r.date) >= sevenDaysAgo);
    const runsThisWeek = recentRuns.length;

    // Get last 30 days for consistency check
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthRuns = runs.filter((r) => new Date(r.date) >= thirtyDaysAgo);
    const avgRunsPerWeek = (monthRuns.length / 30) * 7;

    // Priority 1: Active streaks (ran today)
    if (daysSinceLastRun === 0) {
      if (streak >= 30)
        return { label: "Legend", color: "text-purple-400", icon: Flame };
      if (streak >= 14)
        return { label: "On Fire", color: "text-orange-500", icon: Flame };
      if (streak >= 7)
        return { label: "Week Streak", color: "text-yellow-400", icon: Zap };
      if (streak >= 3)
        return {
          label: "Streak Pro",
          color: "text-green-400",
          icon: TrendingUp,
        };
      if (runsThisWeek >= 4)
        return { label: "Crushing It", color: "text-cyan-400", icon: Target };
      return {
        label: "Active Today",
        color: "text-green-300",
        icon: CheckCircle,
      };
    }

    // Priority 2: Recent activity (1-2 days ago)
    if (daysSinceLastRun === 1) {
      if (streak >= 7)
        return { label: "Streak Alive", color: "text-orange-400", icon: Flame };
      if (runsThisWeek >= 3)
        return { label: "Consistent", color: "text-green-400", icon: Heart };
      return { label: "Ran Yesterday", color: "text-lime-400", icon: Activity };
    }

    if (daysSinceLastRun === 2) {
      if (avgRunsPerWeek >= 4)
        return { label: "Time to Run", color: "text-yellow-400", icon: Clock };
      return { label: "2 Days Ago", color: "text-yellow-300", icon: Clock };
    }

    // Priority 3: Warning zone (3-7 days)
    if (daysSinceLastRun <= 7) {
      if (avgRunsPerWeek >= 3)
        return {
          label: "Getting Lazy",
          color: "text-orange-400",
          icon: AlertTriangle,
        };
      return {
        label: "Need Motivation",
        color: "text-orange-300",
        icon: AlertTriangle,
      };
    }

    // Priority 4: Inactive (7-14 days)
    if (daysSinceLastRun <= 14) {
      return {
        label: "Comeback Time",
        color: "text-red-400",
        icon: AlertCircle,
      };
    }

    // Priority 5: Very inactive (14-30 days)
    if (daysSinceLastRun <= 30) {
      return { label: "Lost Streak", color: "text-red-500", icon: HeartCrack };
    }

    // Priority 6: Dormant (30+ days)
    return { label: "Dormant", color: "text-gray-500", icon: Moon };
  };

  const getBMIStatus = (height: number, weight: number) => {
    if (!height || !weight) return null;
    const bmi = weight / Math.pow(height / 100, 2);
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-400" };
    if (bmi < 25) return { label: "Healthy", color: "text-green-400" };
    if (bmi < 30) return { label: "Overweight", color: "text-yellow-400" };
    return { label: "Obese", color: "text-red-400" };
  };

  const status = useMemo(() => getUserStatus(), [runs]);

  if (loading || !profileState || !goalState) {
    return <SettingsSkeleton />;
  }

  const StatusIcon = status.icon;
  const bmiStatus = profileState
    ? getBMIStatus(profileState.height_cm, profileState.weight_kg)
    : null;

  const TabButton: React.FC<{
    tab: ActiveTab;
    label: string;
    icon: React.ElementType;
  }> = ({ tab, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
        activeTab === tab
          ? "border-brand-orange text-white"
          : "border-transparent text-gray-400 hover:text-white hover:border-gray-500"
      }`}
    >
      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      <span className="text-xs sm:text-sm">{label}</span>
    </button>
  );

  return (
    <AudioProvider>
      <div
        className={`max-w-4xl mx-auto px-4 sm:px-6 ${activeTab === "feedback" ? "" : "pb-24"}`}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
          Settings
        </h1>

        <div className="border-b border-dark-border mb-4 sm:mb-6 overflow-x-auto">
          <div className="flex space-x-1 min-w-max">
            <TabButton tab="profile" label="Profile" icon={User} />
            <TabButton tab="goals" label="Goals" icon={Target} />
            <TabButton tab="backup" label="Backup" icon={Database} />
            <TabButton tab="feedback" label="Feedback" icon={MessageSquare} />
            <TabButton tab="faq" label="FAQ" icon={HelpCircle} />
            <TabButton tab="info" label="Info" icon={Info} />
          </div>
        </div>

        <div>
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSubmit} className="animate-fade-in">
              {/* Header with Save */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Profile
                </h3>
                <button
                  type="submit"
                  className="bg-brand-orange hover:bg-orange-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors"
                >
                  Save Profile
                </button>
              </div>
              {/* Profile Header with Avatar on Left, Stats on Right */}
              <div className="mb-6 p-4 sm:p-5 border border-dashed border-gray-700/50 rounded-2xl flex flex-col items-center">
                <div className="flex items-center gap-4 sm:gap-6 w-full mb-3">
                  {/* Avatar - Left Side */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-brand-orange via-orange-500 to-pink-500 p-0.5">
                      <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                        {user?.imageUrl ? (
                          <>
                            {!imageLoaded && (
                              <div className="absolute inset-0 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 animate-pulse">
                                <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                              </div>
                            )}
                            <img
                              src={user.imageUrl}
                              alt="Profile"
                              className="w-full h-full object-cover rounded-full"
                              onLoad={() => setImageLoaded(true)}
                              onError={() => setImageLoaded(false)}
                            />
                          </>
                        ) : (
                          <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
                            <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Status Dot */}
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-gray-900 ${status.label.includes("Streak") || status.label.includes("Active") ? "bg-green-500" : "bg-gray-500"}`}
                    />
                  </div>

                  {/* Stats - Right Side */}
                  <div className="flex-1 flex items-center justify-around">
                    <div className="text-center px-1 sm:px-2">
                      <div className="text-lg sm:text-2xl font-bold text-white">
                        {profileState.age || "—"}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-400">
                        Age
                      </div>
                    </div>
                    <div className="w-px h-8 bg-gray-700" />
                    <div className="text-center px-1 sm:px-2">
                      <div className="text-lg sm:text-2xl font-bold text-white">
                        {profileState.height_cm || "—"}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-400">
                        Height
                      </div>
                    </div>
                    <div className="w-px h-8 bg-gray-700" />
                    <div className="text-center px-1 sm:px-2">
                      <div className="text-lg sm:text-2xl font-bold text-white">
                        {profileState.weight_kg || "—"}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-400">
                        Weight
                      </div>
                    </div>
                    <div className="w-px h-8 bg-gray-700" />
                    <div className="text-center px-1 sm:px-2">
                      <div className="text-lg sm:text-2xl font-bold text-white">
                        {profileState.height_cm && profileState.weight_kg
                          ? (
                              profileState.weight_kg /
                              Math.pow(profileState.height_cm / 100, 2)
                            ).toFixed(1)
                          : "—"}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-400">
                        BMI
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Labels - Status Left, BMI Right */}
                <div className="w-full flex justify-between items-center px-1 mt-1">
                  <div
                    className={`flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-lg border border-dashed border-gray-700/50 ${status.color}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </div>
                  {bmiStatus && (
                    <div
                      className={`text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-lg border border-dashed border-gray-700/50 ${bmiStatus.color}`}
                    >
                      {bmiStatus.label}
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Inputs & Calendar Grid */}
              <div className="flex flex-col lg:flex-row gap-6 mb-6">
                {/* Input Fields */}
                <div className="flex-1 space-y-4">
                  {/* Name */}
                  <div className="rounded-xl p-4 border border-dashed border-gray-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-orange/15 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-brand-orange" />
                      </div>
                      <label className="text-[11px] text-gray-400 font-medium">
                        Name
                      </label>
                    </div>
                    <input
                      name="name"
                      type="text"
                      value={profileState.name}
                      onChange={handleProfileChange}
                      className="w-full bg-transparent border border-gray-700/50 rounded-lg px-3 py-2.5 text-white text-sm font-semibold focus:ring-1 focus:ring-brand-orange focus:border-brand-orange placeholder-gray-600"
                      placeholder="Enter your name"
                    />
                  </div>

                  {/* Age, Height, Weight */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div className="rounded-xl p-3 sm:p-4 border border-dashed border-gray-700/50 flex flex-col justify-center">
                      <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 mb-2">
                        <div className="flex-shrink-0 w-5 h-5 sm:w-7 sm:h-7 rounded-lg bg-transparent sm:bg-purple-500/15 flex items-center justify-center">
                          <Target className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-purple-400" />
                        </div>
                        <label className="text-[10px] sm:text-[11px] text-gray-400 font-medium whitespace-nowrap">
                          Age
                        </label>
                      </div>
                      <input
                        name="age"
                        type="number"
                        value={profileState.age || ""}
                        onChange={handleProfileChange}
                        className="w-full bg-transparent border-0 border-b border-gray-700/50 rounded-none px-1 py-1 text-white text-center sm:text-left text-lg sm:text-xl font-bold focus:ring-0 focus:border-brand-orange [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]"
                        placeholder="—"
                      />
                    </div>
                    <div className="rounded-xl p-3 sm:p-4 border border-dashed border-gray-700/50 flex flex-col justify-center">
                      <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 mb-2">
                        <div className="flex-shrink-0 w-5 h-5 sm:w-7 sm:h-7 rounded-lg bg-transparent sm:bg-blue-500/15 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-blue-400" />
                        </div>
                        <label className="text-[10px] sm:text-[11px] text-gray-400 font-medium whitespace-nowrap">
                          Height{" "}
                          <span className="text-gray-600 ml-0.5">cm</span>
                        </label>
                      </div>
                      <input
                        name="height_cm"
                        type="number"
                        value={profileState.height_cm || ""}
                        onChange={handleProfileChange}
                        className="w-full bg-transparent border-0 border-b border-gray-700/50 rounded-none px-1 py-1 text-white text-center sm:text-left text-lg sm:text-xl font-bold focus:ring-0 focus:border-brand-orange [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]"
                        placeholder="—"
                      />
                    </div>
                    <div className="rounded-xl p-3 sm:p-4 border border-dashed border-gray-700/50 flex flex-col justify-center">
                      <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 mb-2">
                        <div className="flex-shrink-0 w-5 h-5 sm:w-7 sm:h-7 rounded-lg bg-transparent sm:bg-green-500/15 flex items-center justify-center">
                          <Activity className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-green-400" />
                        </div>
                        <label className="text-[10px] sm:text-[11px] text-gray-400 font-medium whitespace-nowrap">
                          Weight{" "}
                          <span className="text-gray-600 ml-0.5">kg</span>
                        </label>
                      </div>
                      <input
                        name="weight_kg"
                        type="number"
                        value={profileState.weight_kg || ""}
                        onChange={handleProfileChange}
                        className="w-full bg-transparent border-0 border-b border-gray-700/50 rounded-none px-1 py-1 text-white text-center sm:text-left text-lg sm:text-xl font-bold focus:ring-0 focus:border-brand-orange [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]"
                        placeholder="—"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="rounded-xl p-4 border border-dashed border-gray-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-gray-500/15 flex items-center justify-center">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <label className="text-[11px] text-gray-400 font-medium">
                        Email in used
                      </label>
                    </div>
                    <input
                      type="text"
                      value={
                        user?.primaryEmailAddress?.emailAddress
                          ? (() => {
                              const email =
                                user.primaryEmailAddress.emailAddress;
                              const [localPart, domain] = email.split("@");

                              // For very short local parts (1-3 chars), show first char + stars
                              if (localPart.length <= 3) {
                                return `${localPart[0]}${"*".repeat(Math.max(3, localPart.length - 1))}@${domain}`;
                              }

                              // For medium length (4-8 chars), show 30% from start and end
                              if (localPart.length <= 8) {
                                const visibleChars = Math.max(
                                  1,
                                  Math.floor(localPart.length * 0.3),
                                );
                                const start = localPart.substring(
                                  0,
                                  visibleChars,
                                );
                                const end = localPart.substring(
                                  localPart.length - visibleChars,
                                );
                                const hiddenCount =
                                  localPart.length - visibleChars * 2;
                                return `${start}${"*".repeat(Math.max(2, hiddenCount))}${end}@${domain}`;
                              }

                              // For longer emails (9+ chars), show more context
                              const startChars = Math.max(
                                2,
                                Math.floor(localPart.length * 0.25),
                              );
                              const endChars = Math.max(
                                2,
                                Math.floor(localPart.length * 0.25),
                              );
                              const start = localPart.substring(0, startChars);
                              const end = localPart.substring(
                                localPart.length - endChars,
                              );
                              const hiddenCount =
                                localPart.length - (startChars + endChars);

                              return `${start}${"*".repeat(Math.max(4, hiddenCount))}${end}@${domain}`;
                            })()
                          : ""
                      }
                      className="w-full bg-transparent border border-gray-700/50 rounded-lg px-3 py-2.5 text-gray-400 text-sm font-semibold cursor-not-allowed opacity-80"
                    />{" "}
                  </div>
                </div>

                {/* Activity Calendar Block */}
                <div className="w-full lg:w-[320px] flex-shrink-0">
                  {(() => {
                    const realToday = new Date();
                    let minOffset = 0;
                    const maxOffset = 1;
                    if (runs && runs.length > 0) {
                      const earliestRunTime = Math.min(
                        ...runs.map((r: any) => new Date(r.date).getTime()),
                      );
                      const earliestRun = new Date(earliestRunTime);
                      const diff =
                        (earliestRun.getFullYear() - realToday.getFullYear()) *
                          12 +
                        (earliestRun.getMonth() - realToday.getMonth());
                      minOffset = Math.min(0, diff);
                    }
                    const viewDate = new Date(
                      realToday.getFullYear(),
                      realToday.getMonth() + calendarMonthOffset,
                      1,
                    );
                    const year = viewDate.getFullYear();
                    const month = viewDate.getMonth();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
                    const startOffset = firstDayOfMonth; // 0 for Sunday
                    const prevMonthDays = new Date(year, month, 0).getDate();

                    // Use shared streak utility instead of duplicating logic
                    const streakData = calculateStreak(runs);
                    const currentStreak = streakData.currentStreak;
                    const bestStreak = streakData.longestStreak;
                    let daysSinceLastRun: number | null = null;

                    const activeDaysThisMonth = new Set(
                      runs
                        .map((r: any) => new Date(r.date))
                        .filter(
                          (d: Date) =>
                            d.getMonth() === month && d.getFullYear() === year,
                        )
                        .map((d: Date) => d.getDate()),
                    );

                    if (runs.length > 0) {
                      const sortedRuns = [...runs].sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime(),
                      );
                      const lastRunDateObj = new Date(sortedRuns[0].date);
                      lastRunDateObj.setHours(0, 0, 0, 0);
                      const realTodayZero = new Date(realToday);
                      realTodayZero.setHours(0, 0, 0, 0);
                      daysSinceLastRun = Math.floor(
                        (realTodayZero.getTime() - lastRunDateObj.getTime()) /
                          (1000 * 60 * 60 * 24),
                      );
                      if (daysSinceLastRun < 0) daysSinceLastRun = 0;
                    }

                    const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

                    return (
                      <div className="h-full flex flex-col p-4 sm:p-4 border border-dashed border-gray-700/50 rounded-2xl bg-gray-900/40">
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <div className="text-gray-400 text-xs mb-0.5 leading-none font-medium">
                              {year}
                            </div>
                            <div className="text-white text-lg font-bold tracking-wide leading-tight">
                              {viewDate.toLocaleString("default", {
                                month: "long",
                              })}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 border border-gray-700/50 rounded-full p-0.5 bg-black/20">
                            <button
                              type="button"
                              onClick={() =>
                                setCalendarMonthOffset((p) =>
                                  Math.max(minOffset, p - 1),
                                )
                              }
                              disabled={calendarMonthOffset <= minOffset}
                              className={`p-1.5 rounded-full transition-colors ${calendarMonthOffset <= minOffset ? "text-gray-700 cursor-not-allowed" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 19l-7-7 7-7"
                                />
                              </svg>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setCalendarMonthOffset((p) =>
                                  Math.min(maxOffset, p + 1),
                                )
                              }
                              disabled={calendarMonthOffset >= maxOffset}
                              className={`p-1.5 rounded-full transition-colors ${calendarMonthOffset >= maxOffset ? "text-gray-700 cursor-not-allowed" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Weekday headers */}
                        <div className="grid grid-cols-7 gap-y-2 gap-x-1 mb-2">
                          {weekDays.map((day, idx) => (
                            <div
                              key={idx}
                              className="text-center text-[10px] uppercase tracking-wider font-semibold text-gray-500"
                            >
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-y-2 gap-x-1 mb-3 justify-items-center flex-1 content-start">
                          {Array.from({ length: startOffset }).map((_, i) => (
                            <div
                              key={`prev-${i}`}
                              className="w-7 h-7 sm:w-7 sm:h-7 flex items-center justify-center text-gray-700 text-[12px] font-medium"
                            >
                              {prevMonthDays - startOffset + i + 1}
                            </div>
                          ))}
                          {Array.from({ length: daysInMonth }).map((_, i) => {
                            const dayNum = i + 1;
                            const isToday =
                              dayNum === realToday.getDate() &&
                              month === realToday.getMonth() &&
                              year === realToday.getFullYear();
                            const isActive = activeDaysThisMonth.has(dayNum);

                            const borderClass = isToday
                              ? "border-red-500/70 hover:border-red-400"
                              : isActive
                                ? "border-orange-500/30 hover:border-orange-400"
                                : "border-gray-700/40 hover:border-gray-500";
                            const textClass = isToday
                              ? "text-red-400"
                              : isActive
                                ? "text-orange-400"
                                : "text-gray-300";
                            const bgClass = isToday
                              ? "bg-red-500/10"
                              : isActive
                                ? "bg-orange-500/5"
                                : "";

                            return (
                              <div
                                key={`day-${dayNum}`}
                                className={`relative w-7 h-7 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[12px] transition-all font-medium border border-dashed ${borderClass} ${textClass} ${bgClass}`}
                              >
                                {dayNum}
                                {isActive && (
                                  <Flame className="absolute -bottom-1 -right-0.5 w-[14px] h-[14px] text-brand-orange drop-shadow-[0_0_4px_rgba(255,107,0,0.8)] fill-brand-orange" />
                                )}
                              </div>
                            );
                          })}
                          {Array.from({
                            length: (7 - ((startOffset + daysInMonth) % 7)) % 7,
                          }).map((_, i) => (
                            <div
                              key={`next-${i}`}
                              className="w-7 h-7 sm:w-7 sm:h-7 flex items-center justify-center text-gray-700 text-[12px] font-medium"
                            >
                              {i + 1}
                            </div>
                          ))}
                        </div>

                        {/* Stats Footer */}
                        <div className="mt-auto flex flex-col gap-2 px-1 pt-3 border-t border-gray-800/60 w-full">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-[#f59e0b] shadow-[0_0_6px_rgba(245,158,11,0.5)]"></div>
                              <span className="text-gray-400 text-xs font-medium">
                                Current Streak
                              </span>
                              <span className="text-white text-sm font-bold ml-0.5">
                                {currentStreak}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-right">
                              <span className="text-white text-sm font-bold mr-0.5">
                                {bestStreak}
                              </span>
                              <span className="text-gray-400 text-xs font-medium">
                                Best
                              </span>
                              <Flame className="w-3 h-3 text-[#22c55e] drop-shadow-[0_0_6px_rgba(34,197,94,0.5)] fill-[#22c55e]" />
                            </div>
                          </div>

                          {daysSinceLastRun !== null && (
                            <div className="flex items-center justify-between bg-gray-800/40 rounded-lg p-2 border border-gray-700/30">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-blue-400" />
                                <span className="text-gray-400 text-[11px] font-medium">
                                  Gap
                                </span>
                              </div>
                              <span
                                className={`text-xs font-bold ${daysSinceLastRun === 0 ? "text-green-400" : daysSinceLastRun <= 2 ? "text-yellow-400" : "text-red-400"}`}
                              >
                                {daysSinceLastRun === 0
                                  ? "Ran Today"
                                  : `${daysSinceLastRun} day${daysSinceLastRun > 1 ? "s" : ""}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </form>
          )}
          {activeTab === "goals" && (
            <form
              onSubmit={handleGoalSubmit}
              className="space-y-5 animate-fade-in"
            >
              {/* Header with Save */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Weekly Targets
                </h3>
                <button
                  type="submit"
                  className="bg-brand-orange hover:bg-orange-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors"
                >
                  Save Goals
                </button>
              </div>
              {/* Weekly Targets */}
              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-transparent rounded-xl p-4 border border-dashed border-gray-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-orange/15 flex items-center justify-center">
                        <Activity className="w-3.5 h-3.5 text-brand-orange" />
                      </div>
                      <label className="text-[11px] text-gray-400 font-medium">
                        Distance (km)
                      </label>
                    </div>
                    <input
                      name="weekly_distance_km"
                      type="number"
                      step="0.1"
                      value={goalState.weekly_distance_km || ""}
                      onChange={handleGoalChange}
                      className="w-full bg-transparent border border-gray-700/50 rounded-lg px-3 py-2.5 text-white text-lg font-bold focus:ring-1 focus:ring-brand-orange focus:border-brand-orange"
                    />
                  </div>
                  <div className="bg-transparent rounded-xl p-4 border border-dashed border-gray-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <label className="text-[11px] text-gray-400 font-medium">
                        Running Days
                      </label>
                    </div>
                    <input
                      name="weekly_runs"
                      type="number"
                      min="0"
                      max="7"
                      value={goalState.weekly_runs || ""}
                      onChange={handleGoalChange}
                      className="w-full bg-transparent border border-gray-700/50 rounded-lg px-3 py-2.5 text-white text-lg font-bold focus:ring-1 focus:ring-brand-orange focus:border-brand-orange"
                    />
                  </div>
                </div>
              </div>

              {/* Distance Goals */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Distance Goals
                  </h3>
                  <p className="text-[10px] text-gray-600">
                    {(goalState.distance_goals || []).length} goal
                    {(goalState.distance_goals || []).length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {(goalState.distance_goals || []).map((goal) => (
                    <div
                      key={goal.id}
                      className="bg-transparent rounded-xl border border-dashed border-gray-700/50 overflow-hidden group relative"
                    >
                      {/* Colored top bar */}
                      <div className="h-1 bg-gradient-to-r from-brand-orange to-orange-400" />

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={(e) => removeDistanceGoal(goal.id, e)}
                        className="absolute top-2.5 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-all z-10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      <div className="p-3.5 space-y-3">
                        {/* Goal Name */}
                        <input
                          type="text"
                          value={goal.name}
                          onChange={(e) =>
                            updateDistanceGoal(goal.id, "name", e.target.value)
                          }
                          className="w-full bg-transparent border-none text-sm font-bold text-white p-0 focus:ring-0 placeholder-gray-600 truncate"
                          placeholder="Goal name"
                        />

                        {/* Distance */}
                        <div>
                          <label className="text-[9px] text-gray-500 uppercase tracking-wider block mb-1">
                            Distance
                          </label>
                          <div className="flex items-baseline gap-1">
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={goal.distance_km || ""}
                              onChange={(e) =>
                                updateDistanceGoal(
                                  goal.id,
                                  "distance_km",
                                  Number(e.target.value),
                                )
                              }
                              className="w-full bg-transparent border border-gray-700/40 rounded-lg px-2.5 py-1.5 text-white text-sm font-semibold focus:ring-1 focus:ring-brand-orange focus:border-brand-orange"
                            />
                            <span className="text-[10px] text-gray-500 flex-shrink-0">
                              km
                            </span>
                          </div>
                        </div>

                        {/* Target Time */}
                        <div>
                          <label className="text-[9px] text-gray-500 uppercase tracking-wider block mb-1">
                            Target
                          </label>
                          <input
                            type="text"
                            value={goal.target_time}
                            onChange={(e) =>
                              updateDistanceGoal(
                                goal.id,
                                "target_time",
                                e.target.value,
                              )
                            }
                            className="w-full bg-transparent border border-gray-700/40 rounded-lg px-2.5 py-1.5 text-white text-sm font-semibold focus:ring-1 focus:ring-brand-orange focus:border-brand-orange"
                            placeholder="MM:SS"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Goal Card */}
                  <button
                    type="button"
                    onClick={(e) => addDistanceGoal(e)}
                    className="flex flex-col items-center justify-center min-h-[160px] rounded-xl border border-dashed border-gray-700/50 hover:border-brand-orange/40 hover:bg-gray-800/30 transition-all group/add cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-800 group-hover/add:bg-brand-orange/15 flex items-center justify-center transition-colors mb-2">
                      <Plus className="w-5 h-5 text-gray-500 group-hover/add:text-brand-orange transition-colors" />
                    </div>
                    <span className="text-xs text-gray-500 group-hover/add:text-gray-300 transition-colors">
                      Add Goal
                    </span>
                  </button>
                </div>

                <p className="text-[10px] text-gray-600 mt-3 flex items-center gap-1">
                  💡 e.g. 5K in 25:00, 10K in 50:00
                </p>
              </div>
            </form>
          )}
          {activeTab === "backup" && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Data Backup & Restore
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Keep your fitness data safe by creating backups and
                    restoring from previous saves.
                  </p>

                  <div className="space-y-4 mb-6">
                    <button
                      onClick={handleDownloadBackup}
                      className="w-full flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Backup
                    </button>

                    <button
                      onClick={handleRecreateDataFile}
                      className="w-full flex items-center justify-center bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                      <Database className="w-5 h-5 mr-2" />
                      Create data.json
                    </button>

                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Restore from Backup
                      </button>
                    </div>
                  </div>

                  <AudioHelp audioType="male" />
                </div>

                <div className="space-y-6">
                  <div className="bg-transparent border border-dashed border-gray-700/50 p-6 rounded-2xl">
                    <h4 className="text-white font-medium mb-4">
                      How it works:
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Download className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-white font-medium">
                            Download Backup
                          </div>
                          <div className="text-gray-400 text-sm">
                            Creates a timestamped backup file with all your data
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Database className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-white font-medium">
                            Create data.json
                          </div>
                          <div className="text-gray-400 text-sm">
                            Creates a simple "data.json" file for easy sharing
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Upload className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-white font-medium">Restore</div>
                          <div className="text-gray-400 text-sm">
                            Upload any backup file to restore your data
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <AudioHelp audioType="female" />
                </div>
              </div>
            </div>
          )}
          {activeTab === "feedback" && (
            <div className="animate-fade-in -mx-4 sm:-mx-6">
              {!feedbackCompleted ? (
                <FeedbackStep
                  question={FEEDBACK_QUESTIONS[feedbackStep]}
                  stepNumber={feedbackStep + 1}
                  totalSteps={FEEDBACK_QUESTIONS.length}
                  currentResponse={feedbackResponses.find(
                    (r) => r.questionId === FEEDBACK_QUESTIONS[feedbackStep].id,
                  )}
                  onResponse={handleFeedbackResponse}
                  onNext={handleFeedbackNext}
                  onBack={handleFeedbackBack}
                  onSkip={handleFeedbackNext}
                  cooldownTimer={cooldownTimer}
                  isSubmitting={feedbackSubmitting}
                />
              ) : (
                <FeedbackSummary
                  questions={FEEDBACK_QUESTIONS}
                  responses={feedbackResponses}
                  onRestart={handleFeedbackRestart}
                />
              )}
            </div>
          )}
          {activeTab === "faq" && <FAQ />}
          {activeTab === "info" && <InfoPage />}
        </div>
      </div>
    </AudioProvider>
  );
};

export default Settings;

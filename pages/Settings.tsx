import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Goal, Profile, DistanceGoal } from "../types";
import Card from "../components/Card";
import Skeleton from "../components/Skeleton";
import Toast from "../components/Toast";
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
  Github,
  Mail,
  BookOpen,
  Instagram,
  Twitter,
  Linkedin,
  Code,
  Shield,
  MessageSquare,
  HelpCircle,
  Coffee,
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
import FeedbackStep, { FeedbackQuestion, UserResponse } from "../components/FeedbackStep";
import FeedbackSummary from "../components/FeedbackSummary";
import FAQ from "../components/FAQ";

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
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");

  const [profileState, setProfileState] = useState<Profile | null>(null);
  const [goalState, setGoalState] = useState<Goal | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Feedback state
  const [feedbackStep, setFeedbackStep] = useState(0);
  const [feedbackResponses, setFeedbackResponses] = useState<UserResponse[]>([]);
  const [feedbackCompleted, setFeedbackCompleted] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [cooldownTimer, setCooldownTimer] = useState(0);

  const FEEDBACK_QUESTIONS: FeedbackQuestion[] = [
    {
      id: 1,
      question: "How would you rate your overall experience with Runa?",
      type: 'single-choice',
      options: ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor'],
      icon: 'rating'
    },
    {
      id: 2,
      question: "Which features do you use most often?",
      type: 'multi-choice',
      options: ['Dashboard', 'Add Run', 'Analytics', 'Goals Tracking', 'Data Backup', 'AI Insights'],
      icon: 'features'
    },
    {
      id: 3,
      question: "How easy is it to navigate and use the app?",
      type: 'single-choice',
      options: ['Very Easy', 'Easy', 'Neutral', 'Difficult', 'Very Difficult'],
      icon: 'experience'
    },
    {
      id: 4,
      question: "What improvements would you like to see?",
      type: 'multi-choice',
      options: ['Better UI/UX', 'More Analytics', 'Social Features', 'Mobile App', 'Export Options', 'Custom Goals'],
      icon: 'improvement'
    },
    {
      id: 5,
      question: "Any additional comments or suggestions?",
      type: 'text',
      placeholder: "Share your thoughts, suggestions, or report any issues...",
      charLimit: 500,
      icon: 'message'
    }
  ];

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

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
    import('../services/telegramService').then(({ getRemainingCooldown }) => {
      setCooldownTimer(getRemainingCooldown());
    });

    // Update every second
    const interval = setInterval(async () => {
      const { getRemainingCooldown } = await import('../services/telegramService');
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
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
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
    value: string | number
  ) => {
    if (goalState) {
      setGoalState({
        ...goalState,

        distance_goals: goalState.distance_goals.map((goal) =>
          goal.id === id ? { ...goal, [field]: value } : goal
        ),
      });
    }
  };

  const removeDistanceGoal = (
    id: string,
    e?: React.MouseEvent | React.TouchEvent
  ) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (goalState) {
      setGoalState({
        ...goalState,
        distance_goals: goalState.distance_goals.filter(
          (goal) => goal.id !== id
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
      setToast({ message: "Profile updated successfully!", type: "success" });
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
      setToast({ message: "Goals updated successfully!", type: "success" });
    }
  };

  const handleDownloadBackup = () => {
    if (user?.id) {
      storage.downloadBackup(user.id);
      setToast({ message: "Backup downloaded successfully!", type: "success" });
    }
  };

  const handleRecreateDataFile = () => {
    if (user?.id) {
      storage.recreateBackupFile(user.id);
      setToast({
        message: "data.json file created successfully!",
        type: "success",
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setToast({ message: "No file selected", type: "error" });
      return;
    }
    if (!user?.id) {
      setToast({ message: "User not authenticated", type: "error" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = storage.importUserData(content, user.id);
        if (success) {
          setToast({ message: "Data restored successfully! Reloading...", type: "success" });
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          setToast({
            message: "Failed to restore data. Invalid file format.",
            type: "error",
          });
        }
      } catch (error) {
        setToast({
          message: "Error reading file. Please try again.",
          type: "error",
        });
      }
    };
    reader.onerror = () => {
      setToast({
        message: "Failed to read file.",
        type: "error",
      });
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Feedback handlers
  const handleFeedbackResponse = (questionId: number, answer: string | string[]) => {
    setFeedbackResponses(prev => {
      const filtered = prev.filter(r => r.questionId !== questionId);
      return [...filtered, { questionId, answer }];
    });
  };

  const handleFeedbackNext = async () => {
    if (feedbackStep < FEEDBACK_QUESTIONS.length - 1) {
      setFeedbackStep(prev => prev + 1);
    } else {
      // Check if at least one question is answered with non-empty value
      const hasValidResponse = feedbackResponses.some(r => {
        if (Array.isArray(r.answer)) {
          return r.answer.length > 0;
        }
        return r.answer && r.answer.trim() !== '';
      });

      if (!hasValidResponse) {
        setToast({ message: "Please answer at least one question before submitting", type: "error" });
        return;
      }

      // Check cooldown before attempting to send
      const { canSendFeedback } = await import('../services/telegramService');
      if (!canSendFeedback()) {
        setToast({ message: "Please wait before sending another feedback", type: "error" });
        return;
      }

      // Send to Telegram with user info
      setFeedbackSubmitting(true);
      try {
        const { sendFeedbackToTelegram } = await import('../services/telegramService');
        const result = await sendFeedbackToTelegram(FEEDBACK_QUESTIONS, feedbackResponses, user);

        if (result.success) {
          // Send confirmation email
          if (user?.primaryEmailAddress?.emailAddress && user?.fullName) {
            const { sendFeedbackConfirmation } = await import('../services/emailService');
            await sendFeedbackConfirmation(
              user.primaryEmailAddress.emailAddress,
              user.fullName || user.firstName || 'User'
            );
          }
          setFeedbackCompleted(true);
          setToast({ message: result.message, type: "success" });
        } else {
          setToast({ message: result.message, type: "error" });
        }
      } catch (error) {
        setToast({ message: "Failed to send feedback. Please try again.", type: "error" });
      } finally {
        setFeedbackSubmitting(false);
      }
    }
  };

  const handleFeedbackBack = () => {
    if (feedbackStep > 0) {
      setFeedbackStep(prev => prev - 1);
    }
  };

  const handleFeedbackRestart = () => {
    setFeedbackResponses([]);
    setFeedbackStep(0);
    setFeedbackCompleted(false);
  };

  if (loading || !profileState || !goalState) {
    return <SettingsSkeleton />;
  }

  const TabButton: React.FC<{
    tab: ActiveTab;
    label: string;
    icon: React.ElementType;
  }> = ({ tab, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
        ? "border-brand-orange text-white"
        : "border-transparent text-gray-400 hover:text-white hover:border-gray-500"
        }`}
    >
      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      <span className="text-xs sm:text-sm">{label}</span>
    </button>
  );

  /* User Status Logic */
  const getUserStatus = (): { label: string; color: string; icon: React.ElementType } => {
    if (!runs || runs.length === 0) return { label: "New Runner", color: "text-blue-400", icon: User };

    const sortedRuns = [...runs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate streak
    let streak = 0;
    let checkDate = new Date(today);
    const runDates = new Set(sortedRuns.map(r => {
      const d = new Date(r.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }));
    
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
    const daysSinceLastRun = Math.floor((today.getTime() - lastRunDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Get last 7 days activity
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRuns = runs.filter(r => new Date(r.date) >= sevenDaysAgo);
    const runsThisWeek = recentRuns.length;
    
    // Get last 30 days for consistency check
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthRuns = runs.filter(r => new Date(r.date) >= thirtyDaysAgo);
    const avgRunsPerWeek = (monthRuns.length / 30) * 7;
    
    // Priority 1: Active streaks (ran today)
    if (daysSinceLastRun === 0) {
      if (streak >= 30) return { label: "Legend", color: "text-purple-400", icon: Flame };
      if (streak >= 14) return { label: "On Fire", color: "text-orange-500", icon: Flame };
      if (streak >= 7) return { label: "Week Streak", color: "text-yellow-400", icon: Zap };
      if (streak >= 3) return { label: "Streak Pro", color: "text-green-400", icon: TrendingUp };
      if (runsThisWeek >= 4) return { label: "Crushing It", color: "text-cyan-400", icon: Target };
      return { label: "Active Today", color: "text-green-300", icon: CheckCircle };
    }
    
    // Priority 2: Recent activity (1-2 days ago)
    if (daysSinceLastRun === 1) {
      if (streak >= 7) return { label: "Streak Alive", color: "text-orange-400", icon: Flame };
      if (runsThisWeek >= 3) return { label: "Consistent", color: "text-green-400", icon: Heart };
      return { label: "Ran Yesterday", color: "text-lime-400", icon: Activity };
    }
    
    if (daysSinceLastRun === 2) {
      if (avgRunsPerWeek >= 4) return { label: "Time to Run", color: "text-yellow-400", icon: Clock };
      return { label: "2 Days Ago", color: "text-yellow-300", icon: Clock };
    }
    
    // Priority 3: Warning zone (3-7 days)
    if (daysSinceLastRun <= 7) {
      if (avgRunsPerWeek >= 3) return { label: "Getting Lazy", color: "text-orange-400", icon: AlertTriangle };
      return { label: "Need Motivation", color: "text-orange-300", icon: AlertTriangle };
    }
    
    // Priority 4: Inactive (7-14 days)
    if (daysSinceLastRun <= 14) {
      return { label: "Comeback Time", color: "text-red-400", icon: AlertCircle };
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

  const status = getUserStatus();
  const StatusIcon = status.icon;
  const bmiStatus = profileState ? getBMIStatus(profileState.height_cm, profileState.weight_kg) : null;

  return (
    <AudioProvider>
      <div className={`max-w-4xl mx-auto px-4 sm:px-6 ${activeTab === 'feedback' ? '' : 'pb-24'}`}>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
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
              {/* Profile Header with Avatar on Left, Stats on Right */}
              <div className="mb-6 p-4 sm:p-5 bg-gray-800/50 border border-gray-700/50 rounded-2xl flex flex-col items-center">
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
                    <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-gray-900 ${status.label.includes("Streak") || status.label.includes("Active") ? "bg-green-500" : "bg-gray-500"}`} />
                  </div>

                  {/* Stats - Right Side */}
                  <div className="flex-1 flex items-center justify-around">
                    <div className="text-center px-1 sm:px-2">
                      <div className="text-lg sm:text-2xl font-bold text-white">{profileState.age || "—"}</div>
                      <div className="text-[10px] sm:text-xs text-gray-400">Age</div>
                    </div>
                    <div className="w-px h-8 bg-gray-700" />
                    <div className="text-center px-1 sm:px-2">
                      <div className="text-lg sm:text-2xl font-bold text-white">{profileState.height_cm || "—"}</div>
                      <div className="text-[10px] sm:text-xs text-gray-400">Height</div>
                    </div>
                    <div className="w-px h-8 bg-gray-700" />
                    <div className="text-center px-1 sm:px-2">
                      <div className="text-lg sm:text-2xl font-bold text-white">{profileState.weight_kg || "—"}</div>
                      <div className="text-[10px] sm:text-xs text-gray-400">Weight</div>
                    </div>
                    <div className="w-px h-8 bg-gray-700" />
                    <div className="text-center px-1 sm:px-2">
                      <div className="text-lg sm:text-2xl font-bold text-white">
                        {profileState.height_cm && profileState.weight_kg
                          ? (profileState.weight_kg / Math.pow(profileState.height_cm / 100, 2)).toFixed(1)
                          : "—"}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-400">BMI</div>
                    </div>
                  </div>
                </div>

                {/* Footer Labels - Status Left, BMI Right */}
                <div className="w-full flex justify-between items-center px-2">
                  <div className={`flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-gray-900/80 border border-gray-700/50 ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </div>
                  {bmiStatus && (
                    <div className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-gray-900/80 border border-gray-700/50 ${bmiStatus.color}`}>
                      {bmiStatus.label}
                    </div>
                  )}
                </div>
              </div>

              {/* Input Fields */}
              {/* Input Fields */}
              <div className="space-y-4 mb-6">
                {/* Name Input - Full Width */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <User className="w-4 h-4 text-brand-orange" />
                    Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    value={profileState.name}
                    onChange={handleProfileChange}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-xl p-3.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition-all duration-300"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Age, Height, Weight - Single Row */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2 truncate">
                      <Target className="w-4 h-4 text-brand-orange" />
                      Age
                    </label>
                    <input
                      name="age"
                      type="number"
                      value={profileState.age}
                      onChange={handleProfileChange}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-xl p-3.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition-all duration-300"
                      placeholder="Age"
                    />
                  </div>
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2 truncate">
                      <Code className="w-4 h-4 text-brand-orange" />
                      Height
                    </label>
                    <input
                      name="height_cm"
                      type="number"
                      value={profileState.height_cm}
                      onChange={handleProfileChange}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-xl p-3.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition-all duration-300"
                      placeholder="cm"
                    />
                  </div>
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2 truncate">
                      <Database className="w-4 h-4 text-brand-orange" />
                      Weight
                    </label>
                    <input
                      name="weight_kg"
                      type="number"
                      value={profileState.weight_kg}
                      onChange={handleProfileChange}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-xl p-3.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition-all duration-300"
                      placeholder="kg"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full relative group overflow-hidden bg-gradient-to-r from-brand-orange to-orange-600 text-white font-bold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5" />
                  Save Profile
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </button>
            </form>
          )}
          {activeTab === "goals" && (
            <form
              onSubmit={handleGoalSubmit}
              className="space-y-6 animate-fade-in"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Weekly Distance Target (km)
                  </label>
                  <input
                    name="weekly_distance_km"
                    type="number"
                    step="0.1"
                    value={goalState.weekly_distance_km || 0}
                    onChange={handleGoalChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-brand-orange focus:border-brand-orange"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Weekly Running Days
                  </label>
                  <input
                    name="weekly_runs"
                    type="number"
                    min="0"
                    max="7"
                    value={goalState.weekly_runs || 0}
                    onChange={handleGoalChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-brand-orange focus:border-brand-orange"
                  />
                </div>
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                  <h3 className="text-base sm:text-lg font-medium text-white">
                    Distance Goals
                  </h3>
                  <button
                    type="button"
                    onClick={(e) => addDistanceGoal(e)}
                    className="flex items-center justify-center bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-green-600 active:scale-95 transition-all duration-200 shadow-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add New Goal
                  </button>
                </div>

                {(goalState.distance_goals || []).length === 0 ? (
                  <div className="text-center py-6 bg-gray-800 rounded-lg border border-gray-700">
                    <Target className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No goals set</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(goalState.distance_goals || []).map((goal) => (
                      <div
                        key={goal.id}
                        className="bg-gray-800 p-3 rounded-lg border border-gray-700"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              value={goal.name}
                              onChange={(e) =>
                                updateDistanceGoal(
                                  goal.id,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-sm focus:ring-1 focus:ring-brand-orange focus:border-brand-orange"
                              placeholder="5K Run"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">
                              Distance (km)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={goal.distance_km}
                              onChange={(e) =>
                                updateDistanceGoal(
                                  goal.id,
                                  "distance_km",
                                  Number(e.target.value)
                                )
                              }
                              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-sm focus:ring-1 focus:ring-brand-orange focus:border-brand-orange"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">
                              Time (MM:SS)
                            </label>
                            <input
                              type="text"
                              value={goal.target_time}
                              onChange={(e) =>
                                updateDistanceGoal(
                                  goal.id,
                                  "target_time",
                                  e.target.value
                                )
                              }
                              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-sm focus:ring-1 focus:ring-brand-orange focus:border-brand-orange"
                              placeholder="25:00"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={(e) => removeDistanceGoal(goal.id, e)}
                              className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700 transition-colors flex items-center justify-center"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  💡 Set realistic goals like 5K in 25:00, 10K in 50:00
                </p>
              </div>

              <button
                type="submit"
                onTouchStart={() => { }}
                className="w-full bg-brand-orange text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 active:scale-95 transition-all duration-200 touch-manipulation"
              >
                Save Goals
              </button>
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
                    Keep your fitness data safe by creating backups and restoring
                    from previous saves.
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
                  <div className="bg-gray-800 p-6 rounded-lg">
                    <h4 className="text-white font-medium mb-4">How it works:</h4>
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
                  currentResponse={feedbackResponses.find(r => r.questionId === FEEDBACK_QUESTIONS[feedbackStep].id)}
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
          {activeTab === "info" && (
            <div className="space-y-6 animate-fade-in">
              {/* Developer Information */}
              <div className="space-y-4">
                <div className="flex flex-row justify-between items-center lg:grid lg:grid-cols-3 lg:gap-6 mb-4">
                  <div className="lg:col-span-2 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 flex-shrink-0">
                      <img
                        src="https://github.com/codebysnorlax.png"
                        alt="Ravi Ranjan Sharma"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-500 via-white via-gray-500 to-gray-500 animate-text-shine bg-[length:200%_auto]">
                      Developer
                    </h2>
                  </div>
                  <div className="flex justify-end lg:block lg:text-left">
                    <a
                      href="http://buymeacoffee.com/codebysnorlax"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative inline-flex group overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange"
                    >
                      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#FFD700_0%,#FFA500_50%,#FFD700_100%)]" />
                      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-brand-orange px-2 sm:px-3 py-0.5 text-lg sm:text-xl lg:text-2xl font-cookie font-medium text-white backdrop-blur-3xl transition-all group-hover:bg-orange-600 space-x-1 sm:space-x-2">
                        <Coffee className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="mt-0.5 sm:mt-1">Buy me a coffee</span>
                      </span>
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="lg:col-span-2">
                    <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                      Ravi Ranjan Sharma
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      A tech enthusiast passionate about building innovative
                      projects and crafting problem-solving software using
                      cutting-edge technologies.
                    </p>
                    <div className="space-y-2">
                      <h4 className="text-white font-medium text-sm sm:text-base">
                        Specializations:
                      </h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Full-stack Web Development | learning</li>
                        <li>• MERN Applications</li>
                        <li>• AI Integration & Modern UI/UX</li>
                        <li>• Problem-solving Software Solutions</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 lg:mt-0">
                    <h4 className="text-white font-medium mb-3 text-sm sm:text-base">
                      Connect
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
                      <a
                        href="https://github.com/codebysnorlax"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-gray-300 hover:text-brand-orange transition-colors"
                      >
                        <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-xs sm:text-sm">GitHub</span>
                      </a>
                      <a
                        href="mailto:codebysnorlax@gmail.com"
                        className="flex items-center space-x-2 text-gray-300 hover:text-brand-orange transition-colors"
                      >
                        <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-xs sm:text-sm">Email</span>
                      </a>
                      <a
                        href="https://www.notion.so/Cohort-26-2f017cc30ca680beb217e0ab72262f79?source=copy_link"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-gray-300 hover:text-brand-orange transition-colors"
                      >
                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-xs sm:text-sm">Blogs</span>
                      </a>
                      <a
                        href="https://instagram.com/nr_snorlax"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-gray-300 hover:text-brand-orange transition-colors"
                      >
                        <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-xs sm:text-sm">Instagram</span>
                      </a>
                      <a
                        href="https://twitter.com/codebysnorlax"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-gray-300 hover:text-brand-orange transition-colors"
                      >
                        <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-xs sm:text-sm">Twitter</span>
                      </a>
                      <a
                        href="https://linkedin.com/in/codebysnorlax"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-gray-300 hover:text-brand-orange transition-colors"
                      >
                        <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-xs sm:text-sm">LinkedIn</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Software Information */}
              <div className="bg-gray-800 p-4 rounded-lg space-y-4">
                <div className="flex items-center space-x-3">
                  <Code className="w-5 h-5 sm:w-6 sm:h-6 text-brand-orange" />
                  <h2 className="text-lg sm:text-xl font-semibold text-white">
                    AI Fitness Tracker
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                      Purpose
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      AI-powered fitness tracker designed to monitor your running
                      progress, set personalized goals, and provide intelligent
                      insights into your performance.
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                      Key Features
                    </h3>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Track running sessions with detailed metrics</li>
                      <li>• Set and monitor fitness goals</li>
                      <li>• View analytics and performance trends</li>
                      <li>• AI-powered insights and recommendations</li>
                      <li>• Data backup and restore functionality</li>
                      <li>• Local storage for privacy</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* How to Use */}
              <div className="bg-gray-800 p-4 rounded-lg space-y-4">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-brand-orange" />
                  <h2 className="text-lg sm:text-xl font-semibold text-white">
                    How to Use
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                      Getting Started
                    </h3>
                    <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                      <li>Sign up or sign in with your email</li>
                      <li>
                        Set up your profile in Settings (age, height, weight)
                      </li>
                      <li>
                        Define your fitness goals (weekly distance, running days)
                      </li>
                      <li>Start adding your running sessions</li>
                    </ol>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                      Daily Usage
                    </h3>
                    <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                      <li>
                        Add runs via "Add Run" with distance, time, and notes
                      </li>
                      <li>View your progress on the Dashboard</li>
                      <li>Check Analytics for performance trends</li>
                      <li>Get AI insights for improvement suggestions</li>
                      <li>Backup your data regularly in Settings</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Privacy & Security */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-brand-orange" />
                  <h2 className="text-lg sm:text-xl font-semibold text-white">
                    Privacy & Security
                  </h2>
                </div>
                <div className="text-gray-300 text-sm space-y-2">
                  <p>
                    • Secure authentication powered by Clerk
                  </p>
                  <p>
                    • All your fitness data is stored locally in your browser
                  </p>
                  <p>• Your personal information never leaves your device</p>
                  <p>• Use the backup feature to save your data as JSON files</p>
                  <p>• Open source approach for transparency and trust</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AudioProvider>
  );
};

export default Settings;

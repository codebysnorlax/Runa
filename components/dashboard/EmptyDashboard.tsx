import React from "react";
import { Link } from "react-router-dom";
import {
  Target,
  User,
  Footprints,
  CalendarDays,
  Brain,
  Trophy,
  BarChart3,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export const EmptyDashboard: React.FC<{
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
        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">What you&apos;ll unlock</p>
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

import React from 'react';
import { Route, Activity, Flame, Zap } from 'lucide-react';
import AnimatedNumber from '@/components/AnimatedNumber';

interface StatsRowProps {
  totalDistance: number;
  runsCount: number;
  currentWeekDistance: number;
  currentStreak: number;
}

export const StatsRow: React.FC<StatsRowProps> = ({
  totalDistance, runsCount, currentWeekDistance, currentStreak
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
      {[
        { label: "Distance", value: totalDistance, unit: "km", decimals: 0, icon: Route, color: "text-blue-400", accent: "border-blue-500/30", bg: "bg-blue-500/10" },
        { label: "Runs", value: runsCount, unit: "runs", decimals: 0, icon: Activity, color: "text-green-400", accent: "border-green-500/30", bg: "bg-green-500/10" },
        { label: "This Week", value: currentWeekDistance, unit: "km", decimals: 1, icon: Flame, color: "text-orange-400", accent: "border-orange-500/30", bg: "bg-orange-500/10" },
        { label: "Streak", value: currentStreak, unit: "days", decimals: 0, icon: Zap, color: "text-yellow-400", accent: "border-yellow-500/30", bg: "bg-yellow-500/10" },
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
  );
};

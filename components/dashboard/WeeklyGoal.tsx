import React from 'react';
import { Target } from 'lucide-react';
import { Goal } from '@/types';

interface WeeklyGoalProps {
  goals: Goal | null;
  currentWeekDistance: number;
  goalProgress: number;
}

export const WeeklyGoal: React.FC<WeeklyGoalProps> = ({ goals, currentWeekDistance, goalProgress }) => {
  const targetKm = goals?.weekly_distance_km || 0;
  const rawExtra = currentWeekDistance - targetKm;
  const isOverachieved = targetKm > 0 && rawExtra >= 0.05;
  const extraPercentage = isOverachieved ? (rawExtra / targetKm) * 100 : 0;
  const purpleWidth = extraPercentage > 0 && extraPercentage % 100 === 0 ? 100 : extraPercentage % 100;
  const progressWidth = Math.min(goalProgress, 100);

  return (
    <div className="bg-transparent border border-dashed border-gray-700/50 rounded-2xl px-3.5 py-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Target className={`w-3 h-3 ${isOverachieved ? 'text-purple-400' : 'text-orange-400'}`} />
          <h2 className={`text-[11px] font-bold uppercase tracking-wide ${isOverachieved ? 'text-purple-300' : 'text-white'}`}>
            Weekly Goal
          </h2>
        </div>
        <div className="text-[11px] font-bold text-white flex items-center gap-1">
          <span>{progressWidth.toFixed(0)}%</span>
          {isOverachieved && (
            <span className="text-purple-400 animate-pulse">+ {extraPercentage.toFixed(0)}%</span>
          )}
        </div>
      </div>
      <div className="w-full h-1.5 bg-gray-700/50 rounded-full mb-3 overflow-hidden relative">
        <div 
          className="h-full rounded-full transition-all duration-700 absolute inset-y-0 left-0 bg-gradient-to-r from-brand-orange to-orange-500"
          style={{ width: isOverachieved ? '100%' : `${progressWidth}%` }} 
        />
        {isOverachieved && (
          <div 
            className="h-full rounded-full transition-all duration-700 absolute inset-y-0 left-0 bg-[#1f2937]"
            style={{ width: `${purpleWidth}%` }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-600 via-purple-400 to-purple-500 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer" />
            </div>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">Done</span>
          <span className="text-white font-medium">{currentWeekDistance.toFixed(1)} km</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">Target</span>
          <span className={`${isOverachieved ? 'text-purple-400' : 'text-orange-400'} font-medium`}>{targetKm} km</span>
        </div>
        <div className="flex justify-between text-[11px] pt-1 border-t border-gray-700/30">
          <span className="text-gray-500">Left</span>
          <span className="text-white font-medium">{Math.max(0, targetKm - currentWeekDistance).toFixed(1)} km</span>
        </div>
      </div>
    </div>
  );
};

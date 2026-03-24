import React from 'react';
import { Trophy, Route, Clock, Zap, Flame } from 'lucide-react';

interface PersonalRecordsProps {
  personalRecords: {
    longestDistance: number;
    longestDuration: number;
    fastestAvgSpeed: number;
    fastestPaceKm: string;
  };
  longestStreak: number;
}

export const PersonalRecords: React.FC<PersonalRecordsProps> = ({ personalRecords, longestStreak }) => {
  return (
    <div className="bg-transparent border border-dashed border-gray-700/50 rounded-2xl px-3.5 py-3">
      <div className="flex items-center gap-1.5 mb-3">
        <Trophy className="w-3 h-3 text-yellow-400" />
        <h2 className="text-xs font-bold text-white uppercase tracking-wider">Personal Records</h2>
      </div>
      <div className="space-y-2">
        {[
          { label: "Distance", sub: "Longest", val: `${(personalRecords.longestDistance / 1000).toFixed(2)}`, unit: "km", icon: Route, bg: "bg-blue-500/10", border: "border-blue-500/15", color: "text-blue-400" },
          { 
            label: "Duration", 
            sub: "Longest", 
            val: (
              <div className="flex items-baseline">
                {Math.floor(personalRecords.longestDuration / 3600) > 0 ? (
                  <>
                    {Math.floor(personalRecords.longestDuration / 3600)}
                    <span className="text-[10px] font-normal text-gray-500 ml-0.5 mr-1">h</span>
                    {Math.floor((personalRecords.longestDuration % 3600) / 60)}
                  </>
                ) : (
                  Math.floor(personalRecords.longestDuration / 60)
                )}
              </div>
            ), 
            unit: "min", 
            icon: Clock, bg: "bg-purple-500/10", border: "border-purple-500/15", color: "text-purple-400" 
          },
          { label: "Speed", sub: "Top", val: `${personalRecords.fastestAvgSpeed.toFixed(1)}`, unit: "km/h", icon: Zap, bg: "bg-yellow-500/10", border: "border-yellow-500/15", color: "text-yellow-400" },
          { label: "Streak", sub: "Highest", val: `${longestStreak}`, unit: "days", icon: Flame, bg: "bg-orange-500/10", border: "border-orange-500/15", color: "text-orange-400" },
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
              <div className="flex items-baseline justify-end text-sm font-bold text-white">
                {r.val}{r.unit && <span className="text-[10px] font-normal text-gray-500 ml-0.5">{r.unit}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

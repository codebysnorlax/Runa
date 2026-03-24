import React from 'react';
import { Link } from 'react-router-dom';
import { Footprints, Activity } from 'lucide-react';
import { Run } from '@/types';

interface TodayRunProps {
  todayRun: Run | null;
  yesterdayRun: Run | null;
}

export const TodayRun: React.FC<TodayRunProps> = ({ todayRun, yesterdayRun }) => {
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
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
  );
};

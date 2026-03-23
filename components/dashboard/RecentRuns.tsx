import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ChevronRight } from 'lucide-react';
import { Run } from '@/types';

export const RecentRuns: React.FC<{ runs: Run[] }> = ({ runs }) => {
  return (
    <div className="bg-transparent border border-dashed border-gray-700/50 rounded-2xl px-3.5 py-3">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-green-400" />
          <h2 className="text-[11px] font-bold text-white uppercase tracking-wide">Recent Runs</h2>
        </div>
        <Link to="/history" className="text-[10px] text-brand-orange hover:text-orange-400 font-semibold flex items-center gap-0.5">
          View All <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {runs.slice(0, 4).map((run) => (
          <div key={run.id} className="flex items-center justify-between p-2.5 bg-gray-900/40 rounded-md hover:bg-gray-900/60 transition-colors">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-white">
                {new Date(run.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
              <p className="text-[10px] text-gray-500 truncate">{run.notes || "No notes"}</p>
            </div>
            <div className="text-right ml-2 flex-shrink-0">
              <p className="text-[11px] font-bold text-white">{(run.distance_m / 1000).toFixed(2)} km</p>
              <p className="text-[10px] text-gray-500">{run.avg_speed_kmh.toFixed(1)} km/h</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

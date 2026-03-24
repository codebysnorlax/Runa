import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Sparkles, ChevronRight } from 'lucide-react';

interface Insight {
  id: string;
  title: string;
  content: string;
  type: "positive" | "negative" | "neutral" | "info";
}

interface LatestInsightProps {
  latestInsight: Insight | null | undefined;
}

export const LatestInsight: React.FC<LatestInsightProps> = ({ latestInsight }) => {
  return (
    <div className="bg-transparent border border-dashed border-gray-700/50 rounded-2xl px-3.5 py-3 sm:col-span-2 md:col-span-1">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Brain className="w-3 h-3 text-purple-400" />
          <h2 className="text-[11px] font-bold text-white uppercase tracking-wide">Insight</h2>
        </div>
        {latestInsight && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${latestInsight.type === "positive" ? "bg-green-500/20 text-green-400"
            : latestInsight.type === "negative" ? "bg-red-500/20 text-red-400"
              : "bg-blue-500/20 text-blue-400"
            }`}>{latestInsight.type}</span>
        )}
      </div>

      {latestInsight ? (
        <div>
          <h3 className="text-brand-orange font-bold text-xs mb-1 leading-tight">{latestInsight.title}</h3>
          <p className="text-[11px] text-gray-400 leading-relaxed mb-2 line-clamp-3">{latestInsight.content}</p>
          <Link to="/insights" className="inline-flex items-center gap-0.5 text-[10px] text-purple-400 hover:text-purple-300 font-semibold">
            View Details <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        <div className="text-center py-4">
          <Sparkles className="w-8 h-8 text-gray-700 mx-auto mb-2" />
          <p className="text-[11px] text-gray-500 mb-2">No insights yet</p>
          <Link to="/insights" className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors">
            Generate →
          </Link>
        </div>
      )}
    </div>
  );
};

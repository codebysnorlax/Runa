import React, { useState, useCallback } from "react";
import { useAppCore } from '@/context/AppCoreContext';
import { useRuns } from '@/context/RunsContext';
import { useGoals } from '@/context/GoalsContext';
import Card from "@/components/Card";
import Skeleton from "@/components/Skeleton";
import { Filter, Download } from "lucide-react";
import { exportChartToImage } from "@/utils/chartExport";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  ReferenceLine,
} from "recharts";

const AnalyticsSkeleton: React.FC = () => (
  <div className="space-y-6">
    <Skeleton className="h-9 w-1/3" />
    <Card>
      <Skeleton className="h-6 w-1/2 mb-4" />
      <Skeleton className="w-full h-[200px] sm:h-[250px]" />
    </Card>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <Card>
        <Skeleton className="h-6 w-1/2 mb-4" />
        <Skeleton className="w-full h-[250px] sm:h-[300px]" />
      </Card>
      <Card>
        <Skeleton className="h-6 w-1/2 mb-4" />
        <Skeleton className="w-full h-[250px] sm:h-[300px]" />
      </Card>
    </div>
    <Card>
      <Skeleton className="h-6 w-1/2 mb-4" />
      <Skeleton className="w-full h-[250px] sm:h-[300px]" />
    </Card>
  </div>
);

import { CustomTooltip } from "@/components/analytics/CustomTooltip";
import { Heatmap } from "@/components/analytics/Heatmap";
import { FilterModal } from "@/components/analytics/FilterModal";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";


const Analytics: React.FC = () => {
  const { loading } = useAppCore();
  const { runs } = useRuns();
  const { goals } = useGoals();
  const [showFilter, setShowFilter] = useState(false);
  const [appliedTime, setAppliedTime] = useState<number | null>(null);
  const [appliedDistRange, setAppliedDistRange] = useState<[number, number] | null>(null);

  const handleApply = useCallback((time: number | null, distRange: [number, number] | null) => {
    setShowFilter(false);
    setTimeout(() => {
      setAppliedTime(time);
      setAppliedDistRange(distRange);
    }, 600);
  }, []);

  const handleClear = useCallback(() => {
    setAppliedTime(null);
    setAppliedDistRange(null);
  }, []);

  const {
    filteredChartData,
    weeklyDistanceData,
    monthlyData,
    goalProgressData,
    filteredPerformanceData
  } = useAnalyticsData(runs, goals, appliedTime, appliedDistRange);


  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (runs.length < 1) {
    return (
      <div className="text-center text-gray-400 p-8">
        Not enough data to display analytics. Go for a run!
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 lg:pb-6 relative">
      <div className="flex justify-between items-center h-10 mb-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Analytics</h1>
          <span className="px-1.5 py-0 text-[11px] font-bold italic bg-brand-orange/20 text-brand-orange rounded border border-brand-orange/30" style={{ fontFamily: "'Caveat', cursive" }}>Beta</span>
        </div>
      </div>

      {/* Sticky Filter Container */}
      <div className="sticky top-[110px] lg:top-[64px] z-40 flex justify-end w-full h-0 pointer-events-none" style={{ overflow: 'visible' }}>
        <button
          onClick={() => setShowFilter(true)}
          className="relative flex items-center justify-center gap-2 p-2 sm:px-3 sm:py-2 bg-gray-800/30 hover:bg-gray-700/50 backdrop-blur-xl rounded-xl sm:rounded-lg text-white text-sm border border-gray-600/30 shadow-lg pointer-events-auto -mt-[44px] transition-colors"
        >
          <Filter size={18} className="sm:w-4 sm:h-4 w-5 h-5" />
          <span className="hidden sm:inline">Filter</span>
          {(appliedTime || appliedDistRange) && <span className="absolute sm:relative -top-1 -right-1 sm:top-auto sm:right-auto w-2.5 h-2.5 sm:w-2 sm:h-2 bg-brand-orange rounded-full border border-gray-800/50 sm:border-0" />}
        </button>
      </div>

      {showFilter && <FilterModal onClose={() => setShowFilter(false)} onApply={handleApply} onClear={handleClear} maxDistKm={Math.ceil(Math.max(...runs.map(r => r.distance_m / 1000), 5) / 5) * 5} initialTime={appliedTime} initialDistRange={appliedDistRange} />}

      <Heatmap runs={runs} />

      {/* Goal Progress Section */}
      {goalProgressData.length > 0 && (
        <Card>
          <h2 className="text-sm sm:text-base font-bold text-white mb-3 uppercase tracking-wide">
            Goal Progress
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goalProgressData.map((goal, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-2">{goal.name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Target:</span>
                    <span className="text-white">
                      {goal.target} min/km
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Best:</span>
                    <span className="text-green-400">
                      {goal.best > 0 ? goal.best : "N/A"} min/km
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-brand-orange h-2 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {goal.progress.toFixed(1)}% achieved
                  </div>
                </div>
              </div>
            ))}
            {/* Add goal card - desktop only */}
            <a href="#/settings?tab=goals" className="hidden sm:flex items-center justify-center p-4 rounded-lg border border-dashed border-gray-700/50 hover:border-brand-orange/50 hover:bg-gray-800/40 transition-all cursor-pointer group min-h-[120px]">
              <div className="text-center">
                <p className="text-2xl text-gray-600 group-hover:text-brand-orange transition-colors mb-1">+</p>
                <p className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">Add another goal</p>
              </div>
            </a>
          </div>
        </Card>
      )}

      {/* Advanced Performance Charts */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
        <Card>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide">
              Performance Trend
            </h2>
            <button
              onClick={(e) => exportChartToImage((appliedTime || appliedDistRange) ? filteredPerformanceData : filteredPerformanceData.slice(-14), 'performance', 'Performance Trend', e)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Download chart"
            >
              <Download size={18} className="text-gray-400" />
            </button>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart
              data={(appliedTime || appliedDistRange) ? filteredPerformanceData : filteredPerformanceData.slice(-14)}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradDistance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF7A00" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#FF7A00" stopOpacity={0.02} />
                </linearGradient>
                <filter id="glowOrange">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="glowPurple">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} vertical={false} />
              <XAxis
                dataKey="name"
                stroke="transparent"
                fontSize={10}
                tick={{ fill: "#6B7280" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="transparent"
                fontSize={10}
                tick={{ fill: "#6B7280" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="transparent"
                fontSize={10}
                tick={{ fill: "#6B7280" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4B5563', strokeDasharray: '4 4' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#9CA3AF', paddingTop: '8px' }} />
              <Area
                yAxisId="left"
                type="natural"
                dataKey="distance"
                fill="url(#gradDistance)"
                stroke="#FF7A00"
                strokeWidth={2.5}
                name="Distance (km)"
                dot={false}
                activeDot={{ r: 5, fill: '#FF7A00', stroke: '#1F2937', strokeWidth: 2 }}
                filter="url(#glowOrange)"
              />
              <Line
                yAxisId="right"
                type="natural"
                dataKey="pace"
                stroke="#A78BFA"
                strokeWidth={2}
                name="Pace (min/km)"
                dot={{ r: 3, fill: '#A78BFA', stroke: '#1F2937', strokeWidth: 1.5 }}
                activeDot={{ r: 5, fill: '#A78BFA', stroke: '#1F2937', strokeWidth: 2 }}
                filter="url(#glowPurple)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide">
              Distance & Time per Run
            </h2>
            <button
              onClick={(e) => exportChartToImage((appliedTime || appliedDistRange) ? filteredChartData : filteredChartData.slice(-14), 'distance-time', 'Distance & Time per Run', e)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Download chart"
            >
              <Download size={18} className="text-gray-400" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={(appliedTime || appliedDistRange) ? filteredChartData : filteredChartData.slice(-14)}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradDistGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34D399" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradTimeRose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FB7185" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#FB7185" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} vertical={false} />
              <XAxis
                dataKey="name"
                stroke="transparent"
                fontSize={10}
                tick={{ fill: "#6B7280" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="transparent"
                fontSize={10}
                tick={{ fill: "#6B7280" }}
                tickLine={false}
                axisLine={false}
                unit=" km"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="transparent"
                fontSize={10}
                tick={{ fill: "#6B7280" }}
                tickLine={false}
                axisLine={false}
                unit=" min"
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4B5563', strokeDasharray: '4 4' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#9CA3AF', paddingTop: '8px' }} />
              <Area
                yAxisId="left"
                type="natural"
                dataKey="distance"
                fill="url(#gradDistGreen)"
                stroke="#34D399"
                strokeWidth={2.5}
                name="Distance (km)"
                dot={false}
                activeDot={{ r: 5, fill: '#34D399', stroke: '#1F2937', strokeWidth: 2 }}
              />
              <Area
                yAxisId="right"
                type="natural"
                dataKey="time"
                fill="url(#gradTimeRose)"
                stroke="#FB7185"
                strokeWidth={2}
                name="Time (min)"
                dot={false}
                activeDot={{ r: 5, fill: '#FB7185', stroke: '#1F2937', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Weekly Analysis with Goals */}
      <Card>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide">
            Weekly Performance vs Goals
          </h2>
          <button
            onClick={(e) => exportChartToImage(weeklyDistanceData, 'weekly', 'Weekly Performance', e)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Download chart"
          >
            <Download size={18} className="text-gray-400" />
          </button>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart
            data={weeklyDistanceData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradBarOrange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF7A00" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#FF7A00" stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id="gradBarPurple" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} vertical={false} />
            <XAxis
              dataKey="name"
              stroke="transparent"
              fontSize={10}
              tick={{ fill: "#6B7280" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="transparent"
              fontSize={10}
              tick={{ fill: "#6B7280" }}
              tickLine={false}
              axisLine={false}
              unit=" km"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="transparent"
              fontSize={10}
              tick={{ fill: "#6B7280" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#9CA3AF', paddingTop: '8px' }} />
            <Bar
              yAxisId="left"
              dataKey="distance"
              fill="url(#gradBarOrange)"
              name="Distance (km)"
              radius={[4, 4, 0, 0]}
              animationDuration={800}
            />
            <Bar
              yAxisId="right"
              dataKey="runs"
              fill="url(#gradBarPurple)"
              name="Runs"
              radius={[4, 4, 0, 0]}
              animationDuration={800}
            />
            {goals?.weekly_distance_km && (
              <ReferenceLine
                yAxisId="left"
                y={goals.weekly_distance_km}
                stroke="#EF4444"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{ value: 'Goal', position: 'right', fill: '#EF4444', fontSize: 11, fontWeight: 600 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* Monthly Overview */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide">
            Monthly Progress Rings
          </h2>
          <button
            onClick={(e) => exportChartToImage(monthlyData, 'monthly', 'Monthly Progress', e)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Download chart"
          >
            <Download size={18} className="text-gray-400" />
          </button>
        </div>
        {/* Mobile: Horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory lg:hidden scrollbar-hide">
          {[...monthlyData].reverse().map((month, index) => {
            const maxDistance = Math.max(...monthlyData.map((m) => m.distance));
            const maxRuns = Math.max(...monthlyData.map((m) => m.runs));
            const distanceProgress = (month.distance / maxDistance) * 100;
            const runsProgress = (month.runs / maxRuns) * 100;

            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthDate = new Date(month.name + "-01");
            const isCurrentMonth = monthDate.getMonth() === currentMonth && monthDate.getFullYear() === currentYear;

            return (
              <div
                key={index}
                className={`flex-shrink-0 flex flex-col items-center p-3 bg-gray-800 rounded-lg transition-colors snap-start ${isCurrentMonth ? 'border-2 border-brand-orange' : 'border border-dashed border-gray-700/50'
                  }`}
                style={{ minWidth: '140px' }}
              >
                <div className="relative w-20 h-20 mb-3">
                  <svg
                    className="w-20 h-20 transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    {/* Background circles */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#374151"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="30"
                      stroke="#374151"
                      strokeWidth="6"
                      fill="none"
                    />

                    {/* Distance progress */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#FF7A00"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - distanceProgress / 100)
                        }`}
                      className="transition-all duration-1000 ease-out"
                    />

                    {/* Runs progress */}
                    <circle
                      cx="50"
                      cy="50"
                      r="30"
                      stroke="#8884d8"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 30}`}
                      strokeDashoffset={`${2 * Math.PI * 30 * (1 - runsProgress / 100)
                        }`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>

                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold text-white">
                      {new Date(month.name + "-01").toLocaleDateString("en", {
                        month: "short",
                      })}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(month.name + "-01").getFullYear()}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-brand-orange rounded-full"></div>
                    <span className="text-xs text-white font-semibold">
                      {month.distance.toFixed(1)}km
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-xs text-gray-300">
                      {month.runs} runs
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {month.time.toFixed(1)}h total
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Desktop: Grid */}
        <div className="hidden lg:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {[...monthlyData].reverse().map((month, index) => {
            const maxDistance = Math.max(...monthlyData.map((m) => m.distance));
            const maxRuns = Math.max(...monthlyData.map((m) => m.runs));
            const distanceProgress = (month.distance / maxDistance) * 100;
            const runsProgress = (month.runs / maxRuns) * 100;

            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthDate = new Date(month.name + "-01");
            const isCurrentMonth = monthDate.getMonth() === currentMonth && monthDate.getFullYear() === currentYear;

            return (
              <div
                key={index}
                className={`flex flex-col items-center p-3 sm:p-4 bg-gray-800 rounded-lg transition-colors ${isCurrentMonth ? 'border-2 border-brand-orange' : 'border border-dashed border-gray-700/50'
                  }`}
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-3">
                  <svg
                    className="w-20 h-20 sm:w-24 sm:h-24 transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    {/* Background circles */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#374151"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="30"
                      stroke="#374151"
                      strokeWidth="6"
                      fill="none"
                    />

                    {/* Distance progress */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#FF7A00"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - distanceProgress / 100)
                        }`}
                      className="transition-all duration-1000 ease-out"
                    />

                    {/* Runs progress */}
                    <circle
                      cx="50"
                      cy="50"
                      r="30"
                      stroke="#8884d8"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 30}`}
                      strokeDashoffset={`${2 * Math.PI * 30 * (1 - runsProgress / 100)
                        }`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>

                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold text-white">
                      {new Date(month.name + "-01").toLocaleDateString("en", {
                        month: "short",
                      })}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(month.name + "-01").getFullYear()}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-brand-orange rounded-full"></div>

                    <span className="text-xs sm:text-sm text-white font-semibold">
                      {month.distance.toFixed(1)}km
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-xs sm:text-sm text-gray-300">
                      {month.runs} runs
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {month.time.toFixed(1)}h total
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Analytics;

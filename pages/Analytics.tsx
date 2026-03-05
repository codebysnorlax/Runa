import React, { useMemo, useState, memo, useCallback } from "react";
import { useAppContext } from "../context/AppContext";
import Card from "../components/Card";
import Skeleton from "../components/Skeleton";
import { Filter, X, Download } from "lucide-react";
import { exportChartToImage } from "../utils/chartExport";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
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

const formatPace = (paceMinutes: number) => {
  const minutes = Math.floor(paceMinutes);
  const seconds = Math.round((paceMinutes - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 px-3.5 py-2.5 rounded-xl shadow-2xl">
        <p className="text-[11px] text-gray-400 font-medium mb-1.5 border-b border-gray-700/40 pb-1.5">{label}</p>
        <div className="space-y-1">
          {payload.map((pld: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-[12px]">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: pld.color }} />
              <span className="text-gray-400">{pld.name}:</span>
              <span className="text-white font-semibold ml-auto">
                {pld.name.includes("Pace")
                  ? `${formatPace(pld.value)} min/km`
                  : typeof pld.value === 'number' ? pld.value.toFixed(2) : pld.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const Heatmap: React.FC<{ runs: any[] }> = ({ runs }) => {
  const data = useMemo(() => {
    const runDataByDate: {
      [key: string]: {
        distance: number;
        speed: number;
        time: number;
        count: number;
      };
    } = {};

    runs.forEach((run) => {
      const dateStr = new Date(run.date).toISOString().split("T")[0];
      if (!runDataByDate[dateStr]) {
        runDataByDate[dateStr] = { distance: 0, speed: 0, time: 0, count: 0 };
      }
      runDataByDate[dateStr].distance += run.distance_m / 1000;
      runDataByDate[dateStr].speed += run.avg_speed_kmh;
      runDataByDate[dateStr].time += run.total_time_sec / 60;
      runDataByDate[dateStr].count += 1;
    });

    const endDate = new Date();
    const startDate = new Date();
    // Start from 52 weeks ago (364 days) so today is at the far right
    startDate.setDate(endDate.getDate() - 364);

    const days = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const dayData = runDataByDate[dateStr];
      days.push({
        date: new Date(currentDate),
        distance: dayData?.distance || 0,
        avgSpeed: dayData ? dayData.speed / dayData.count : 0,
        time: dayData?.time || 0,
        intensity: dayData
          ? dayData.distance * 0.4 +
          (dayData.speed / dayData.count) * 0.3 +
          dayData.time * 0.3
          : 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  }, [runs]);

  const maxIntensity = useMemo(
    () => Math.max(...data.map((d) => d.intensity), 1),
    [data]
  );

  const getColor = (intensity: number) => {
    if (intensity === 0) return "bg-gray-800";
    const normalized = Math.min(intensity / maxIntensity, 1);
    if (normalized < 0.2) return "bg-brand-orange/20";
    if (normalized < 0.4) return "bg-brand-orange/40";
    if (normalized < 0.6) return "bg-brand-orange/60";
    if (normalized < 0.8) return "bg-brand-orange/80";
    return "bg-brand-orange";
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const firstDayOffset = data.length > 0 ? data[0].date.getDay() : 0;

  // Group data into weeks
  const weeks: any[][] = [];
  let currentWeek: any[] = [];

  // Add empty cells for first week offset
  for (let i = 0; i < firstDayOffset; i++) {
    currentWeek.push(null);
  }

  data.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Add remaining days
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return (
    <Card>
      <p className="text-xs text-gray-400 mb-3">
        Based on distance, speed, and time
      </p>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="flex gap-0.5 sm:gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 sm:gap-1 text-xs text-gray-400 pt-4 sm:pt-5">
              {weekDays.map((day, i) => (
                <div
                  key={i}
                  className="h-2 sm:h-3 flex items-center"
                  style={{ fontSize: "8px" }}
                >
                  {i % 2 === 1 ? day : ""}
                </div>
              ))}
            </div>

            <div className="flex-1">
              {/* Month labels */}
              <div className="flex gap-0.5 sm:gap-1 mb-1 text-xs text-gray-400">
                {weeks.map((week, weekIndex) => {
                  const firstDay = week.find((d) => d);
                  if (firstDay && new Date(firstDay.date).getDate() <= 7) {
                    const dateObj = new Date(firstDay.date);
                    const month = dateObj.toLocaleString("default", { month: "short" });
                    const isJanuary = dateObj.getMonth() === 0;
                    const year = dateObj.getFullYear().toString().slice(-2);
                    return (
                      <div
                        key={weekIndex}
                        className="w-2 sm:w-3"
                        style={{ fontSize: "8px" }}
                      >
                        {isJanuary ? `'${year}` : month}
                      </div>
                    );
                  }
                  return <div key={weekIndex} className="w-2 sm:w-3" />;
                })}
              </div>

              {/* Heatmap grid */}
              <div className="flex gap-0.5 sm:gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-0.5 sm:gap-1">
                    {week.map((day, dayIndex) => {
                      const isToday = day && day.date.toDateString() === new Date().toDateString();
                      return (
                        <div
                          key={dayIndex}
                          className={`w-2 h-2 sm:w-3 sm:h-3 rounded-sm ${day ? getColor(day.intensity) : "bg-transparent"} ${isToday ? "ring-1 ring-red-500" : ""}`}
                          title={
                            day
                              ? `${day.date.toDateString()}\nDistance: ${day.distance.toFixed(
                                1
                              )}km\nAvg Speed: ${day.avgSpeed.toFixed(
                                1
                              )}km/h\nTime: ${day.time.toFixed(0)}min`
                              : ""
                          }
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-end mt-2 sm:mt-3 text-xs text-gray-400 items-center gap-1 sm:gap-2">
            <span className="text-[10px] sm:text-xs">Less</span>
            <div className="flex gap-0.5 sm:gap-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-gray-800" />
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-brand-orange/20" />
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-brand-orange/40" />
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-brand-orange/60" />
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-brand-orange/80" />
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-brand-orange" />
            </div>
            <span className="text-[10px] sm:text-xs">More</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

const FilterModal = memo(({ onClose, onApply, onClear, maxDistKm, initialTime, initialDistRange }: {
  onClose: () => void;
  onApply: (time: number | null, distRange: [number, number] | null) => void;
  onClear: () => void;
  maxDistKm: number;
  initialTime: number | null;
  initialDistRange: [number, number] | null;
}) => {
  const maxRange = maxDistKm;
  const [time, setTime] = useState<number | null>(initialTime);
  const [distMin, setDistMin] = useState(initialDistRange ? initialDistRange[0] / 1000 : 0);
  const [distMax, setDistMax] = useState(initialDistRange ? initialDistRange[1] / 1000 : maxRange);
  const [distEnabled, setDistEnabled] = useState(!!initialDistRange);
  const [applying, setApplying] = useState(false);

  const handleMinChange = (v: number) => {
    setDistMin(Math.min(v, distMax - 0.1));
    setDistEnabled(true);
  };
  const handleMaxChange = (v: number) => {
    setDistMax(Math.max(v, distMin + 0.1));
    setDistEnabled(true);
  };

  const leftPct = (distMin / maxRange) * 100;
  const rightPct = ((maxRange - distMax) / maxRange) * 100;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-sm rounded-2xl bg-gray-900/50 backdrop-blur-2xl border border-gray-700/50 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-orange via-orange-400 to-purple-500" />

        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Filter Charts</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Refine your analytics view</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Time Period */}
          <div className="mb-6">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2.5">
              Time Period
            </label>
            <div className="flex gap-2">
              {[
                { val: 7, label: "7D" },
                { val: 15, label: "15D" },
                { val: 30, label: "30D" },
                { val: 60, label: "60D" },
                { val: 90, label: "90D" },
              ].map((v) => (
                <button
                  key={v.val}
                  onClick={() => setTime(time === v.val ? null : v.val)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${time === v.val
                    ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20"
                    : "bg-gray-800/80 text-gray-400 hover:bg-gray-700/80 hover:text-gray-200"
                    }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Distance Range Slider */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Distance Range
              </label>
              <button
                onClick={() => { setDistEnabled(!distEnabled); if (distEnabled) { setDistMin(0); setDistMax(maxRange); } }}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${distEnabled ? "bg-brand-orange/15 text-brand-orange" : "bg-gray-800 text-gray-500"
                  }`}
              >
                {distEnabled ? "ON" : "OFF"}
              </button>
            </div>

            {/* Range display */}
            <div className="flex justify-between items-center mb-3">
              <div className="bg-gray-800/80 rounded-lg px-3 py-1.5 border border-gray-700/50">
                <span className="text-sm font-bold text-white">{distMin.toFixed(1)}</span>
                <span className="text-[10px] text-gray-500 ml-0.5">km</span>
              </div>
              <div className="text-gray-600 text-xs">—</div>
              <div className="bg-gray-800/80 rounded-lg px-3 py-1.5 border border-gray-700/50">
                <span className="text-sm font-bold text-white">{distMax.toFixed(1)}</span>
                <span className="text-[10px] text-gray-500 ml-0.5">km</span>
              </div>
            </div>

            {/* Dual range slider */}
            <style>{`
              .range-thumb { -webkit-appearance: none; appearance: none; pointer-events: none; position: absolute; width: 100%; height: 32px; background: transparent; }
              .range-thumb::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: white; border: 2px solid; cursor: pointer; pointer-events: all; box-shadow: 0 2px 6px rgba(0,0,0,0.3); }
              .range-thumb::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: white; border: 2px solid; cursor: pointer; pointer-events: all; box-shadow: 0 2px 6px rgba(0,0,0,0.3); }
              .range-thumb::-moz-range-track { background: transparent; border: none; }
              .range-min::-webkit-slider-thumb { border-color: #FF7A00; }
              .range-max::-webkit-slider-thumb { border-color: #8B5CF6; }
              .range-min::-moz-range-thumb { border-color: #FF7A00; }
              .range-max::-moz-range-thumb { border-color: #8B5CF6; }
            `}</style>
            <div className="relative h-8 flex items-center">
              {/* Track */}
              <div className="absolute left-0 right-0 h-1.5 bg-gray-700/60 rounded-full" />
              {/* Active range */}
              <div
                className="absolute h-1.5 bg-gradient-to-r from-brand-orange to-orange-400 rounded-full"
                style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
              />
              {/* Min slider */}
              <input
                type="range"
                min="0"
                max={maxRange}
                step="0.1"
                value={distMin}
                onChange={(e) => handleMinChange(parseFloat(e.target.value))}
                className="range-thumb range-min"
                style={{ zIndex: 3 }}
              />
              {/* Max slider */}
              <input
                type="range"
                min="0"
                max={maxRange}
                step="0.1"
                value={distMax}
                onChange={(e) => handleMaxChange(parseFloat(e.target.value))}
                className="range-thumb range-max"
                style={{ zIndex: 4 }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-gray-600">0 km</span>
              <span className="text-[9px] text-gray-600">{maxRange} km</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5">
            <button
              onClick={() => { onClear(); onClose(); }}
              className="flex-1 py-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 text-xs font-semibold transition-colors"
            >
              Clear All
            </button>
            <button
              disabled={applying}
              onClick={() => {
                setApplying(true);
                setTimeout(() => onApply(time, distEnabled ? [distMin * 1000, distMax * 1000] : null), 600);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${applying ? 'bg-brand-orange/60 cursor-not-allowed' : 'bg-gradient-to-r from-brand-orange to-orange-600 hover:shadow-lg hover:shadow-brand-orange/20'} text-white`}
            >
              {applying ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Applying...
                </>
              ) : 'Apply Filters'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

const Analytics: React.FC = () => {
  const { runs, goals, loading } = useAppContext();
  const [showFilter, setShowFilter] = useState(false);
  const [appliedTime, setAppliedTime] = useState<number | null>(null);
  const [appliedDistRange, setAppliedDistRange] = useState<[number, number] | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);

  const handleApply = useCallback((time: number | null, distRange: [number, number] | null) => {
    setIsFiltering(true);
    setShowFilter(false);
    setTimeout(() => {
      setAppliedTime(time);
      setAppliedDistRange(distRange);
      setIsFiltering(false);
    }, 600);
  }, []);

  const handleClear = useCallback(() => {
    setAppliedTime(null);
    setAppliedDistRange(null);
  }, []);

  const chartData = useMemo(() => {
    return runs
      .map((run) => ({
        ...run,
        dateObj: new Date(run.date),
      }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
      .map((run) => ({
        name: run.dateObj.toLocaleDateString("en-IN"),
        pace:
          run.distance_m > 0
            ? run.total_time_sec / 60 / (run.distance_m / 1000)
            : 0,
        speed: run.avg_speed_kmh,
        distance: run.distance_m / 1000,
        time: run.total_time_sec / 60,
      }));
  }, [runs]);

  const filteredChartData = useMemo(() => {
    let filtered = runs;
    if (appliedTime) {
      const cutoff = Date.now() - appliedTime * 86400000;
      filtered = filtered.filter((run) => new Date(run.date).getTime() >= cutoff);
    }
    if (appliedDistRange) {
      filtered = filtered.filter((run) => run.distance_m >= appliedDistRange[0] && run.distance_m <= appliedDistRange[1]);
    }
    return filtered
      .map((run) => ({ ...run, dateObj: new Date(run.date) }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
      .map((run) => ({
        name: run.dateObj.toLocaleDateString("en-IN"),
        pace: run.distance_m > 0 ? run.total_time_sec / 60 / (run.distance_m / 1000) : 0,
        speed: run.avg_speed_kmh,
        distance: run.distance_m / 1000,
        time: run.total_time_sec / 60,
      }));
  }, [runs, appliedTime, appliedDistRange]);

  const weeklyDistanceData = useMemo(() => {
    const weeks: {
      [key: string]: { distance: number; runs: number; avgPace: number };
    } = {};
    runs.forEach((run) => {
      const date = new Date(run.date);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date);
      monday.setDate(diff);
      const weekStart = monday.toLocaleDateString("en-IN");

      if (!weeks[weekStart])
        weeks[weekStart] = { distance: 0, runs: 0, avgPace: 0 };
      weeks[weekStart].distance += run.distance_m / 1000;
      weeks[weekStart].runs += 1;
      weeks[weekStart].avgPace +=
        run.distance_m > 0
          ? run.total_time_sec / 60 / (run.distance_m / 1000)
          : 0;
    });
    return Object.keys(weeks)
      .sort()
      .map((week) => ({
        name: week,
        distance: weeks[week].distance,
        runs: weeks[week].runs,
        avgPace: weeks[week].avgPace / weeks[week].runs,
        goal: goals?.weekly_distance_km || 0,
      }))
      .slice(-8);
  }, [runs, goals]);

  const monthlyData = useMemo(() => {
    const months: {
      [key: string]: { distance: number; runs: number; time: number };
    } = {};

    // Always show the current month, even with 0 runs
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    months[currentMonthKey] = { distance: 0, runs: 0, time: 0 };

    runs.forEach((run) => {
      const date = new Date(run.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!months[monthKey])
        months[monthKey] = { distance: 0, runs: 0, time: 0 };
      months[monthKey].distance += run.distance_m / 1000;
      months[monthKey].runs += 1;
      months[monthKey].time += run.total_time_sec / 3600;
    });
    return Object.keys(months)
      .sort()
      .map((month) => ({
        name: month,
        distance: months[month].distance,
        runs: months[month].runs,
        time: months[month].time,
      }))
      .slice(-6);
  }, [runs]);

  const goalProgressData = useMemo(() => {
    if (!goals?.distance_goals?.length) return [];
    return goals.distance_goals.map((goal) => {
      const relevantRuns = runs.filter((run) => {
        const runDistKm = run.distance_m / 1000;
        return runDistKm >= goal.distance_km * 0.9 && runDistKm <= goal.distance_km * 1.1;
      });
      const bestTime =
        relevantRuns.length > 0
          ? Math.min(...relevantRuns.map((run) => run.total_time_sec))
          : 0;
      const targetSeconds = goal.target_time
        .split(":")
        .reduce((acc, time) => 60 * acc + +time, 0);
      const progress =
        bestTime > 0 ? Math.min((targetSeconds / bestTime) * 100, 100) : 0;

      return {
        name: goal.name,
        progress,
        best: bestTime / 60,
        target: targetSeconds / 60,
        distance: goal.distance_km,
      };
    });
  }, [runs, goals]);

  const performanceData = useMemo(() => {
    return chartData.map((item, index) => ({
      ...item,
      cumDistance: chartData
        .slice(0, index + 1)
        .reduce((sum, run) => sum + run.distance, 0),
      efficiency: item.speed / (item.pace || 1),
    }));
  }, [chartData]);

  const filteredPerformanceData = useMemo(() => {
    return filteredChartData.map((item, index) => ({
      ...item,
      cumDistance: filteredChartData.slice(0, index + 1).reduce((sum, run) => sum + run.distance, 0),
      efficiency: item.speed / (item.pace || 1),
    }));
  }, [filteredChartData]);

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

  const renderChart = (
    title: string,
    data: any[],
    yKey: string,
    yUnit: string,
    color: string
  ) => (
    <Card>
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
          <XAxis
            dataKey="name"
            stroke="#888"
            fontSize={10}
            tick={{ fill: "#9CA3AF" }}
          />
          <YAxis
            stroke="#888"
            fontSize={10}
            tick={{ fill: "#9CA3AF" }}
            unit={yUnit}
            domain={["dataMin - 1", "dataMax + 1"]}
            tickFormatter={yKey === "pace" ? formatPace : undefined}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
            name={title.split("(")[0].trim()}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );

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
          className="relative flex items-center justify-center gap-2 p-2 sm:px-3 sm:py-2 bg-gray-800/30 hover:bg-gray-700/50 backdrop-blur-xl rounded-xl sm:rounded-lg text-white text-sm border border-gray-600/30 shadow-lg pointer-events-auto -mt-[44px] transition-all"
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
                      {formatPace(goal.target)} min/km
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Best:</span>
                    <span className="text-green-400">
                      {goal.best > 0 ? formatPace(goal.best) : "N/A"} min/km
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

import React, { useMemo, useState, memo, useCallback, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import Card from "../components/Card";
import Skeleton from "../components/Skeleton";
import { Filter, X, Download, Loader2 } from "lucide-react";
import { toBlob } from "html-to-image";
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

const DownloadButton = ({ elementRef, fileName }: { elementRef: React.RefObject<HTMLDivElement | null>, fileName: string }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!elementRef.current) {
      console.error("Download failed: elementRef.current is null");
      return;
    }

    if (isDownloading) return;

    setIsDownloading(true);
    try {
      // Use toBlob for better performance and browser support with large images
      const blob = await toBlob(elementRef.current, {
        backgroundColor: "#1E1E1E",
        cacheBust: true,
        pixelRatio: 2, // Higher quality
        fontEmbedCSS: '', // Avoid font embedding issues (trim error)
      });

      if (!blob) throw new Error("Could not generate image blob");

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${fileName}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download image", err);
      alert("Failed to download chart. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={`absolute top-3 right-3 p-1.5 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full transition-all z-20 group shadow-lg ${isDownloading ? 'opacity-70' : ''}`}
      title="Download Chart"
    >
      {isDownloading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Download size={14} className="group-hover:scale-110 transition-transform" />
      )}
    </button>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-card border border-dark-border p-2 rounded-md shadow-lg">
        <p className="label text-white">{`${label}`}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} style={{ color: pld.color }}>
            {pld.name.includes("Pace")
              ? `${pld.name}: ${formatPace(pld.value)} min/km`
              : `${pld.name}: ${pld.value.toFixed(2)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Heatmap: React.FC<{ runs: any[] }> = ({ runs }) => {
  const heatmapRef = useRef<HTMLDivElement>(null);
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
    <Card className="relative">
      <DownloadButton elementRef={heatmapRef} fileName="running-heatmap" />
      <div ref={heatmapRef} className="bg-dark-card">
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
      </div>
    </Card>
  );
};

const FilterModal = memo(({ onClose, onApply, onClear }: {
  onClose: () => void;
  onApply: (time: number | null, distance: number | null) => void;
  onClear: () => void;
}) => {
  const [time, setTime] = useState<number | null>(null);
  const [distance, setDistance] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-dark-card border border-dark-border rounded-lg p-6 w-80" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold">Filter Charts</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm block mb-2">Time Period</label>
            <div className="flex gap-2 flex-wrap">
              {[7, 15, 30].map((v) => (
                <button
                  key={v}
                  onClick={() => setTime(time === v ? null : v)}
                  className={`px-3 py-1 rounded text-sm ${time === v ? "bg-brand-orange text-white" : "bg-gray-700 text-gray-300"}`}
                >
                  {v} days
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-2">Min Distance (meters)</label>
            <input
              type="text"
              value={distance}
              onChange={(e) => setDistance(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 1600"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => { onClear(); onClose(); }} className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm">Clear</button>
            <button onClick={() => onApply(time, distance ? parseInt(distance) : null)} className="flex-1 px-3 py-2 bg-brand-orange hover:bg-orange-600 rounded text-white text-sm">Apply</button>
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
  const [appliedDistance, setAppliedDistance] = useState<number | null>(null);

  const performanceRef = useRef<HTMLDivElement>(null);
  const distanceRef = useRef<HTMLDivElement>(null);
  const weeklyRef = useRef<HTMLDivElement>(null);
  const monthlyRef = useRef<HTMLDivElement>(null);

  const handleApply = useCallback((time: number | null, dist: number | null) => {
    setAppliedTime(time);
    setAppliedDistance(dist);
    setShowFilter(false);
  }, []);

  const handleClear = useCallback(() => {
    setAppliedTime(null);
    setAppliedDistance(null);
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
    if (appliedDistance) {
      filtered = filtered.filter((run) => run.distance_m >= appliedDistance);
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
  }, [runs, appliedTime, appliedDistance]);

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
    <div className="space-y-6 pb-24 lg:pb-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Analytics</h1>
        <button
          onClick={() => setShowFilter(true)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm"
        >
          <Filter size={16} />
          Filter
          {(appliedTime || appliedDistance) && <span className="w-2 h-2 bg-brand-orange rounded-full" />}
        </button>
      </div>

      {showFilter && <FilterModal onClose={() => setShowFilter(false)} onApply={handleApply} onClear={handleClear} />}

      <Heatmap runs={runs} />

      {/* Goal Progress Section */}
      {goalProgressData.length > 0 && (
        <Card>
          <h2 className="text-base sm:text-lg font-semibold text-white mb-4">
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
          </div>
        </Card>
      )}

      {/* Advanced Performance Charts */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="relative">
          <DownloadButton elementRef={performanceRef} fileName="performance-trend" />
          <div ref={performanceRef} className="bg-dark-card pt-2">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-4">
              Performance Trend
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart
                data={(appliedTime || appliedDistance) ? filteredPerformanceData : filteredPerformanceData.slice(-14)}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                <XAxis
                  dataKey="name"
                  stroke="#888"
                  fontSize={10}
                  tick={{ fill: "#9CA3AF" }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#888"
                  fontSize={10}
                  tick={{ fill: "#9CA3AF" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#888"
                  fontSize={10}
                  tick={{ fill: "#9CA3AF" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="distance"
                  fill="#FF7A00"
                  fillOpacity={0.3}
                  stroke="#FF7A00"
                  name="Distance (km)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="pace"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Pace (min/km)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="relative">
          <DownloadButton elementRef={distanceRef} fileName="distance-and-time" />
          <div ref={distanceRef} className="bg-dark-card pt-2">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-4">
              Distance & Time per Run
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart
                data={(appliedTime || appliedDistance) ? filteredChartData : filteredChartData.slice(-14)}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                <XAxis
                  dataKey="name"
                  stroke="#888"
                  fontSize={10}
                  tick={{ fill: "#9CA3AF" }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#888"
                  fontSize={10}
                  tick={{ fill: "#9CA3AF" }}
                  unit=" km"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#888"
                  fontSize={10}
                  tick={{ fill: "#9CA3AF" }}
                  unit=" min"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="distance"
                  fill="#82ca9d"
                  name="Distance (km)"
                  animationDuration={800}
                />
                <Bar
                  yAxisId="right"
                  dataKey="time"
                  fill="#ff6b6b"
                  name="Time (min)"
                  animationDuration={800}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Weekly Analysis with Goals */}
      <Card className="relative">
        <DownloadButton elementRef={weeklyRef} fileName="weekly-performance" />
        <div ref={weeklyRef} className="bg-dark-card pt-2">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-4">
            Weekly Performance vs Goals
          </h2>

          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart
              data={weeklyDistanceData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
              <XAxis
                dataKey="name"
                stroke="#888"
                fontSize={10}
                tick={{ fill: "#9CA3AF" }}
              />
              <YAxis
                yAxisId="left"
                stroke="#888"
                fontSize={10}
                tick={{ fill: "#9CA3AF" }}
                unit=" km"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#888"
                fontSize={10}
                tick={{ fill: "#9CA3AF" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="distance"
                fill="#FF7A00"
                name="Distance (km)"
              />
              <Bar yAxisId="right" dataKey="runs" fill="#8884d8" name="Runs" />
              {goals?.weekly_distance_km && (
                <ReferenceLine
                  yAxisId="left"
                  y={goals.weekly_distance_km}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label="Goal"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Monthly Overview */}
      <div className="relative">
        <Card className="relative overflow-hidden mt-6">
          <DownloadButton elementRef={monthlyRef} fileName="monthly-summary" />
          <div ref={monthlyRef} className="bg-dark-card p-2 pt-4">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-4">
              Monthly Progress Rings
            </h2>
            {/* Mobile: Horizontal scroll */}
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory lg:hidden scrollbar-hide">
              {monthlyData.map((month, index) => {
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
                    className={`flex-shrink-0 flex flex-col items-center p-3 bg-gray-800 rounded-lg transition-colors snap-start border-2 ${isCurrentMonth ? 'border-red-500' : 'border-transparent'
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
              {monthlyData.map((month, index) => {
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
                    className={`flex flex-col items-center p-3 sm:p-4 bg-gray-800 rounded-lg transition-colors border-2 ${isCurrentMonth ? 'border-red-500' : 'border-transparent'
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
        </Card>
      </div>
    </div>
  );
};

export default Analytics;

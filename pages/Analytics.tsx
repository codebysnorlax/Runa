import React, { useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import Card from "../components/Card";
import Skeleton from "../components/Skeleton";
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
  const data = useMemo(() => {
    const runDataByDate: { [key: string]: { distance: number; speed: number; time: number; count: number } } = {};
    
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
    startDate.setFullYear(endDate.getFullYear() - 1);
    startDate.setDate(1);

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
        intensity: dayData ? (dayData.distance * 0.4) + (dayData.speed / dayData.count * 0.3) + (dayData.time * 0.3) : 0
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
      <p className="text-xs text-gray-400 mb-3">Based on distance, speed, and time</p>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 text-xs text-gray-400 pt-5">
              {weekDays.map((day, i) => (
                <div key={i} className="h-3 flex items-center" style={{ fontSize: '10px' }}>
                  {i % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>
            
            <div className="flex-1">
              {/* Month labels */}
              <div className="flex gap-1 mb-1 text-xs text-gray-400">
                {weeks.map((week, weekIndex) => {
                  const firstDay = week.find(d => d);
                  if (firstDay && new Date(firstDay.date).getDate() <= 7) {
                    const month = new Date(firstDay.date).toLocaleString('default', { month: 'short' });
                    return (
                      <div key={weekIndex} className="w-3" style={{ fontSize: '10px' }}>
                        {month}
                      </div>
                    );
                  }
                  return <div key={weekIndex} className="w-3" />;
                })}
              </div>
              
              {/* Heatmap grid */}
              <div className="flex gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`w-3 h-3 rounded-sm ${day ? getColor(day.intensity) : 'bg-transparent'}`}
                        title={day ? `${day.date.toDateString()}\nDistance: ${day.distance.toFixed(1)}km\nAvg Speed: ${day.avgSpeed.toFixed(1)}km/h\nTime: ${day.time.toFixed(0)}min` : ''}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex justify-end mt-3 text-xs text-gray-400 items-center gap-2">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-800" />
              <div className="w-3 h-3 rounded-sm bg-brand-orange/20" />
              <div className="w-3 h-3 rounded-sm bg-brand-orange/40" />
              <div className="w-3 h-3 rounded-sm bg-brand-orange/60" />
              <div className="w-3 h-3 rounded-sm bg-brand-orange/80" />
              <div className="w-3 h-3 rounded-sm bg-brand-orange" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

const Analytics: React.FC = () => {
  const { runs, goals, loading } = useAppContext();

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
            : 0, // min/km
        speed: run.avg_speed_kmh,
        distance: run.distance_m / 1000,
        time: run.total_time_sec / 60, // minutes
      }));
  }, [runs]);

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
      const relevantRuns = runs.filter(
        (run) => run.distance_m / 1000 >= goal.distance_km * 0.8
      );
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
      <h1 className="text-2xl sm:text-3xl font-bold text-white">Analytics</h1>

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
        <Card>
          <h2 className="text-base sm:text-lg font-semibold text-white mb-4">
            Performance Trend
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={performanceData.slice(-14)}
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
        </Card>

        <Card>
          <h2 className="text-base sm:text-lg font-semibold text-white mb-4">
            Distance & Time per Run
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={chartData.slice(-14)}
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
        </Card>
      </div>

      {/* Weekly Analysis with Goals */}
      <Card>
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
      </Card>

      {/* Monthly Overview */}
      <Card>
        <h2 className="text-base sm:text-lg font-semibold text-white mb-4">
          Monthly Progress Rings
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {monthlyData.map((month, index) => {
            const maxDistance = Math.max(...monthlyData.map((m) => m.distance));
            const maxRuns = Math.max(...monthlyData.map((m) => m.runs));
            const distanceProgress = (month.distance / maxDistance) * 100;
            const runsProgress = (month.runs / maxRuns) * 100;

            return (
              <div
                key={index}
                className="flex flex-col items-center p-3 sm:p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
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
                      strokeDashoffset={`${
                        2 * Math.PI * 40 * (1 - distanceProgress / 100)
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
                      strokeDashoffset={`${
                        2 * Math.PI * 30 * (1 - runsProgress / 100)
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
      </Card>
    </div>
  );
};

export default Analytics;

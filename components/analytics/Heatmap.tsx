import React, { useMemo } from 'react';
import Card from '@/components/Card';
import { Run } from '@/types';

interface Day {
  date: Date;
  distance: number;
  avgSpeed: number;

  time: number;
  intensity: number;
}

export const Heatmap: React.FC<{ runs: Run[] }> = ({ runs }) => {
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
    const currentDate = new Date(startDate);
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
  const weeks: (Day | null)[][] = [];
  let currentWeek: (Day | null)[] = [];

  // Add empty cells for first week offset
  for (let i = 0; i < firstDayOffset; i++) {
    currentWeek.push(null);
  }

  data.forEach((day) => {
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

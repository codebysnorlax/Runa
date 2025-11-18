import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import Skeleton from '../components/Skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area, ComposedChart, ReferenceLine, PieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts';

const AnalyticsSkeleton: React.FC = () => (
    <div className="space-y-6">
        <Skeleton className="h-9 w-1/3" />
        <Card>
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="w-full h-[200px]" />
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <Skeleton className="h-6 w-1/2 mb-4" />
                <Skeleton className="w-full h-[300px]" />
            </Card>
            <Card>
                <Skeleton className="h-6 w-1/2 mb-4" />
                <Skeleton className="w-full h-[300px]" />
            </Card>
        </div>
        <Card>
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="w-full h-[300px]" />
        </Card>
    </div>
);


const formatPace = (paceMinutes: number) => {
    const minutes = Math.floor(paceMinutes);
    const seconds = Math.round((paceMinutes - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-dark-card border border-dark-border p-2 rounded-md shadow-lg">
                <p className="label text-white">{`${label}`}</p>
                {payload.map((pld: any, index: number) => (
                    <p key={index} style={{ color: pld.color }}>
                        {pld.name.includes('Pace')
                            ? `${pld.name}: ${formatPace(pld.value)} min/km`
                            : `${pld.name}: ${pld.value.toFixed(2)}`
                        }
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const Heatmap: React.FC<{ runs: any[] }> = ({ runs }) => {
    const data = useMemo(() => {
        const runDataByDate: { [key: string]: number } = {};
        runs.forEach(run => {
            const dateStr = new Date(run.date).toISOString().split('T')[0];
            runDataByDate[dateStr] = (runDataByDate[dateStr] || 0) + run.distance_m / 1000;
        });

        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 1);
        startDate.setDate(1);

        const days = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            days.push({
                date: new Date(currentDate),
                distance: runDataByDate[currentDate.toISOString().split('T')[0]] || 0,
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return days;
    }, [runs]);

    const maxDistance = useMemo(() => Math.max(...data.map(d => d.distance), 1), [data]);
    const getColor = (distance: number) => {
        if (distance === 0) return 'bg-gray-800';
        const intensity = Math.min(distance / (maxDistance * 0.75), 1); // Cap intensity to make colors more vibrant
        if (intensity < 0.25) return 'bg-brand-orange/20';
        if (intensity < 0.5) return 'bg-brand-orange/40';
        if (intensity < 0.75) return 'bg-brand-orange/60';
        return 'bg-brand-orange/80';
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [...Array(12)].map((_, i) => {
        const d = new Date(data[0].date);
        d.setMonth(d.getMonth() + i);
        return d.toLocaleString('default', { month: 'short' });
    });

    const firstDayOffset = data.length > 0 ? data[0].date.getDay() : 0;

    return (
        <Card>
            <h2 className="text-lg font-semibold text-white mb-4">Running Frequency Heatmap</h2>
            <div className="flex flex-col items-center overflow-x-auto">
                 <div className="grid grid-flow-col grid-rows-7 gap-1 min-w-max">
                    {[...Array(firstDayOffset)].map((_, i) => <div key={`empty-${i}`} className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-sm" />)}
                    {data.map(({ date, distance }, index) => (
                        <div key={index} className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-sm ${getColor(distance)}`} title={`${date.toDateString()}: ${distance.toFixed(1)}km`} />
                    ))}
                </div>
                 <div className="flex justify-end mt-2 text-xs text-gray-400 self-stretch items-center">
                     <span>Less</span>
                     <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-sm bg-gray-800 mx-1" />
                     <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-sm bg-brand-orange/20 mx-1" />
                     <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-sm bg-brand-orange/40 mx-1" />
                     <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-sm bg-brand-orange/60 mx-1" />
                     <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-sm bg-brand-orange/80 mx-1" />
                     <span>More</span>
                 </div>
            </div>
        </Card>
    );
};

const Analytics: React.FC = () => {
    const { runs, goals, loading } = useAppContext();

    const chartData = useMemo(() => {
        return runs
            .map(run => ({
                ...run,
                dateObj: new Date(run.date)
            }))
            .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
            .map(run => ({
                name: run.dateObj.toLocaleDateString('en-IN'),
                pace: run.distance_m > 0 ? (run.total_time_sec / 60) / (run.distance_m / 1000) : 0, // min/km
                speed: run.avg_speed_kmh,
                distance: run.distance_m / 1000,
            }));
    }, [runs]);

    const weeklyDistanceData = useMemo(() => {
        const weeks: { [key: string]: { distance: number, runs: number, avgPace: number } } = {};
        runs.forEach(run => {
            const date = new Date(run.date);
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(date);
            monday.setDate(diff);
            const weekStart = monday.toLocaleDateString('en-IN');

            if (!weeks[weekStart]) weeks[weekStart] = { distance: 0, runs: 0, avgPace: 0 };
            weeks[weekStart].distance += run.distance_m / 1000;
            weeks[weekStart].runs += 1;
            weeks[weekStart].avgPace += run.distance_m > 0 ? (run.total_time_sec / 60) / (run.distance_m / 1000) : 0;
        });
        return Object.keys(weeks).sort().map(week => ({
            name: week,
            distance: weeks[week].distance,
            runs: weeks[week].runs,
            avgPace: weeks[week].avgPace / weeks[week].runs,
            goal: goals?.weekly_distance_km || 0
        })).slice(-8);
    }, [runs, goals]);

    const monthlyData = useMemo(() => {
        const months: { [key: string]: { distance: number, runs: number, time: number } } = {};
        runs.forEach(run => {
            const date = new Date(run.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!months[monthKey]) months[monthKey] = { distance: 0, runs: 0, time: 0 };
            months[monthKey].distance += run.distance_m / 1000;
            months[monthKey].runs += 1;
            months[monthKey].time += run.total_time_sec / 3600;
        });
        return Object.keys(months).sort().map(month => ({
            name: month,
            distance: months[month].distance,
            runs: months[month].runs,
            time: months[month].time
        })).slice(-6);
    }, [runs]);

    const goalProgressData = useMemo(() => {
        if (!goals?.distance_goals?.length) return [];
        return goals.distance_goals.map(goal => {
            const relevantRuns = runs.filter(run => (run.distance_m / 1000) >= goal.distance_km * 0.8);
            const bestTime = relevantRuns.length > 0 ? Math.min(...relevantRuns.map(run => run.total_time_sec)) : 0;
            const targetSeconds = goal.target_time.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
            const progress = bestTime > 0 ? Math.min((targetSeconds / bestTime) * 100, 100) : 0;
            
            return {
                name: goal.name,
                progress,
                best: bestTime / 60,
                target: targetSeconds / 60,
                distance: goal.distance_km
            };
        });
    }, [runs, goals]);

    const performanceData = useMemo(() => {
        return chartData.map((item, index) => ({
            ...item,
            cumDistance: chartData.slice(0, index + 1).reduce((sum, run) => sum + run.distance, 0),
            efficiency: item.speed / (item.pace || 1)
        }));
    }, [chartData]);

    if (loading) {
        return <AnalyticsSkeleton />;
    }

    if (runs.length < 1) {
        return <div className="text-center text-gray-400 p-8">Not enough data to display analytics. Go for a run!</div>;
    }

    const renderChart = (title: string, data: any[], yKey: string, yUnit: string, color: string) => (
         <Card>
            <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                    <XAxis dataKey="name" stroke="#888" fontSize={10} tick={{ fill: '#9CA3AF' }} />
                    <YAxis stroke="#888" fontSize={10} tick={{ fill: '#9CA3AF' }} unit={yUnit} domain={['dataMin - 1', 'dataMax + 1']} tickFormatter={yKey === 'pace' ? formatPace : undefined} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} name={title.split('(')[0].trim()} />
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Analytics</h1>

            <Heatmap runs={runs} />

            {/* Goal Progress Section */}
            {goalProgressData.length > 0 && (
                <Card>
                    <h2 className="text-lg font-semibold text-white mb-4">Goal Progress</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {goalProgressData.map((goal, index) => (
                            <div key={index} className="bg-gray-800 p-4 rounded-lg">
                                <h3 className="font-semibold text-white mb-2">{goal.name}</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Target:</span>
                                        <span className="text-white">{formatPace(goal.target)} min/km</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Best:</span>
                                        <span className="text-green-400">{goal.best > 0 ? formatPace(goal.best) : 'N/A'} min/km</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div className="bg-brand-orange h-2 rounded-full" style={{ width: `${goal.progress}%` }}></div>
                                    </div>
                                    <div className="text-xs text-gray-400">{goal.progress.toFixed(1)}% achieved</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Advanced Performance Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card>
                    <h2 className="text-lg font-semibold text-white mb-4">Performance Trend</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={performanceData.slice(-14)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                            <XAxis dataKey="name" stroke="#888" fontSize={10} tick={{ fill: '#9CA3AF' }} />
                            <YAxis yAxisId="left" stroke="#888" fontSize={10} tick={{ fill: '#9CA3AF' }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#888" fontSize={10} tick={{ fill: '#9CA3AF' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area yAxisId="left" type="monotone" dataKey="distance" fill="#FF7A00" fillOpacity={0.3} stroke="#FF7A00" name="Distance (km)" />
                            <Line yAxisId="right" type="monotone" dataKey="pace" stroke="#8884d8" strokeWidth={2} name="Pace (min/km)" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </Card>

                <Card>
                    <h2 className="text-lg font-semibold text-white mb-4">Cumulative Distance</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                            <XAxis dataKey="name" stroke="#888" fontSize={10} tick={{ fill: '#9CA3AF' }} />
                            <YAxis stroke="#888" fontSize={10} tick={{ fill: '#9CA3AF' }} unit=" km" />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="cumDistance" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} name="Total Distance (km)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Weekly Analysis with Goals */}
            <Card>
                <h2 className="text-lg font-semibold text-white mb-4">Weekly Performance vs Goals</h2>
                <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={weeklyDistanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                        <XAxis dataKey="name" stroke="#888" fontSize={10} tick={{ fill: '#9CA3AF' }} />
                        <YAxis yAxisId="left" stroke="#888" fontSize={10} tick={{ fill: '#9CA3AF' }} unit=" km" />
                        <YAxis yAxisId="right" orientation="right" stroke="#888" fontSize={10} tick={{ fill: '#9CA3AF' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="distance" fill="#FF7A00" name="Distance (km)" />
                        <Bar yAxisId="right" dataKey="runs" fill="#8884d8" name="Runs" />
                        {goals?.weekly_distance_km && <ReferenceLine yAxisId="left" y={goals.weekly_distance_km} stroke="#ef4444" strokeDasharray="5 5" label="Goal" />}
                    </ComposedChart>
                </ResponsiveContainer>
            </Card>

            {/* Monthly Overview */}
            <Card>
                <h2 className="text-lg font-semibold text-white mb-4">Monthly Overview</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                        <XAxis dataKey="name" stroke="#888" fontSize={10} tick={{ fill: '#9CA3AF' }} />
                        <YAxis yAxisId="left" stroke="#888" fontSize={10} tick={{ fill: '#9CA3AF' }} />
                        <YAxis yAxisId="right" orientation="right" stroke="#888" fontSize={10} tick={{ fill: '#9CA3AF' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="distance" fill="#FF7A00" name="Distance (km)" />
                        <Line yAxisId="right" type="monotone" dataKey="runs" stroke="#8884d8" strokeWidth={2} name="Total Runs" />
                        <Line yAxisId="right" type="monotone" dataKey="time" stroke="#82ca9d" strokeWidth={2} name="Hours" />
                    </ComposedChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};

export default Analytics;

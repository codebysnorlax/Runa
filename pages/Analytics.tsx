import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import Skeleton from '../components/Skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

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


const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-dark-card border border-dark-border p-2 rounded-md shadow-lg">
                <p className="label text-white">{`${label}`}</p>
                {payload.map((pld: any, index: number) => (
                    <p key={index} style={{ color: pld.color }}>
                        {`${pld.name}: ${pld.value.toFixed(2)}`}
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
            <div className="flex flex-col items-center">
                 <div className="grid grid-flow-col grid-rows-7 gap-1">
                    {[...Array(firstDayOffset)].map((_, i) => <div key={`empty-${i}`} className="w-3.5 h-3.5 rounded-sm" />)}
                    {data.map(({ date, distance }, index) => (
                        <div key={index} className={`w-3.5 h-3.5 rounded-sm ${getColor(distance)}`} title={`${date.toDateString()}: ${distance.toFixed(1)}km`} />
                    ))}
                </div>
                 <div className="flex justify-end mt-2 text-xs text-gray-400 self-stretch items-center">
                     <span>Less</span>
                     <div className="w-3.5 h-3.5 rounded-sm bg-gray-800 mx-1" />
                     <div className="w-3.5 h-3.5 rounded-sm bg-brand-orange/20 mx-1" />
                     <div className="w-3.5 h-3.5 rounded-sm bg-brand-orange/40 mx-1" />
                     <div className="w-3.5 h-3.5 rounded-sm bg-brand-orange/60 mx-1" />
                     <div className="w-3.5 h-3.5 rounded-sm bg-brand-orange/80 mx-1" />
                     <span>More</span>
                 </div>
            </div>
        </Card>
    );
};

const Analytics: React.FC = () => {
    const { runs, loading } = useAppContext();

    const chartData = useMemo(() => {
        return runs
            .map(run => ({
                ...run,
                dateObj: new Date(run.date)
            }))
            .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
            .map(run => ({
                name: run.dateObj.toLocaleDateString('en-CA'),
                pace: run.distance_m > 0 ? (run.total_time_sec / 60) / (run.distance_m / 1000) : 0, // min/km
                speed: run.avg_speed_kmh,
                distance: run.distance_m / 1000,
            }));
    }, [runs]);

    const weeklyDistanceData = useMemo(() => {
        const weeks: { [key: string]: number } = {};
        runs.forEach(run => {
            const date = new Date(run.date);
            const dayOfWeek = date.getDay();
            const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is sunday
            const weekStart = new Date(date.setDate(diff)).toLocaleDateString('en-CA');

            if (!weeks[weekStart]) weeks[weekStart] = 0;
            weeks[weekStart] += run.distance_m / 1000;
        });
        return Object.keys(weeks).map(week => ({ name: week, distance: weeks[week] })).slice(-8); // last 8 weeks
    }, [runs]);

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
                <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                    <XAxis dataKey="name" stroke="#888" fontSize={12} tick={{ fill: '#9CA3AF' }} />
                    <YAxis stroke="#888" fontSize={12} tick={{ fill: '#9CA3AF' }} unit={yUnit} domain={['dataMin - 1', 'dataMax + 1']} />
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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderChart("Pace Trend (min/km)", chartData.slice(-14), "pace", " min/km", "#FF7A00")}
                {renderChart("Speed Trend (km/h)", chartData.slice(-14), "speed", " km/h", "#8884d8")}
            </div>
             <Card>
                <h2 className="text-lg font-semibold text-white mb-4">Weekly Distance</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyDistanceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                        <XAxis dataKey="name" stroke="#888" fontSize={12} tick={{ fill: '#9CA3AF' }} />
                        <YAxis stroke="#888" fontSize={12} tick={{ fill: '#9CA3AF' }} unit=" km"/>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="distance" fill="#FF7A00" name="Distance (km)" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};

export default Analytics;
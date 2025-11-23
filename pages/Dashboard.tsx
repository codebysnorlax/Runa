import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import ProgressRing from '../components/ProgressRing';
import Skeleton from '../components/Skeleton';
import { TrendingUp, TrendingDown, ArrowRight, Trophy, Zap, Clock, Route } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Run, PersonalRecords } from '../types';

const DashboardSkeleton: React.FC = () => (
    <div className="space-y-6">
        <Skeleton className="h-9 w-3/4" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <Card className="flex-1 space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-3/4" />
            </Card>
            <Card className="flex-1 space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-3/4" />
            </Card>
            <Card className="flex-1 space-y-3 sm:col-span-2 lg:col-span-1">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-1/3" />
            </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            <Card className="xl:col-span-1 flex flex-col items-center justify-center space-y-4 p-6">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-40 w-40 rounded-full" />
            </Card>
            <Card className="md:col-span-1 xl:col-span-2 space-y-4 p-6">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-1/4" />
            </Card>
        </div>

        <Card className="space-y-4 p-6">
            <Skeleton className="h-6 w-1/4" />
            <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        </Card>
    </div>
);


const Dashboard: React.FC = () => {
    const { profile, runs, goals, insights, loading } = useAppContext();

    const personalRecords = useMemo<PersonalRecords | null>(() => {
        if (runs.length === 0) return null;
        return runs.reduce((acc, run) => ({
            longestDistance: Math.max(acc.longestDistance, run.distance_m),
            longestDuration: Math.max(acc.longestDuration, run.total_time_sec),
            fastestAvgSpeed: Math.max(acc.fastestAvgSpeed, run.avg_speed_kmh),
        }), { longestDistance: 0, longestDuration: 0, fastestAvgSpeed: 0 });
    }, [runs]);

    if (loading) {
        return <DashboardSkeleton />;
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const todayRun = runs.find(run => new Date(run.date).setHours(0,0,0,0) === today.getTime());
    const yesterdayRun = runs.find(run => new Date(run.date).setHours(0,0,0,0) === yesterday.getTime());

    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 7);
    const last7DaysRuns = runs.filter(run => new Date(run.date) >= last7Days);
    const last7DaysDistance = last7DaysRuns.reduce((sum, run) => sum + run.distance_m, 0) / 1000;

    const goalProgress = goals && goals.weekly_distance_km > 0 ? (last7DaysDistance / goals.weekly_distance_km) * 100 : 0;

    const latestInsight = insights?.insights?.[0];

    const StatCard: React.FC<{title: string, value: string, change?: number, unit: string}> = ({title, value, change, unit}) => (
        <Card className="flex-1">
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-3xl font-bold text-white">{value} <span className="text-lg">{unit}</span></p>
            {change !== undefined && (
                <div className={`flex items-center text-sm mt-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {change >= 0 ? <TrendingUp className="w-4 h-4 mr-1"/> : <TrendingDown className="w-4 h-4 mr-1"/>}
                    {Math.abs(change).toFixed(1)}% vs yesterday
                </div>
            )}
        </Card>
    );

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return [h > 0 ? h : null, m, s]
            .filter(v => v !== null)
            .map(v => String(v).padStart(2, '0'))
            .join(':');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white animate-fade-in">Welcome back, {profile?.name}!</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="animate-slide-up" style={{animationDelay: '0.1s'}}>
                    <StatCard title="Today's Distance" value={todayRun ? (todayRun.distance_m / 1000).toFixed(2) : '0'} unit="km" 
                        change={todayRun && yesterdayRun && yesterdayRun.distance_m > 0 ? ((todayRun.distance_m - yesterdayRun.distance_m) / yesterdayRun.distance_m) * 100 : undefined } />
                </div>
                <div className="animate-slide-up" style={{animationDelay: '0.2s'}}>
                    <StatCard title="Today's Avg Speed" value={todayRun ? todayRun.avg_speed_kmh.toFixed(2) : '0'} unit="km/h" 
                        change={todayRun && yesterdayRun && yesterdayRun.avg_speed_kmh > 0 ? ((todayRun.avg_speed_kmh - yesterdayRun.avg_speed_kmh) / yesterdayRun.avg_speed_kmh) * 100 : undefined} />
                </div>
                <div className="animate-slide-up" style={{animationDelay: '0.3s'}}>
                    <StatCard title="Last 7 Days" value={last7DaysDistance.toFixed(2)} unit="km" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                <Card className="xl:col-span-1 flex flex-col items-center justify-center animate-scale-in" style={{animationDelay: '0.4s'}}>
                    <h2 className="text-base sm:text-lg font-semibold text-white mb-4">Weekly Goal Progress</h2>
                    <ProgressRing radius={80} stroke={10} progress={goalProgress} label="of weekly km" />
                </Card>
                <Card className="md:col-span-1 xl:col-span-2 animate-slide-left" style={{animationDelay: '0.5s'}}>
                     <h2 className="text-base sm:text-lg font-semibold text-white mb-2">Latest AI Insight</h2>
                     {latestInsight ? (
                        <div>
                            <h3 className="text-brand-orange font-bold">{latestInsight.title}</h3>
                            <p className="text-gray-300 mt-2">{latestInsight.content}</p>
                             <Link to="/insights" className="text-brand-orange hover:underline flex items-center mt-4 text-sm font-semibold">
                                View All Insights <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-8 flex flex-col items-center justify-center h-full">
                            <p className="text-gray-400">No insights yet. Generate them on the AI Insights page!</p>
                            <Link to="/insights" className="mt-4 inline-block bg-brand-orange text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors">
                                Generate Insights
                            </Link>
                        </div>
                    )}
                </Card>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                 {personalRecords && (
                    <Card className="animate-slide-right" style={{animationDelay: '0.6s'}}>
                        <h2 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center"><Trophy className="w-5 h-5 mr-2 text-yellow-400"/> Personal Records</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between hover:bg-gray-800 p-2 rounded transition-colors">
                                <span className="text-sm sm:text-base text-gray-300 flex items-center"><Route className="w-4 h-4 mr-2"/> Longest Distance</span>
                                <span className="font-bold text-white">{(personalRecords.longestDistance / 1000).toFixed(2)} km</span>
                            </div>
                             <div className="flex items-center justify-between hover:bg-gray-800 p-2 rounded transition-colors">
                                <span className="text-sm sm:text-base text-gray-300 flex items-center"><Clock className="w-4 h-4 mr-2"/> Longest Duration</span>
                                <span className="font-bold text-white">{formatDuration(personalRecords.longestDuration)}</span>
                            </div>
                             <div className="flex items-center justify-between hover:bg-gray-800 p-2 rounded transition-colors">
                                <span className="text-sm sm:text-base text-gray-300 flex items-center"><Zap className="w-4 h-4 mr-2"/> Fastest Avg Speed</span>
                                <span className="font-bold text-white">{personalRecords.fastestAvgSpeed.toFixed(2)} km/h</span>
                            </div>
                        </div>
                    </Card>
                )}
                 <Card className="animate-slide-left" style={{animationDelay: '0.7s'}}>
                    <h2 className="text-base sm:text-lg font-semibold text-white mb-4">Recent Runs</h2>
                    {runs.length > 0 ? (
                    <ul className="space-y-3">
                        {runs.slice(0, 3).map((run, idx) => (
                            <li key={run.id} className="flex justify-between items-center p-3 bg-gray-800 rounded-md hover:bg-gray-750 transition-all hover:scale-[1.02]" style={{animationDelay: `${0.8 + idx * 0.1}s`}}>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm sm:text-base">{new Date(run.date).toLocaleDateString()}</p>
                                    <p className="text-xs sm:text-sm text-gray-400 truncate">{run.notes || 'No notes'}</p>
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                    <p className="font-bold text-sm sm:text-base">{(run.distance_m / 1000).toFixed(2)} km</p>
                                    <p className="text-xs sm:text-sm text-gray-400">{run.avg_speed_kmh.toFixed(1)} km/h</p>
                                </div>
                            </li>
                        ))}
                         <Link to="/history" className="text-brand-orange hover:underline flex items-center mt-4 text-sm font-semibold">
                            View Full History <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </ul>
                    ) : (
                         <div className="text-center py-8">
                            <p className="text-gray-400">No runs logged yet. Add your first run!</p>
                             <Link to="/add-run" className="mt-4 inline-block bg-brand-orange text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors">
                                Add a Run
                            </Link>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateInsightsAndPlan } from '../services/aiService';
import Card from '../components/Card';
import Skeleton from '../components/Skeleton';
import { Loader2, Zap, HeartPulse, ShieldCheck, ThumbsDown, Target } from 'lucide-react';
import Toast from '../components/Toast';

const AiInsightsSkeleton: React.FC = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <Skeleton className="h-9 w-1/3" />
            <Skeleton className="h-10 w-48" />
        </div>
        <Card className="flex items-center justify-between p-6">
            <div className="w-2/3 space-y-2">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-16 w-1/4" />
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <Card key={i} className="space-y-3 p-6">
                    <div className="flex items-start space-x-4">
                        <Skeleton className="w-6 h-6 rounded-full" />
                        <div className="w-full space-y-2">
                           <Skeleton className="h-5 w-3/4" />
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-5/6" />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
        <Card>
            <Skeleton className="h-7 w-1/2 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                 {[...Array(7)].map((_, i) => (
                    <div key={i} className="space-y-2 p-3 bg-gray-800 rounded-md">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-1/2" />
                    </div>
                ))}
            </div>
        </Card>
    </div>
);

const GeneratingContentSkeleton: React.FC = () => (
    <div className="space-y-6">
        <Card className="flex items-center justify-between p-6">
            <div className="w-2/3 space-y-2">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-16 w-1/4" />
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <Card key={i} className="space-y-3 p-6">
                    <div className="flex items-start space-x-4">
                        <Skeleton className="w-6 h-6 rounded-full" />
                        <div className="w-full space-y-2">
                           <Skeleton className="h-5 w-3/4" />
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-5/6" />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
        <Card>
            <Skeleton className="h-7 w-1/2 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                 {[...Array(7)].map((_, i) => (
                    <div key={i} className="space-y-2 p-3 bg-gray-800 rounded-md">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-1/2" />
                    </div>
                ))}
            </div>
        </Card>
    </div>
);


const AiInsights: React.FC = () => {
    const { runs, goals, profile, insights, updateInsights, loading: contextLoading } = useAppContext();
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const handleGenerate = async () => {
        if (!profile || !goals || runs.length === 0) {
            setToast({ message: 'Complete your profile, set goals, and add at least one run to generate insights.', type: 'error' });
            return;
        }

        setIsGenerating(true);
        setError(null);
        try {
            const newInsightsData = await generateInsightsAndPlan(runs, goals, profile);
            if (newInsightsData) {
                updateInsights(newInsightsData);
                setToast({ message: 'Insights generated successfully!', type: 'success' });
            } else {
                setError('AI service is currently unavailable. Please try again later.');
            }
        } catch (err: any) {
            console.error('AI Insights Error:', err);
            if (err.message?.includes('API key')) {
                setError('AI service configuration error. Please check API key settings.');
            } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
                setError('Network error. Please check your internet connection and try again.');
            } else if (err.message?.includes('quota') || err.message?.includes('limit')) {
                setError('AI service quota exceeded. Please try again later.');
            } else {
                setError(`AI service error: ${err.message || 'Unknown error occurred. Please try again.'}`);
            }
        }
        setIsGenerating(false);
    };

    const getInsightIcon = (type: 'positive' | 'negative' | 'neutral') => {
        switch(type) {
            case 'positive': return <ShieldCheck className="w-6 h-6 text-green-400 flex-shrink-0" />;
            case 'negative': return <ThumbsDown className="w-6 h-6 text-red-400 flex-shrink-0" />;
            case 'neutral': return <HeartPulse className="w-6 h-6 text-blue-400 flex-shrink-0" />;
            default: return <Zap className="w-6 h-6 text-yellow-400 flex-shrink-0" />;
        }
    };

    const insightBgColor = (type: 'positive' | 'negative' | 'neutral') => {
        switch(type) {
            case 'positive': return 'border-green-500/50';
            case 'negative': return 'border-red-500/50';
            case 'neutral': return 'border-blue-500/50';
            default: return 'border-dark-border';
        }
    };

    if(contextLoading) {
        return <AiInsightsSkeleton />;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-24 lg:pb-6 px-4 sm:px-0">
             {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">AI Insights</h1>
                    <p className="text-sm text-gray-400 mt-1">Powered by Google Gemini</p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full sm:w-auto flex items-center justify-center bg-brand-orange text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="animate-spin w-5 h-5 mr-2" />
                            Generating...
                        </>
                    ) : (
                         <>
                            <Zap className="w-5 h-5 mr-2" />
                            Generate Insights
                        </>
                    )}
                </button>
            </div>

            {isGenerating ? (
                <GeneratingContentSkeleton />
            ) : (
                <>
                    {insights && insights.improvementScore > 0 && (
                        <Card className="bg-gradient-to-br from-orange-500/10 to-purple-500/10 border border-orange-500/20">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-center sm:text-left">
                                    <h2 className="text-lg sm:text-xl font-bold text-white mb-1">Improvement Score</h2>
                                    <p className="text-sm text-gray-400">Based on your recent activity</p>
                                </div>
                                 <div className="flex items-center gap-3">
                                    <Target className="w-10 h-10 sm:w-12 sm:h-12 text-brand-orange" />
                                    <div className="text-center">
                                        <p className="text-4xl sm:text-5xl font-bold text-white">{insights.improvementScore}</p>
                                        <p className="text-sm text-gray-400">out of 100</p>
                                    </div>
                                 </div>
                            </div>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {insights?.insights?.map(insight => (
                             <Card key={insight.id} className={`border-l-4 ${insightBgColor(insight.type)} hover:scale-[1.02] transition-transform`}>
                                <div className="flex items-start gap-3">
                                   {getInsightIcon(insight.type)}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white mb-2">{insight.title}</h3>
                                        <p className="text-sm text-gray-300 leading-relaxed">{insight.content}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                     {insights && insights.weeklyPlan && Object.values(insights.weeklyPlan).some(p => p) && (
                        <div className="-mx-4 sm:mx-0">
                            <h2 className="text-xl font-bold text-white mb-4 px-4 sm:px-0">Weekly Training Plan</h2>
                            <div className="flex gap-3 overflow-x-auto pb-2 px-4 sm:px-0 snap-x snap-mandatory scroll-smooth scrollbar-hide">
                                {Object.entries(insights.weeklyPlan).map(([day, plan]) => (
                                    <div key={day} className="flex-shrink-0 w-40 p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-brand-orange/50 transition-all snap-start">
                                        <p className="font-semibold capitalize text-brand-orange mb-2">{day}</p>
                                        <p className="text-sm text-gray-300 leading-relaxed">{plan || 'Rest day'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                     )}

                    {error && (
                        <Card>
                            <div className="text-center py-12">
                                <ThumbsDown className="w-16 h-16 mx-auto text-red-400 mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">AI Service Error</h3>
                                <p className="text-gray-400 mb-4">{error}</p>
                                <button
                                    onClick={() => setError(null)}
                                    className="text-brand-orange hover:text-orange-400 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </Card>
                    )}

                    {!error && (!insights || insights?.insights?.length === 0) && (
                        <Card>
                            <div className="text-center py-12">
                                <Zap className="w-16 h-16 mx-auto text-brand-orange mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">No AI Insights Available</h3>
                                <p className="text-gray-400 mb-4">Generate personalized insights based on your running data</p>
                                <p className="text-sm text-gray-500">Make sure you have profile, goals, and at least one run recorded</p>
                            </div>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
};

export default AiInsights;

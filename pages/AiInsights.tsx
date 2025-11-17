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
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const handleGenerate = async () => {
        if (!profile || !goals || runs.length === 0) {
            setToast({ message: 'Need profile, goals, and at least one run to generate insights.', type: 'error' });
            return;
        }

        setIsGenerating(true);
        const newInsightsData = await generateInsightsAndPlan(runs, goals, profile);
        if (newInsightsData) {
            updateInsights(newInsightsData);
            setToast({ message: 'Insights generated successfully!', type: 'success' });
        } else {
             setToast({ message: 'Failed to generate insights. Please try again.', type: 'error' });
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
        <div className="space-y-6">
             {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">AI Insights</h1>
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex items-center justify-center bg-brand-orange text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-500"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="animate-spin w-5 h-5 mr-2" />
                            Generating...
                        </>
                    ) : (
                         <>
                            <Zap className="w-5 h-5 mr-2" />
                            Generate New Insights
                        </>
                    )}
                </button>
            </div>
            
            {isGenerating ? (
                <GeneratingContentSkeleton />
            ) : (
                <>
                    {insights && insights.improvementScore > 0 && (
                        <Card className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-white">Overall Improvement Score</h2>
                                <p className="text-gray-400">A measure of your progress based on recent activity.</p>
                            </div>
                             <div className="flex items-center space-x-2">
                                <Target className="w-8 h-8 text-brand-orange" />
                                <p className="text-4xl font-bold text-white">{insights.improvementScore}<span className="text-2xl text-gray-400">/100</span></p>
                             </div>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {insights?.insights?.map(insight => (
                             <Card key={insight.id} className={`border-l-4 ${insightBgColor(insight.type)}`}>
                                <div className="flex items-start space-x-4">
                                   {getInsightIcon(insight.type)}
                                    <div>
                                        <h3 className="font-bold text-white">{insight.title}</h3>
                                        <p className="text-sm text-gray-300 mt-1">{insight.content}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                     {insights && insights.weeklyPlan && Object.values(insights.weeklyPlan).some(p => p) && (
                        <Card>
                            <h2 className="text-xl font-bold text-white mb-4">Your AI-Generated Weekly Plan</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                                {Object.entries(insights.weeklyPlan).map(([day, plan]) => (
                                    <div key={day} className="p-3 bg-gray-800 rounded-md">
                                        <p className="font-bold capitalize text-brand-orange">{day}</p>
                                        <p className="text-sm text-gray-300 mt-1">{plan || 'Not set'}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                     )}
                    
                    {insights?.insights?.length === 0 &&
                        <div className="text-center py-16">
                            <Zap className="w-16 h-16 mx-auto text-gray-600" />
                            <p className="mt-4 text-gray-400">Click "Generate New Insights" to get your personalized analysis.</p>
                        </div>
                    }
                </>
            )}
        </div>
    );
};

export default AiInsights;
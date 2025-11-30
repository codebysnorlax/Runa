import React, { useState } from 'react';
import { Lock, Instagram } from 'lucide-react';
import Card from '../components/Card';
import Toast from '../components/Toast';
import AiInsights from './AiInsights';

const ProtectedInsights: React.FC = () => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isBreaking, setIsBreaking] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const [showContactBtn, setShowContactBtn] = useState(false);

    const correctPassword = process.env.GETIN_PASSWORD;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === correctPassword) {
            setIsBreaking(true);
            setTimeout(() => setIsAuthenticated(true), 600);
        } else {
            setIsShaking(true);
            setShowContactBtn(true);
            setToast({ message: 'Incorrect password', type: 'error' });
            setTimeout(() => setIsShaking(false), 500);
        }
    };

    if (isAuthenticated) {
        return <AiInsights />;
    }

    return (
        <div className="min-h-[75vh] flex items-center justify-center px-4 relative overflow-hidden">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className={`max-w-md w-full transition-all duration-500 ${isBreaking ? 'animate-break' : ''}`}>
                <Card className="relative">
                    <div className="text-center mb-8">
                        <div className={`inline-block mb-6 transition-all duration-300 ${isBreaking ? 'scale-0 rotate-180' : ''}`}>
                            <Lock className="w-16 h-16 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">AI Insights</h2>
                        <p className="text-sm text-gray-400">Enter password to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            disabled={isBreaking}
                            className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all disabled:opacity-50 ${isShaking ? 'animate-shake border-red-500' : ''}`}
                        />

                        <button
                            type="submit"
                            disabled={!password || isBreaking}
                            className="w-full bg-brand-orange hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Unlock
                        </button>

                        {showContactBtn && !isBreaking && (
                            <button
                                type="button"
                                onClick={() => window.open('https://instagram.com/nr_snorlax', '_blank')}
                                className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Instagram className="w-5 h-5" />
                                Contact Developer
                            </button>
                        )}
                    </form>

                    <p className="text-xs text-center text-gray-500 mt-6">Hint: 10072005</p>
                </Card>
            </div>

            <style>{`
                @keyframes break {
                    0% {
                        transform: scale(1) rotate(0deg);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.1) rotate(5deg);
                        opacity: 0.8;
                    }
                    100% {
                        transform: scale(0.8) rotate(-10deg) translateY(100px);
                        opacity: 0;
                    }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
                    20%, 40%, 60%, 80% { transform: translateX(10px); }
                }
                .animate-break {
                    animation: break 0.6s ease-out forwards;
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default ProtectedInsights;

import React, { useState } from 'react';
import { Lock, Instagram } from 'lucide-react';
import Card from '../components/Card';
import Toast from '../components/Toast';
import AiInsights from './AiInsights';

const ProtectedInsights: React.FC = () => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const [showContactBtn, setShowContactBtn] = useState(false);

    const correctPassword = process.env.GETIN_PASSWORD;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === correctPassword) {
            setIsAuthenticated(true);
            setToast({ message: 'Access granted to AI Insights!', type: 'success' });
        } else {
            setShowContactBtn(true);
            setToast({
                message: 'Access denied. Contact the developer for permission.',
                type: 'error'
            });
        }
    };

    if (isAuthenticated) {
        return <AiInsights />;
    }

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full">
                    <div className="text-center mb-6">
                        <Lock className="w-16 h-16 mx-auto text-brand-orange mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">AI Insights Access</h2>
                        <p className="text-gray-400">This feature requires special permission</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="insights-password" className="block text-sm font-medium text-gray-300 mb-1">
                                Access Password
                            </label>
                            <input
                                id="insights-password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Try: 10072005"
                                className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-brand-orange focus:border-brand-orange"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full flex justify-center items-center bg-brand-orange text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:bg-gray-500"
                            disabled={!password}
                        >
                            <Lock className="w-5 h-5 mr-2" />
                            Access AI Insights
                        </button>
                        {showContactBtn && (
                            <button
                                type="button"
                                onClick={() => window.open('https://instagram.com/nr_snorlax', '_blank')}
                                className="w-full flex justify-center items-center bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200"
                            >
                                <Instagram className="w-5 h-5 mr-2" />
                                Contact Developer
                            </button>
                        )}
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default ProtectedInsights;

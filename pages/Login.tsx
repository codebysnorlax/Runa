import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import dashboardImg from '../assets/dashboard.png';
import analyticsImg from '../assets/analytics.png';
import historyImg from '../assets/history.png';
import insightsImg from '../assets/insights.png';
import goalImg from '../assets/goal.png';

const images = [dashboardImg, analyticsImg, historyImg, insightsImg, goalImg];

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [currentImage, setCurrentImage] = useState(0);
    const { login } = useAppContext();
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            login(username.trim().toLowerCase());
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900">
            <header className="border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                    <h1 className="text-xl sm:text-2xl font-semibold text-white">
                        <span className="text-brand-orange">Runa</span>
                    </h1>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="text-center pt-12 sm:pt-16 md:pt-20 pb-8">
                    <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-3 sm:mb-4 px-2">
                        AI-Powered Fitness Tracker
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
                        Track your runs, analyze performance, and get intelligent insights. All your data stays private in your browser.
                    </p>

                    <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-10 sm:mb-12 px-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 sm:px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange transition-colors"
                                required
                            />
                            <button
                                type="submit"
                                className="w-full sm:w-auto bg-brand-orange hover:bg-orange-600 text-white font-medium px-8 py-3 rounded-lg transition-colors whitespace-nowrap"
                            >
                                Start
                            </button>
                        </div>
                    </form>

                    <div className="max-w-6xl mx-auto px-4">
                        <div className="relative overflow-hidden rounded-lg">
                            {images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`Screenshot ${index + 1}`}
                                    className={`rounded-lg border border-gray-800 shadow-2xl w-full transition-all duration-1000 ${
                                        index === currentImage ? 'relative opacity-100 scale-100' : 'absolute inset-0 opacity-0 scale-95'
                                    }`}
                                    style={{
                                        transition: 'opacity 1s ease-in-out, transform 1s ease-in-out'
                                    }}
                                />
                            ))}
                        </div>
                        <div className="flex justify-center items-center gap-2 mt-6 mb-4">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImage(index)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                                        index === currentImage 
                                            ? 'bg-brand-orange shadow-lg shadow-brand-orange/50' 
                                            : 'bg-gray-600 hover:bg-gray-500'
                                    }`}
                                    style={{
                                        transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Login;

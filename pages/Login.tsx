import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import { LogIn } from 'lucide-react';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAppContext();
    const navigate = useNavigate();

    const correctPassword = process.env.GETIN_PASSWORD;
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== correctPassword) {
            setError('');
            return;
        }
        if (username.trim()) {
            login(username.trim().toLowerCase());
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
            <Card className="max-w-sm w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-brand-orange">FitAI</h1>
                    <p className="text-gray-400">Your AI-Powered Fitness Tracker</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter any username"
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-brand-orange focus:border-brand-orange"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-brand-orange focus:border-brand-orange"
                        />
                    </div>
                    {password && password !== correctPassword && (
                        <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded">
                            You are not allowed. Contact developer{' '}
                            <a 
                                href="https://instagram.com/nr_snorlax" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-brand-orange hover:underline font-medium"
                            >
                                @nr_snorlax
                            </a>{' '}
                            to get in.
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full flex justify-center items-center bg-brand-orange text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:bg-gray-500"
                        disabled={!username.trim() || !password}
                    >
                        <LogIn className="w-5 h-5 mr-2" />
                        Enter Dashboard
                    </button>
                </form>
            </Card>
        </div>
    );
};

export default Login;

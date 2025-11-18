import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import { LogIn } from 'lucide-react';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const { login } = useAppContext();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            login(username.trim().toLowerCase());
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
            <Card className="max-w-sm w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-brand-orange">Runa</h1>
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

                    <button
                        type="submit"
                        className="w-full flex justify-center items-center bg-brand-orange text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:bg-gray-500"
                        disabled={!username.trim()}
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

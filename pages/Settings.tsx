import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Goal, Profile, DistanceGoal } from '../types';
import Card from '../components/Card';
import Skeleton from '../components/Skeleton';
import Toast from '../components/Toast';
import { User, Target, Download, Upload, Database, Plus, Trash2 } from 'lucide-react';
import * as storage from '../services/storageService';

const SettingsSkeleton: React.FC = () => (
    <div className="max-w-2xl mx-auto">
        <Skeleton className="h-9 w-1/2 mb-6" />
        <Card>
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/3" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-12 w-full" />
            </div>
        </Card>
    </div>
);

type ActiveTab = 'profile' | 'goals' | 'backup';

const Settings: React.FC = () => {
    const { profile, goals, updateProfile, updateGoals, loading, currentUser, refreshData } = useAppContext();
    const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
    
    const [profileState, setProfileState] = useState<Profile | null>(null);
    const [goalState, setGoalState] = useState<Goal | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    useEffect(() => {
        if (profile) setProfileState({ ...profile });
        if (goals) {
            setGoalState({
                ...goals,
                distance_goals: goals.distance_goals || []
            });
        }
    }, [profile, goals]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (profileState) {
            setProfileState({ ...profileState, [e.target.name]: e.target.value });
        }
    };

    const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (goalState) {
            setGoalState({ ...goalState, [e.target.name]: e.target.value });
        }
    };

    const addDistanceGoal = () => {
        if (goalState) {
            const newGoal: DistanceGoal = {
                id: crypto.randomUUID(),
                distance_km: 1,
                target_time: '06:00',
                name: 'New Goal'
            };
            setGoalState({
                ...goalState,
                distance_goals: [...goalState.distance_goals, newGoal]
            });
        }
    };

    const updateDistanceGoal = (id: string, field: keyof DistanceGoal, value: string | number) => {
        if (goalState) {
            setGoalState({
                ...goalState,
                distance_goals: goalState.distance_goals.map(goal => 
                    goal.id === id ? { ...goal, [field]: value } : goal
                )
            });
        }
    };

    const removeDistanceGoal = (id: string) => {
        if (goalState) {
            setGoalState({
                ...goalState,
                distance_goals: goalState.distance_goals.filter(goal => goal.id !== id)
            });
        }
    };

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (profileState) {
            const finalProfile = {
                ...profileState,
                age: Number(profileState.age) || 0,
                height_cm: Number(profileState.height_cm) || 0,
                weight_kg: Number(profileState.weight_kg) || 0,
            };
            updateProfile(finalProfile);
            setToast({ message: 'Profile updated successfully!', type: 'success' });
        }
    };

    const handleGoalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (goalState) {
            const finalGoals = {
                ...goalState,
                weekly_distance_km: Number(goalState.weekly_distance_km) || 0,
                weekly_runs: Number(goalState.weekly_runs) || 0,
            };
            updateGoals(finalGoals);
            setToast({ message: 'Goals updated successfully!', type: 'success' });
        }
    };

    const handleDownloadBackup = () => {
        if (currentUser) {
            storage.downloadBackup(currentUser);
            setToast({ message: 'Backup downloaded successfully!', type: 'success' });
        }
    };

    const handleRecreateDataFile = () => {
        if (currentUser) {
            storage.recreateBackupFile(currentUser);
            setToast({ message: 'data.json file created successfully!', type: 'success' });
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && currentUser) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                const success = storage.importUserData(content, currentUser);
                if (success) {
                    setToast({ message: 'Data restored successfully!', type: 'success' });
                    refreshData();
                } else {
                    setToast({ message: 'Failed to restore data. Invalid file format.', type: 'error' });
                }
            };
            reader.readAsText(file);
        }
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (loading || !profileState || !goalState) {
        return <SettingsSkeleton />;
    }



    const TabButton: React.FC<{tab: ActiveTab, label: string, icon: React.ElementType}> = ({ tab, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                activeTab === tab 
                ? 'border-brand-orange text-white' 
                : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
            }`}
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
        </button>
    );

    return (
        <div className="max-w-2xl mx-auto">
             {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>

            <div className="border-b border-dark-border mb-6 flex space-x-1">
                <TabButton tab="profile" label="Profile" icon={User} />
                <TabButton tab="goals" label="Goals" icon={Target} />
                <TabButton tab="backup" label="Backup" icon={Database} />
            </div>

            <Card>
                {activeTab === 'profile' && (
                    <form onSubmit={handleProfileSubmit} className="space-y-4 animate-fade-in">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                            <input name="name" type="text" value={profileState.name} onChange={handleProfileChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-brand-orange focus:border-brand-orange" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Age</label>
                            <input name="age" type="number" value={profileState.age} onChange={handleProfileChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-brand-orange focus:border-brand-orange" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Height (cm)</label>
                            <input name="height_cm" type="number" value={profileState.height_cm} onChange={handleProfileChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-brand-orange focus:border-brand-orange" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Weight (kg)</label>
                            <input name="weight_kg" type="number" value={profileState.weight_kg} onChange={handleProfileChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-brand-orange focus:border-brand-orange" />
                        </div>
                        <button type="submit" className="w-full bg-brand-orange text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-200">
                            Save Profile
                        </button>
                    </form>
                )}
                 {activeTab === 'goals' && (
                    <form onSubmit={handleGoalSubmit} className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Weekly Distance Target (km)</label>
                                <input name="weekly_distance_km" type="number" step="0.1" value={goalState.weekly_distance_km || 0} onChange={handleGoalChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-brand-orange focus:border-brand-orange" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Weekly Running Days</label>
                                <input name="weekly_runs" type="number" min="0" max="7" value={goalState.weekly_runs || 0} onChange={handleGoalChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-brand-orange focus:border-brand-orange" />
                            </div>
                        </div>
                        
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-medium text-white">Distance Goals</h3>
                                <button type="button" onClick={addDistanceGoal} className="flex items-center bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors">
                                    <Plus className="w-4 h-4 mr-1" /> Add Goal
                                </button>
                            </div>
                            
                            {(goalState.distance_goals || []).length === 0 ? (
                                <div className="text-center py-8 bg-gray-800 rounded-lg">
                                    <p className="text-gray-400">No distance goals set. Add your first goal!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {(goalState.distance_goals || []).map((goal) => (
                                        <div key={goal.id} className="bg-gray-800 p-4 rounded-lg">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                                                <div>
                                                    <label className="block text-xs text-gray-400 mb-1">Goal Name</label>
                                                    <input 
                                                        type="text" 
                                                        value={goal.name} 
                                                        onChange={(e) => updateDistanceGoal(goal.id, 'name', e.target.value)}
                                                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white text-sm focus:ring-brand-orange focus:border-brand-orange" 
                                                        placeholder="e.g., 5K Run"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-400 mb-1">Distance (km)</label>
                                                    <input 
                                                        type="number" 
                                                        step="0.1" 
                                                        min="0.1"
                                                        value={goal.distance_km} 
                                                        onChange={(e) => updateDistanceGoal(goal.id, 'distance_km', Number(e.target.value))}
                                                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white text-sm focus:ring-brand-orange focus:border-brand-orange" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-400 mb-1">Target Time (MM:SS)</label>
                                                    <input 
                                                        type="text" 
                                                        value={goal.target_time} 
                                                        onChange={(e) => updateDistanceGoal(goal.id, 'target_time', e.target.value)}
                                                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white text-sm focus:ring-brand-orange focus:border-brand-orange" 
                                                        placeholder="06:00"
                                                    />
                                                </div>
                                                <div>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeDistanceGoal(goal.id)}
                                                        className="w-full bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-xs text-gray-400 mt-2">Set custom distance goals with target times. Examples: 5K in 25:00, 10K in 50:00, etc.</p>
                        </div>
                        
                        <button type="submit" className="w-full bg-brand-orange text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-200">
                            Save Goals
                        </button>
                    </form>
                 )}
                 {activeTab === 'backup' && (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">Data Backup & Restore</h3>
                            <p className="text-gray-400 text-sm mb-4">Keep your fitness data safe by creating backups and restoring from previous saves.</p>
                        </div>
                        
                        <div className="space-y-4">
                            <button
                                onClick={handleDownloadBackup}
                                className="w-full flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                <Download className="w-5 h-5 mr-2" />
                                Download Backup
                            </button>
                            
                            <button
                                onClick={handleRecreateDataFile}
                                className="w-full flex items-center justify-center bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200"
                            >
                                <Database className="w-5 h-5 mr-2" />
                                Create data.json
                            </button>
                            
                            <div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex items-center justify-center bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200"
                                >
                                    <Upload className="w-5 h-5 mr-2" />
                                    Restore from Backup
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h4 className="text-white font-medium mb-2">How it works:</h4>
                            <ul className="text-gray-400 text-sm space-y-1">
                                <li>• <strong>Download Backup:</strong> Creates a timestamped backup file</li>
                                <li>• <strong>Create data.json:</strong> Creates a simple "data.json" file</li>
                                <li>• <strong>Restore:</strong> Upload any backup file to restore your data</li>
                            </ul>
                        </div>
                    </div>
                 )}
            </Card>
        </div>
    );
};

export default Settings;
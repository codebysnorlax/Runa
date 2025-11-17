import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Goal, Profile } from '../types';
import Card from '../components/Card';
import Skeleton from '../components/Skeleton';
import Toast from '../components/Toast';
import { User, Target, Download, Upload, Database } from 'lucide-react';
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
        if (goals) setGoalState({ ...goals });
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

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (profileState) {
            // Convert string values back to numbers
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
                distance_target_km: Number(goalState.distance_target_km) || 0,
                days_target: Number(goalState.days_target) || 0,
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
                    <form onSubmit={handleGoalSubmit} className="space-y-4 animate-fade-in">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Weekly Distance Target (km)</label>
                            <input name="distance_target_km" type="number" value={goalState.distance_target_km} onChange={handleGoalChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-brand-orange focus:border-brand-orange" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Weekly Running Days</label>
                            <input name="days_target" type="number" value={goalState.days_target} onChange={handleGoalChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-brand-orange focus:border-brand-orange" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">1.6km (1-mile) Time Target</label>
                            <input name="time_target_1_6km" type="text" value={goalState.time_target_1_6km} onChange={handleGoalChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-brand-orange focus:border-brand-orange" />
                        </div>
                        <p className="text-xs text-gray-400">Use MM:SS format, e.g., 06:00</p>
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
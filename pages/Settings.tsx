import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Goal, Profile, DistanceGoal } from '../types';
import Card from '../components/Card';
import Skeleton from '../components/Skeleton';
import Toast from '../components/Toast';
import { User, Target, Download, Upload, Database, Plus, Trash2, Info, Github, Mail, Globe, Instagram, Twitter, Linkedin, Code, Shield, LogOut } from 'lucide-react';
import * as storage from '../services/storageService';

const SettingsSkeleton: React.FC = () => (
    <div className="max-w-4xl mx-auto">
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

type ActiveTab = 'profile' | 'goals' | 'backup' | 'info';

const Settings: React.FC = () => {
    const { profile, goals, updateProfile, updateGoals, loading, currentUser, refreshData, logout } = useAppContext();
    const navigate = useNavigate();
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

    const addDistanceGoal = (e?: React.MouseEvent | React.TouchEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (goalState) {
            const newGoal: DistanceGoal = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
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

    const removeDistanceGoal = (id: string, e?: React.MouseEvent | React.TouchEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
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
            className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                ? 'border-brand-orange text-white'
                : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
            }`}
        >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm">{label}</span>
        </button>
    );

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
          Settings
        </h1>

        <div className="border-b border-dark-border mb-4 sm:mb-6 overflow-x-auto">
          <div className="flex space-x-1 min-w-max">
            <TabButton tab="profile" label="Profile" icon={User} />
            <TabButton tab="goals" label="Goals" icon={Target} />
            <TabButton tab="backup" label="Backup" icon={Database} />
            <TabButton tab="info" label="Info" icon={Info} />
          </div>
        </div>

        <div>
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSubmit} className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    value={profileState.name}
                    onChange={handleProfileChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-brand-orange focus:border-brand-orange"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Age
                  </label>
                  <input
                    name="age"
                    type="number"
                    value={profileState.age}
                    onChange={handleProfileChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-brand-orange focus:border-brand-orange"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Height (cm)
                  </label>
                  <input
                    name="height_cm"
                    type="number"
                    value={profileState.height_cm}
                    onChange={handleProfileChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-brand-orange focus:border-brand-orange"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    name="weight_kg"
                    type="number"
                    value={profileState.weight_kg}
                    onChange={handleProfileChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-brand-orange focus:border-brand-orange"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-brand-orange text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-200"
                >
                  Save Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Are you sure you want to logout?")) {
                      logout();
                      navigate("/login");
                    }
                  }}
                  className="sm:w-auto bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </button>
              </div>
            </form>
          )}
          {activeTab === "goals" && (
            <form
              onSubmit={handleGoalSubmit}
              className="space-y-6 animate-fade-in"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Weekly Distance Target (km)
                  </label>
                  <input
                    name="weekly_distance_km"
                    type="number"
                    step="0.1"
                    value={goalState.weekly_distance_km || 0}
                    onChange={handleGoalChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-brand-orange focus:border-brand-orange"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Weekly Running Days
                  </label>
                  <input
                    name="weekly_runs"
                    type="number"
                    min="0"
                    max="7"
                    value={goalState.weekly_runs || 0}
                    onChange={handleGoalChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-brand-orange focus:border-brand-orange"
                  />
                </div>
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                  <h3 className="text-base sm:text-lg font-medium text-white">
                    Distance Goals
                  </h3>
                  <button
                    type="button"
                    onClick={(e) => addDistanceGoal(e)}
                    className="flex items-center justify-center bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-green-600 active:scale-95 transition-all duration-200 shadow-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add New Goal
                  </button>
                </div>

                {(goalState.distance_goals || []).length === 0 ? (
                  <div className="text-center py-6 bg-gray-800 rounded-lg border border-gray-700">
                    <Target className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No goals set</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(goalState.distance_goals || []).map((goal) => (
                      <div
                        key={goal.id}
                        className="bg-gray-800 p-3 rounded-lg border border-gray-700"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              value={goal.name}
                              onChange={(e) =>
                                updateDistanceGoal(
                                  goal.id,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-sm focus:ring-1 focus:ring-brand-orange focus:border-brand-orange"
                              placeholder="5K Run"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">
                              Distance (km)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={goal.distance_km}
                              onChange={(e) =>
                                updateDistanceGoal(
                                  goal.id,
                                  "distance_km",
                                  Number(e.target.value)
                                )
                              }
                              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-sm focus:ring-1 focus:ring-brand-orange focus:border-brand-orange"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">
                              Time (MM:SS)
                            </label>
                            <input
                              type="text"
                              value={goal.target_time}
                              onChange={(e) =>
                                updateDistanceGoal(
                                  goal.id,
                                  "target_time",
                                  e.target.value
                                )
                              }
                              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-sm focus:ring-1 focus:ring-brand-orange focus:border-brand-orange"
                              placeholder="25:00"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={(e) => removeDistanceGoal(goal.id, e)}
                              className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700 transition-colors flex items-center justify-center"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  💡 Set realistic goals like 5K in 25:00, 10K in 50:00
                </p>
              </div>

              <button
                type="submit"
                onTouchStart={() => {}}
                className="w-full bg-brand-orange text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 active:scale-95 transition-all duration-200 touch-manipulation"
              >
                Save Goals
              </button>
            </form>
          )}
          {activeTab === "backup" && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Data Backup & Restore
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Keep your fitness data safe by creating backups and
                    restoring from previous saves.
                  </p>

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
                </div>

                <div className="bg-gray-800 p-6 rounded-lg h-fit">
                  <h4 className="text-white font-medium mb-4">How it works:</h4>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Download className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-white font-medium">
                          Download Backup
                        </div>
                        <div className="text-gray-400 text-sm">
                          Creates a timestamped backup file with all your data
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Database className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-white font-medium">
                          Create data.json
                        </div>
                        <div className="text-gray-400 text-sm">
                          Creates a simple "data.json" file for easy sharing
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Upload className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-white font-medium">Restore</div>
                        <div className="text-gray-400 text-sm">
                          Upload any backup file to restore your data
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === "info" && (
            <div className="space-y-6 animate-fade-in">
              {/* Developer Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src="https://github.com/codebysnorlax.png"
                    alt="Ravi Ranjan Sharma"
                    className="w-8 h-8 rounded-full"
                  />
                  <h2 className="text-xl font-semibold text-white">
                    Developer
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="lg:col-span-2">
                    <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                      Ravi Ranjan Sharma
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      A tech enthusiast passionate about building innovative
                      projects and crafting problem-solving software using
                      cutting-edge technologies.
                    </p>
                    <div className="space-y-2">
                      <h4 className="text-white font-medium text-sm sm:text-base">
                        Specializations:
                      </h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Full-stack Web Development | learning</li>
                        <li>• MERN Applications</li>
                        <li>• AI Integration & Modern UI/UX</li>
                        <li>• Problem-solving Software Solutions</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 lg:mt-0">
                    <h4 className="text-white font-medium mb-3 text-sm sm:text-base">
                      Connect
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
                      <a
                        href="https://github.com/codebysnorlax"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-gray-300 hover:text-brand-orange transition-colors"
                      >
                        <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-xs sm:text-sm">GitHub</span>
                      </a>
                      <a
                        href="mailto:rr2436310@gmail.com"
                        className="flex items-center space-x-2 text-gray-300 hover:text-brand-orange transition-colors"
                      >
                        <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-xs sm:text-sm">Email</span>
                      </a>
                      <a
                        href="https://github.com/codebysnorlax"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-gray-300 hover:text-brand-orange transition-colors"
                      >
                        <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-xs sm:text-sm">Portfolio</span>
                      </a>
                      <a
                        href="https://instagram.com/nr_snorlax"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-gray-300 hover:text-brand-orange transition-colors"
                      >
                        <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-xs sm:text-sm">Instagram</span>
                      </a>
                      <a
                        href="https://twitter.com/codebysnorlax"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-gray-300 hover:text-brand-orange transition-colors"
                      >
                        <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-xs sm:text-sm">Twitter</span>
                      </a>
                      <a
                        href="https://linkedin.com/in/ravi-ranjan-9b338b333"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-gray-300 hover:text-brand-orange transition-colors"
                      >
                        <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-xs sm:text-sm">LinkedIn</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Software Information */}
              <div className="bg-gray-800 p-4 rounded-lg space-y-4">
                <div className="flex items-center space-x-3">
                  <Code className="w-5 h-5 sm:w-6 sm:h-6 text-brand-orange" />
                  <h2 className="text-lg sm:text-xl font-semibold text-white">
                    AI Fitness Tracker
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                      Purpose
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      AI-powered fitness tracker designed to monitor
                      your running progress, set personalized goals, and provide
                      intelligent insights into your performance.
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                      Key Features
                    </h3>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Track running sessions with detailed metrics</li>
                      <li>• Set and monitor fitness goals</li>
                      <li>• View analytics and performance trends</li>
                      <li>• AI-powered insights and recommendations</li>
                      <li>• Data backup and restore functionality</li>
                      <li>• Local storage for privacy</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* How to Use */}
              <div className="bg-gray-800 p-4 rounded-lg space-y-4">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-brand-orange" />
                  <h2 className="text-lg sm:text-xl font-semibold text-white">
                    How to Use
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                      Getting Started
                    </h3>
                    <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                      <li>Login with any username and the provided password</li>
                      <li>
                        Set up your profile in Settings (age, height, weight)
                      </li>
                      <li>
                        Define your fitness goals (weekly distance, running
                        days)
                      </li>
                      <li>Start adding your running sessions</li>
                    </ol>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                      Daily Usage
                    </h3>
                    <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                      <li>
                        Add runs via "Add Run" with distance, time, and notes
                      </li>
                      <li>View your progress on the Dashboard</li>
                      <li>Check Analytics for performance trends</li>
                      <li>Get AI insights for improvement suggestions</li>
                      <li>Backup your data regularly in Settings</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Privacy & Security */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-brand-orange" />
                  <h2 className="text-lg sm:text-xl font-semibold text-white">
                    Privacy & Security
                  </h2>
                </div>
                <div className="text-gray-300 text-sm space-y-2">
                  <p>
                    • All your data is stored locally in your browser - no
                    external servers
                  </p>
                  <p>• Your personal information never leaves your device</p>
                  <p>
                    • Use the backup feature to save your data as JSON files
                  </p>
                  <p>• Open source approach for transparency and trust</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
};

export default Settings;

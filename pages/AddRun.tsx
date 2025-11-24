
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import Toast from '../components/Toast';
import { useNavigate } from 'react-router-dom';

const AddRun: React.FC = () => {
    const { addRun } = useAppContext();
    const navigate = useNavigate();

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [distanceM, setDistanceM] = useState('');
    const [minutes, setMinutes] = useState('');
    const [seconds, setSeconds] = useState('');
    const [maxSpeed, setMaxSpeed] = useState('');
    const [notes, setNotes] = useState('');
    
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const totalTimeSec = useMemo(() => {
        return (parseInt(minutes, 10) || 0) * 60 + (parseInt(seconds, 10) || 0);
    }, [minutes, seconds]);

    const avgSpeedKmh = useMemo(() => {
        const distKm = parseFloat(distanceM) / 1000;
        const timeHr = totalTimeSec / 3600;
        if (distKm > 0 && timeHr > 0) {
            return (distKm / timeHr).toFixed(2);
        }
        return '0.00';
    }, [distanceM, totalTimeSec]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !distanceM || totalTimeSec <= 0) {
            setToast({ message: 'Please fill all required fields.', type: 'error' });
            return;
        }

        addRun({
            date: new Date(date).toISOString(),
            distance_m: parseFloat(distanceM),
            total_time_sec: totalTimeSec,
            avg_speed_kmh: parseFloat(avgSpeedKmh),
            max_speed_kmh: parseFloat(maxSpeed) || 0,
            notes: notes,
        });
        
        setToast({ message: 'Run added successfully!', type: 'success' });
        setTimeout(() => navigate('/history'), 1500);
    };



    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 animate-fade-in">Add New Run</h1>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="animate-slide-up" style={{animationDelay: '0.1s'}}>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-brand-orange focus:border-brand-orange transition-all duration-200 hover:border-gray-500" />
                </div>
                <div className="animate-slide-up" style={{animationDelay: '0.2s'}}>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Distance (meters)</label>
                    <input type="number" value={distanceM} onChange={e => setDistanceM(e.target.value)} placeholder="e.g., 5000" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-brand-orange focus:border-brand-orange transition-all duration-200 hover:border-gray-500" />
                </div>
                
                <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{animationDelay: '0.3s'}}>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Time (minutes)</label>
                        <input type="number" value={minutes} onChange={e => setMinutes(e.target.value)} placeholder="e.g., 25" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-brand-orange focus:border-brand-orange transition-all duration-200 hover:border-gray-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Time (seconds)</label>
                        <input type="number" value={seconds} onChange={e => setSeconds(e.target.value)} placeholder="e.g., 30" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-brand-orange focus:border-brand-orange transition-all duration-200 hover:border-gray-500" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{animationDelay: '0.4s'}}>
                    <div>
                         <label className="block text-sm font-medium text-gray-300 mb-1">Avg Speed (km/h)</label>
                         <div className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-gray-300">{avgSpeedKmh}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Max Speed (km/h)</label>
                        <input type="number" value={maxSpeed} onChange={e => setMaxSpeed(e.target.value)} placeholder="Optional" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-brand-orange focus:border-brand-orange transition-all duration-200 hover:border-gray-500" />
                    </div>
                </div>
                
                <div className="animate-slide-up" style={{animationDelay: '0.5s'}}>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="How did it feel?" rows={2} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-brand-orange focus:border-brand-orange transition-all duration-200 hover:border-gray-500" />
                </div>
                
                <button type="submit" className="w-full bg-brand-orange text-white font-bold py-2.5 px-6 rounded-lg hover:bg-orange-600 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg animate-slide-up" style={{animationDelay: '0.6s'}}>
                    Save Run
                </button>
            </form>
        </div>
    );
};

export default AddRun;

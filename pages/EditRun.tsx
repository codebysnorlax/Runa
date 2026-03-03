import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, useParams } from 'react-router-dom';

const EditRun: React.FC = () => {
    const { runId } = useParams<{ runId: string }>();
    const { runs, editRun } = useAppContext();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const runToEdit = useMemo(() => runs.find(r => r.id === runId), [runs, runId]);

    const [date, setDate] = useState('');
    const [distanceM, setDistanceM] = useState('');
    const [minutes, setMinutes] = useState('');
    const [seconds, setSeconds] = useState('');
    const [maxSpeed, setMaxSpeed] = useState('');
    const [notes, setNotes] = useState('');


    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (runToEdit) {
            setDate(runToEdit.date.split('T')[0]);
            setDistanceM(String(runToEdit.distance_m));
            setMinutes(String(Math.floor(runToEdit.total_time_sec / 60)));
            setSeconds(String(runToEdit.total_time_sec % 60));
            setMaxSpeed(String(runToEdit.max_speed_kmh || ''));
            setNotes(runToEdit.notes);
            setIsLoading(false);
        } else if (runs.length > 0) { // If runs are loaded but run not found
            navigate('/history');
        }
    }, [runToEdit, runs, navigate]);

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
        if (!runId || !date || !distanceM || totalTimeSec <= 0) {
            addToast('Please fill all required fields.', 'error');
            return;
        }

        editRun({
            id: runId,
            date: new Date(date).toISOString(),
            distance_m: parseFloat(distanceM),
            total_time_sec: totalTimeSec,
            avg_speed_kmh: parseFloat(avgSpeedKmh),
            max_speed_kmh: parseFloat(maxSpeed) || 0,
            notes: notes,
        });

        addToast('Run updated successfully!', 'success');
        setTimeout(() => navigate('/history'), 1500);
    };



    if (isLoading) {
        return <div className="text-center p-8 text-gray-400">Loading run data...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-24 lg:pb-6">

            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 animate-fade-in">Edit Run</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Row 1: Date & Distance */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <label className="text-[11px] text-gray-400 font-medium tracking-wide uppercase mb-1.5 block">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full bg-transparent border border-dashed border-gray-700/50 rounded-lg px-3 py-2 text-white text-sm font-medium focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-all duration-200 hover:border-gray-500"
                        />
                    </div>

                    <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <label className="text-[11px] text-gray-400 font-medium tracking-wide uppercase mb-1.5 block">Distance (meters)</label>
                        <input
                            type="number"
                            value={distanceM}
                            onChange={e => setDistanceM(e.target.value)}
                            placeholder="e.g., 5000"
                            className="w-full bg-transparent border border-dashed border-gray-700/50 rounded-lg px-3 py-2 text-white text-sm font-medium focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-all duration-200 hover:border-gray-500 placeholder-gray-600"
                        />
                    </div>
                </div>

                {/* Row 2: Duration */}
                <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <div>
                        <label className="text-[11px] text-gray-400 font-medium tracking-wide uppercase mb-1.5 block">Time (minutes)</label>
                        <input
                            type="number"
                            value={minutes}
                            onChange={e => setMinutes(e.target.value)}
                            placeholder="e.g., 25"
                            className="w-full bg-transparent border border-dashed border-gray-700/50 rounded-lg px-3 py-2 text-white text-sm font-medium focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-all duration-200 hover:border-gray-500 placeholder-gray-600"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] text-gray-400 font-medium tracking-wide uppercase mb-1.5 block">Time (seconds)</label>
                        <input
                            type="number"
                            value={seconds}
                            onChange={e => setSeconds(e.target.value)}
                            placeholder="e.g., 30"
                            className="w-full bg-transparent border border-dashed border-gray-700/50 rounded-lg px-3 py-2 text-white text-sm font-medium focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-all duration-200 hover:border-gray-500 placeholder-gray-600"
                        />
                    </div>
                </div>

                {/* Row 3: Speeds */}
                <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                    <div>
                        <label className="text-[11px] text-gray-400 font-medium tracking-wide uppercase mb-1.5 block">Avg Speed (km/h)</label>
                        <div className="w-full bg-transparent border border-dashed border-gray-700/50 rounded-lg px-3 py-2 text-white text-sm font-bold flex items-center h-[38px]">
                            <span className={avgSpeedKmh !== '0.00' ? 'text-brand-orange' : 'text-gray-500'}>
                                {avgSpeedKmh}
                            </span>
                        </div>
                    </div>
                    <div>
                        <label className="text-[11px] text-gray-400 font-medium tracking-wide uppercase mb-1.5 block">Max Speed (km/h)</label>
                        <input
                            type="number"
                            value={maxSpeed}
                            onChange={e => setMaxSpeed(e.target.value)}
                            placeholder="Optional"
                            className="w-full bg-transparent border border-dashed border-gray-700/50 rounded-lg px-3 py-2 text-white text-sm font-medium focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-all duration-200 hover:border-gray-500 placeholder-gray-600"
                        />
                    </div>
                </div>

                {/* Notes */}
                <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
                    <label className="text-[11px] text-gray-400 font-medium tracking-wide uppercase mb-1.5 block">Notes</label>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="How did the run feel?"
                        rows={2}
                        className="w-full bg-transparent border border-dashed border-gray-700/50 rounded-lg px-3 py-2 text-white text-[13px] focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-all duration-200 hover:border-gray-500 placeholder-gray-600 resize-none"
                    />
                </div>

                <div className="pt-2 animate-slide-up" style={{ animationDelay: '0.7s' }}>
                    <button
                        type="submit"
                        className="w-full bg-brand-orange hover:bg-orange-500 text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange focus:ring-offset-gray-900"
                    >
                        Update Run
                    </button>
                </div>
            </form>

            <div className="mt-4 flex items-center justify-center text-gray-500 text-[11px] font-medium animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <span>Your running data is stored locally for maximum privacy.</span>
            </div>
        </div>
    );
};

export default EditRun;
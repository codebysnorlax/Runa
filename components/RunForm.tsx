import React, { useState, useMemo } from 'react';

export interface RunFormData {
    date: string;
    distanceM: string;
    minutes: string;
    seconds: string;
    maxSpeed: string;
    notes: string;
}

interface RunFormProps {
    title: string;
    submitLabel: string;
    initialData?: Partial<RunFormData>;
    onSubmit: (data: {
        date: string;
        distance_m: number;
        total_time_sec: number;
        avg_speed_kmh: number;
        max_speed_kmh: number;
        notes: string;
    }) => void | boolean;
}

const defaultFormData: RunFormData = {
    date: new Date().toISOString().split('T')[0],
    distanceM: '',
    minutes: '',
    seconds: '',
    maxSpeed: '',
    notes: '',
};

const RunForm: React.FC<RunFormProps> = ({ title, submitLabel, initialData, onSubmit }) => {
    const [form, setForm] = useState<RunFormData>(() => ({
        ...defaultFormData,
        ...initialData,
    }));
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (field: keyof RunFormData, value: string) => {
        let newValue = value;
        if (field === 'distanceM' && value.length > 6) newValue = value.slice(0, 6); // Max 999,999m (999km)
        if (field === 'minutes' && value.length > 4) newValue = value.slice(0, 4);   // Max 9999m (~166 hours)
        if (field === 'seconds' && value.length > 2) newValue = value.slice(0, 2);   // Max 99s
        if (field === 'maxSpeed' && value.length > 3) newValue = value.slice(0, 3);  // Max 999km/h
        if (field === 'notes' && value.length > 500) newValue = value.slice(0, 500); // Sensible limit

        setForm(prev => ({ ...prev, [field]: newValue }));
    };

    const totalTimeSec = useMemo(() => {
        return (parseInt(form.minutes, 10) || 0) * 60 + (parseInt(form.seconds, 10) || 0);
    }, [form.minutes, form.seconds]);

    const avgSpeedKmh = useMemo(() => {
        const distKm = parseFloat(form.distanceM) / 1000;
        const timeHr = totalTimeSec / 3600;
        if (distKm > 0 && timeHr > 0) {
            return (distKm / timeHr).toFixed(2);
        }
        return '0.00';
    }, [form.distanceM, totalTimeSec]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        setSubmitting(true);
        const result = onSubmit({
            date: new Date(form.date).toISOString(),
            distance_m: parseFloat(form.distanceM),
            total_time_sec: totalTimeSec,
            avg_speed_kmh: parseFloat(avgSpeedKmh),
            max_speed_kmh: parseFloat(form.maxSpeed) || 0,
            notes: form.notes,
        });

        if (result === false) {
            setSubmitting(false);
        }
    };

    const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
        (e.target as HTMLInputElement).blur();
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-24 lg:pb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 animate-fade-in">{title}</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Row 1: Date & Distance */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <label className="text-[11px] text-gray-400 font-medium tracking-wide uppercase mb-1.5 block">Date</label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={e => handleChange('date', e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full bg-transparent border border-dashed border-gray-700/50 rounded-lg px-3 py-2 text-white text-sm font-medium focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-all duration-200 hover:border-gray-500"
                        />
                    </div>

                    <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <label className="text-[11px] text-gray-400 font-medium tracking-wide uppercase mb-1.5 block">Distance (meters)</label>
                        <input
                            type="number"
                            value={form.distanceM}
                            onChange={e => handleChange('distanceM', e.target.value)}
                            onWheel={handleWheel}
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
                            value={form.minutes}
                            onChange={e => handleChange('minutes', e.target.value)}
                            onWheel={handleWheel}
                            placeholder="e.g., 25"
                            className="w-full bg-transparent border border-dashed border-gray-700/50 rounded-lg px-3 py-2 text-white text-sm font-medium focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-all duration-200 hover:border-gray-500 placeholder-gray-600"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] text-gray-400 font-medium tracking-wide uppercase mb-1.5 block">Time (seconds)</label>
                        <input
                            type="number"
                            value={form.seconds}
                            onChange={e => handleChange('seconds', e.target.value)}
                            onWheel={handleWheel}
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
                            value={form.maxSpeed}
                            onChange={e => handleChange('maxSpeed', e.target.value)}
                            onWheel={handleWheel}
                            placeholder="Optional"
                            className="w-full bg-transparent border border-dashed border-gray-700/50 rounded-lg px-3 py-2 text-white text-sm font-medium focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-all duration-200 hover:border-gray-500 placeholder-gray-600"
                        />
                    </div>
                </div>

                {/* Notes */}
                <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
                    <label className="text-[11px] text-gray-400 font-medium tracking-wide uppercase mb-1.5 block">Notes</label>
                    <textarea
                        value={form.notes}
                        onChange={e => handleChange('notes', e.target.value)}
                        placeholder="How did the run feel?"
                        rows={2}
                        className="w-full bg-transparent border border-dashed border-gray-700/50 rounded-lg px-3 py-2 text-white text-[13px] focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-all duration-200 hover:border-gray-500 placeholder-gray-600 resize-none"
                    />
                </div>

                <div className="pt-2 animate-slide-up" style={{ animationDelay: '0.7s' }}>
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange focus:ring-offset-gray-900 flex items-center justify-center gap-2 ${submitting
                                ? 'bg-brand-orange/60 cursor-not-allowed'
                                : 'bg-brand-orange hover:bg-orange-500'
                            }`}
                    >
                        {submitting ? (
                            <>
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                                Saving...
                            </>
                        ) : submitLabel}
                    </button>
                </div>
            </form>

            <div className="mt-4 flex items-center justify-center text-gray-500 text-[11px] font-medium animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <span>Your running data is stored locally for maximum privacy.</span>
            </div>
        </div>
    );
};

export default RunForm;

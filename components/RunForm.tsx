import React, { useState, useMemo } from 'react';
import { InputField } from '@/components/InputField';

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
    const [errors, setErrors] = useState<Partial<Record<keyof RunFormData, string>>>({});
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (field: keyof RunFormData, value: string) => {
        let newValue = value;
        if (field === 'distanceM' && value.length > 6) newValue = value.slice(0, 6);
        if (field === 'minutes' && value.length > 4) newValue = value.slice(0, 4);
        if (field === 'seconds' && value.length > 2) newValue = value.slice(0, 2);
        if (field === 'maxSpeed' && value.length > 3) newValue = value.slice(0, 3);
        if (field === 'notes' && value.length > 500) newValue = value.slice(0, 500);

        setForm(prev => ({ ...prev, [field]: newValue }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
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

    const validateForm = () => {
        const newErrors: Partial<Record<keyof RunFormData, string>> = {};
        if (!form.date) newErrors.date = 'Date is required';
        else if (new Date(form.date) > new Date()) newErrors.date = 'Date cannot be in the future';

        const dist = parseFloat(form.distanceM);
        if (!form.distanceM) newErrors.distanceM = 'Distance is required';
        else if (isNaN(dist) || dist <= 0) newErrors.distanceM = 'Must be greater than 0';

        if (totalTimeSec <= 0) {
            newErrors.minutes = 'Total time must be > 0';
        }

        if (form.maxSpeed) {
            const maxS = parseFloat(form.maxSpeed);
            if (isNaN(maxS) || maxS < parseFloat(avgSpeedKmh)) {
                newErrors.maxSpeed = 'Max speed must be >= average speed';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        if (!validateForm()) return;

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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <InputField
                            label="Date"
                            type="date"
                            value={form.date}
                            onChange={e => handleChange('date', e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            error={errors.date}
                        />
                    </div>
                    <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <InputField
                            label="Distance (meters)"
                            type="number"
                            value={form.distanceM}
                            onChange={e => handleChange('distanceM', e.target.value)}
                            onWheel={handleWheel}
                            placeholder="e.g., 5000"
                            error={errors.distanceM}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <InputField
                        label="Time (minutes)"
                        type="number"
                        value={form.minutes}
                        onChange={e => handleChange('minutes', e.target.value)}
                        onWheel={handleWheel}
                        placeholder="e.g., 25"
                        error={errors.minutes}
                    />
                    <InputField
                        label="Time (seconds)"
                        type="number"
                        value={form.seconds}
                        onChange={e => handleChange('seconds', e.target.value)}
                        onWheel={handleWheel}
                        placeholder="e.g., 30"
                        error={errors.seconds}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                    <div>
                        <label className="text-[11px] text-gray-400 font-medium tracking-wide uppercase mb-1.5 block">Avg Speed (km/h)</label>
                        <div className="w-full bg-transparent border border-dashed border-gray-700/50 rounded-lg px-3 py-2 text-white text-sm font-bold flex items-center h-[38px]">
                            <span className={avgSpeedKmh !== '0.00' ? 'text-brand-orange' : 'text-gray-500'}>
                                {avgSpeedKmh}
                            </span>
                        </div>
                    </div>
                    <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
                        <InputField
                            label="Max Speed (km/h)"
                            type="number"
                            value={form.maxSpeed}
                            onChange={e => handleChange('maxSpeed', e.target.value)}
                            onWheel={handleWheel}
                            placeholder="Optional"
                            error={errors.maxSpeed}
                        />
                    </div>
                </div>

                <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
                    <label className="text-[11px] text-gray-400 font-medium tracking-wide uppercase mb-1.5 block">Notes</label>
                    <textarea
                        value={form.notes}
                        onChange={e => handleChange('notes', e.target.value)}
                        placeholder="How did the run feel?"
                        rows={2}
                        className="w-full bg-transparent border border-dashed rounded-lg px-3 py-2 text-white text-[13px] focus:outline-none focus:ring-1 transition-all duration-200 placeholder-gray-600 resize-none border-gray-700/50 focus:ring-brand-orange focus:border-brand-orange hover:border-gray-500"
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
                <span className="text-center">Your running data is stored at <a className="text-brand-orange" href="https://convex.dev">convex database</a> 100% Secure.<br />don't worry, we are soon automating this field</span>
            </div>
        </div>
    );
};

export default RunForm;

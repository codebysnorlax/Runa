import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, useParams } from 'react-router-dom';
import RunForm, { RunFormData } from '../components/RunForm';

const EditRun: React.FC = () => {
    const { runId } = useParams<{ runId: string }>();
    const { runs, editRun } = useAppContext();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const runToEdit = useMemo(() => runs.find(r => r.id === runId), [runs, runId]);

    const initialData: Partial<RunFormData> | undefined = useMemo(() => {
        if (!runToEdit) return undefined;
        return {
            date: runToEdit.date.split('T')[0],
            distanceM: String(runToEdit.distance_m),
            minutes: String(Math.floor(runToEdit.total_time_sec / 60)),
            seconds: String(runToEdit.total_time_sec % 60),
            maxSpeed: String(runToEdit.max_speed_kmh || ''),
            notes: runToEdit.notes,
        };
    }, [runToEdit]);

    // If runs are loaded but run not found, redirect
    if (!runToEdit && runs.length > 0) {
        navigate('/history');
        return null;
    }

    if (!runToEdit || !initialData) {
        return <div className="text-center p-8 text-gray-400">Loading run data...</div>;
    }

    const handleSubmit = (data: {
        date: string;
        distance_m: number;
        total_time_sec: number;
        avg_speed_kmh: number;
        max_speed_kmh: number;
        notes: string;
    }) => {
        if (!runId || !data.date || !data.distance_m || data.total_time_sec <= 0) {
            addToast('Please fill all required fields.', 'error');
            return false;
        }

        editRun({ id: runId, ...data });
        addToast('Run updated successfully!', 'success');
        setTimeout(() => navigate('/history'), 1500);
    };

    return (
        <RunForm
            title="Edit Run"
            submitLabel="Update Run"
            initialData={initialData}
            onSubmit={handleSubmit}
        />
    );
};

export default EditRun;
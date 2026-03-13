import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import RunForm from '../components/RunForm';

const AddRun: React.FC = () => {
    const { addRun } = useAppContext();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = (data: {
        date: string;
        distance_m: number;
        total_time_sec: number;
        avg_speed_kmh: number;
        max_speed_kmh: number;
        notes: string;
    }) => {
        if (!data.date || !data.distance_m || data.total_time_sec <= 0) {
            addToast('Please fill all required fields.', 'error');
            return;
        }

        addRun(data);
        addToast('Run added successfully!', 'success');
        setTimeout(() => navigate('/history'), 1500);
    };

    return (
        <RunForm
            title="Add New Run"
            submitLabel="Save Run"
            onSubmit={handleSubmit}
        />
    );
};

export default AddRun;

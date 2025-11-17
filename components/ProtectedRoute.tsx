import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Skeleton from './Skeleton';

const FullPageLoader: React.FC = () => (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
       <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-orange"></div>
    </div>
);


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, loading } = useAppContext();

    if (loading) {
        return <FullPageLoader />;
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
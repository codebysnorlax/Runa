import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppCore } from '@/context/AppCoreContext';
import FullPageLoader from '@/components/FullPageLoader';


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, loading } = useAppCore();

    if (loading) {
        return <FullPageLoader />;
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
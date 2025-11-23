import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Skeleton from './Skeleton';

const FullPageLoader: React.FC = () => (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <svg width="64px" height="48px">
            <polyline points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24" id="back" style={{fill: 'none', stroke: '#ff630033', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round'}} />
            <polyline points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24" id="front" style={{fill: 'none', stroke: '#ff6300', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round', strokeDasharray: '48, 144', strokeDashoffset: 192, animation: 'dash 1.4s linear infinite'}} />
        </svg>
        <style>{`
            @keyframes dash {
                72.5% { opacity: 0; }
                to { stroke-dashoffset: 0; }
            }
        `}</style>
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
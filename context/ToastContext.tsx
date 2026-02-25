import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export interface ToastItem {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    createdAt: number;
}

interface ToastContextType {
    toasts: ToastItem[];
    addToast: (message: string, type: ToastItem['type']) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const MAX_TOASTS = 5;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const counterRef = useRef(0);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastItem['type']) => {
        counterRef.current += 1;
        const id = `toast-${Date.now()}-${counterRef.current}`;
        const newToast: ToastItem = { id, message, type, createdAt: Date.now() };

        setToasts(prev => {
            const updated = [...prev, newToast];
            // Keep only the latest MAX_TOASTS
            if (updated.length > MAX_TOASTS) {
                return updated.slice(updated.length - MAX_TOASTS);
            }
            return updated;
        });
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

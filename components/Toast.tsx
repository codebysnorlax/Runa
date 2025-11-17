import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const Icon = type === 'success' ? CheckCircle : XCircle;

  return (
    <div className={`fixed top-5 right-5 flex items-center p-4 rounded-lg text-white shadow-lg z-50 animate-pop-in ${bgColor}`}>
      <Icon className="w-6 h-6 mr-3" />
      <span>{message}</span>
    </div>
  );
};

export default Toast;
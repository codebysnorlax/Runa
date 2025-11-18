import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

// Add slide-down animation
const toastStyles = `
  @keyframes toast-slide {
    0% {
      transform: translateY(-100%);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .animate-toast-slide {
    animation: toast-slide 0.3s ease-out;
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('toast-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'toast-styles';
  styleSheet.textContent = toastStyles;
  document.head.appendChild(styleSheet);
}

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4500);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const Icon = type === 'success' ? CheckCircle : XCircle;

  return (
    <div className={`fixed top-4 left-4 right-4 sm:top-5 sm:right-5 sm:left-auto sm:max-w-md flex items-center p-3 sm:p-4 rounded-lg text-white shadow-lg z-50 animate-toast-slide ${bgColor}`}>
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 flex-shrink-0" />
      <span className="text-sm sm:text-base font-medium leading-tight">{message}</span>
    </div>
  );
};

export default Toast;

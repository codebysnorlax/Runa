import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

// Add jelly effect CSS animation
const toastStyles = `
  @keyframes toast-jelly {
    0% {
      transform: translateX(100%) scale(0.3, 0.3);
      opacity: 0;
    }
    30% {
      transform: translateX(0) scale(1.25, 0.75);
      opacity: 1;
    }
    40% {
      transform: scale(0.75, 1.25);
    }
    50% {
      transform: scale(1.15, 0.85);
    }
    65% {
      transform: scale(0.95, 1.05);
    }
    75% {
      transform: scale(1.05, 0.95);
    }
    100% {
      transform: scale(1, 1);
      opacity: 1;
    }
  }
  
  .animate-toast-slide {
    animation: toast-jelly 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
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
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const Icon = type === 'success' ? CheckCircle : XCircle;

  return (
    <div className={`fixed top-5 right-5 flex items-center p-4 rounded-lg text-white shadow-lg z-50 animate-toast-slide ${bgColor}`}>
      <Icon className="w-6 h-6 mr-3" />
      <span>{message}</span>
    </div>
  );
};

export default Toast;

import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-800/40 border border-dashed border-gray-700/50 rounded-lg px-3.5 py-3 sm:px-5 sm:py-4 ${className}`}>
      {children}
    </div>
  );
};

export default Card;


import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-dark-card border border-dark-border rounded-lg p-4 sm:p-6 shadow-lg ${className}`}>
      {children}
    </div>
  );
};

export default Card;

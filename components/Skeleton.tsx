import React from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return <div className={`bg-gray-700 rounded-md animate-pulse ${className}`} />;
};

export default Skeleton;

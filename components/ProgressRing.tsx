
import React from 'react';

interface ProgressRingProps {
  radius: number;
  stroke: number;
  progress: number; // 0 to 100
  label: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ radius, stroke, progress, label }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="-rotate-90"
      >
        <circle
          stroke="#2D2D2D"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#FF7A00"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-out' }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
         <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
         <span className="text-xs text-gray-400">{label}</span>
      </div>
    </div>
  );
};

export default ProgressRing;


import React from 'react';

interface ProgressRingProps {
  radius: number;
  stroke: number;
  progress: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ radius, stroke, progress }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const cappedProgress = Math.min(progress, 100);
  const strokeDashoffset = circumference - (cappedProgress / 100) * circumference;

  return (
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
  );
};

export default ProgressRing;

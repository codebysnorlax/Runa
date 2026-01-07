import React from 'react';

interface AudioLoaderProps {
  progress: number;
}

const AudioLoader: React.FC<AudioLoaderProps> = ({ progress }) => {
  return (
    <div className="audio-loader">
      <div className="container">
        <svg width="120" height="120" viewBox="-1 -1 22 22">
          <path style={{ ['--order' as any]: 7 }} className="eight e-8" d="m5 5a1 1 0 0110 0c0 4-10 6-10 10a1 1 0 0010 0c0-4-10-6-10-10" />
          <path style={{ ['--order' as any]: 6 }} className="eight e-7" d="m5 5a1 1 0 0110 0c0 4-10 6-10 10a1 1 0 0010 0c0-4-10-6-10-10" />
          <path style={{ ['--order' as any]: 5 }} className="eight e-6" d="m5 5a1 1 0 0110 0c0 4-10 6-10 10a1 1 0 0010 0c0-4-10-6-10-10" />
          <path style={{ ['--order' as any]: 4 }} className="eight e-5" d="m5 5a1 1 0 0110 0c0 4-10 6-10 10a1 1 0 0010 0c0-4-10-6-10-10" />
          <path style={{ ['--order' as any]: 3 }} className="eight e-4" d="m5 5a1 1 0 0110 0c0 4-10 6-10 10a1 1 0 0010 0c0-4-10-6-10-10" />
          <path style={{ ['--order' as any]: 2 }} className="eight e-3" d="m5 5a1 1 0 0110 0c0 4-10 6-10 10a1 1 0 0010 0c0-4-10-6-10-10" />
          <path style={{ ['--order' as any]: 1 }} className="eight e-2" d="m5 5a1 1 0 0110 0c0 4-10 6-10 10a1 1 0 0010 0c0-4-10-6-10-10" />
          <path style={{ ['--order' as any]: 0 }} className="eight e-1" d="m5 5a1 1 0 0110 0c0 4-10 6-10 10a1 1 0 0010 0c0-4-10-6-10-10" />
        </svg>
      </div>
      <div className="progress-text">{progress}%</div>
      <style>{`
        .audio-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .container {
          overflow: hidden;
        }
        .container svg {
          --spin-duration: 2000ms;
          --infinity-duration: 2000ms;
          --hsl-base-h: 15deg;
          --hsl-base-s: 90%;
          --hsl-base-l: 55%;
          animation: spin81213 var(--spin-duration) linear infinite;
        }
        .eight {
          --eight-length-px: 60.84563446044922px;
          --offset: calc(var(--order) * 5px);
          animation: infinity8123 var(--infinity-duration) linear infinite;
          fill: none;
          stroke: hsl(calc(var(--hsl-base-h) * var(--order)) var(--hsl-base-s) var(--hsl-base-l));
          stroke-dasharray: 6px calc(var(--eight-length-px) - 6px);
          stroke-linecap: round;
          stroke-width: calc(1 - var(--order) / 10);
        }
        .progress-text {
          font-size: 28px;
          font-weight: 700;
          color: #f97316;
          text-shadow: 0 0 20px rgba(249, 115, 22, 0.6);
        }
        @keyframes infinity8123 {
          0% { stroke-dashoffset: calc(var(--eight-length-px) + var(--offset)); }
          100% { stroke-dashoffset: var(--offset); }
        }
        @keyframes spin81213 {
          0% { transform: rotate(0); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AudioLoader;

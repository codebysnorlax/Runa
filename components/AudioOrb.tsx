import { useRef } from 'react';
import { useAudioVisualizer } from '@/hooks/useAudioVisualizer';
import './AudioOrb.css';

interface AudioOrbProps {
  audioSrc: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

export const AudioOrb = ({ audioSrc, onComplete, onCancel }: AudioOrbProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerLinesRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  const { progress, isPlaying, togglePlay } = useAudioVisualizer(
    audioRef,
    containerLinesRef,
    orbRef,
    onComplete
  );

  return (
    <div className="audio-orb-wrapper" onClick={onCancel}>
      <audio ref={audioRef} src={audioSrc} />
      <div
        className={`orb-active ${isPlaying ? 'playing' : 'paused'}`}
        ref={orbRef}
        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
        style={{ cursor: 'pointer' }}
      >
        <div className="ball">
          <div className="container-lines" ref={containerLinesRef}></div>
          <div className="container-rings"></div>
        </div>
        <div className="progress-text">{isPlaying ? `${progress}%` : 'Click to Play'}</div>
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
            <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -10" />
          </filter>
        </svg>
      </div>
    </div>
  );
};

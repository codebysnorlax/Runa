import { useEffect, useRef, useState } from 'react';
import './AudioOrb.css';

interface AudioOrbProps {
  audioSrc: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

export const AudioOrb = ({ audioSrc, onComplete, onCancel }: AudioOrbProps) => {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerLinesRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<{ ctx: AudioContext; analyser: AnalyserNode; data: Uint8Array } | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let isMounted = true;

    const animate = () => {
      if (!contextRef.current || !containerLinesRef.current || !orbRef.current) return;

      const { analyser, data } = contextRef.current;
      analyser.getByteFrequencyData(data);

      const beat = data.slice(0, 32).reduce((a, b) => a + b) / 8160;
      const mid = data.slice(32, 96).reduce((a, b) => a + b) / 16320;

      const points = [];
      for (let i = 0; i < 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        const spike = i % 2 === 0 && beat > 0.3 ? beat * 15 : 0;
        const r = (50 + spike) * 0.8;
        points.push(`${50 + Math.cos(angle) * r}% ${50 + Math.sin(angle) * r}%`);
      }

      containerLinesRef.current.style.clipPath = `polygon(${points.join(', ')})`;
      containerLinesRef.current.style.transform = `translate(-50%, -50%) scale(${1 + beat * 0.1})`;
      orbRef.current.style.filter = `drop-shadow(0 0 ${beat * 30 + mid * 20}px rgba(0, ${Math.floor(128 + beat * 127)}, 255, 0.8))`;

      animationRef.current = requestAnimationFrame(animate);
    };

    const setupAudioContext = () => {
      if (!contextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.8;

        const source = ctx.createMediaElementSource(audio);
        source.connect(analyser);=
        analyser.connect(ctx.destination);

        contextRef.current = { ctx, analyser, data: new Uint8Array(analyser.frequencyBinCount) };
      }
    };

    const onTimeUpdate = () => {
      if (audio.duration > 0) {
        setProgress(Math.round((audio.currentTime / audio.duration) * 100));
      }
    };

    const onEnded = () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setIsPlaying(false);
      onComplete?.();
    };

    // Initialize context on first user interaction if needed or play
    // But since this component expects to play, we handle it on toggle or play.

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      isMounted = false;
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (contextRef.current?.ctx.state === 'running') {
        contextRef.current?.ctx.suspend().catch(() => { });
      }
    };
  }, [audioSrc, onComplete]);

  // Handle Play/Pause
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;


    if (isPlaying) {
      audio.pause();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setIsPlaying(false);

      // Reset animation styles
      if (containerLinesRef.current) {
        containerLinesRef.current.style.clipPath = 'none';
        containerLinesRef.current.style.transform = 'translate(-50%, -50%) scale(1)';
      }
      if (orbRef.current) {
        orbRef.current.style.filter = 'none';
      }
    } else {
      // Ensure audio context is set up
      if (!contextRef.current) {
        // We need to set it up here if not done yet.
        // Re-using the logic from effect might be tricky due to closures/refs.
        // Let's rely on a helper or just duplicate the simple setup if needed,
        // OR assume the effect setup handles it?
        // Actually the effect setup was removed in the replacement to be inside toggle/play.
        // Let's add the setup logic cleanly.
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.8;
        const source = ctx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(ctx.destination);
        contextRef.current = { ctx, analyser, data: new Uint8Array(analyser.frequencyBinCount) };
      }

      if (contextRef.current?.ctx.state === 'suspended') {
        await contextRef.current.ctx.resume();
      }

      try {
        await audio.play();
        setIsPlaying(true);

        // Start animation loop
        const animate = () => {
          if (!contextRef.current || !containerLinesRef.current || !orbRef.current) return;
          const { analyser, data } = contextRef.current;
          analyser.getByteFrequencyData(data);

          const beat = data.slice(0, 32).reduce((a, b) => a + b) / 8160;
          const mid = data.slice(32, 96).reduce((a, b) => a + b) / 16320;

          const points = [];
          for (let i = 0; i < 64; i++) {
            const angle = (i / 64) * Math.PI * 2;
            const spike = i % 2 === 0 && beat > 0.3 ? beat * 15 : 0;
            const r = (50 + spike) * 0.8;
            points.push(`${50 + Math.cos(angle) * r}% ${50 + Math.sin(angle) * r}%`);
          }

          containerLinesRef.current.style.clipPath = `polygon(${points.join(', ')})`;
          containerLinesRef.current.style.transform = `translate(-50%, -50%) scale(${1 + beat * 0.1})`;
          orbRef.current.style.filter = `drop-shadow(0 0 ${beat * 30 + mid * 20}px rgba(0, ${Math.floor(128 + beat * 127)}, 255, 0.8))`;

          animationRef.current = requestAnimationFrame(animate);
        };
        animate();

      } catch (e) {
        console.error("Play failed", e);
      }
    }
  };


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

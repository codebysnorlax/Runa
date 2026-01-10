import { useEffect, useRef, useState } from 'react';
import './AudioOrbIntro.css';

interface AudioOrbIntroProps {
  audioSrc: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

export const AudioOrbIntro = ({ audioSrc, onComplete, onCancel }: AudioOrbIntroProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerLinesRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<{ ctx: AudioContext; analyser: AnalyserNode; data: Uint8Array } | null>(null);
  const animationRef = useRef<number | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Start playing automatically
    togglePlay();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      // Don't close the context, just suspend it to allow reuse in strict mode or re-mounts with same ref
      if (contextRef.current?.ctx.state === 'running') {
        contextRef.current?.ctx.suspend().catch(() => { });
      }
      setIsPlaying(false);
    };
  }, []); // Run once on mount

  const animate = () => {
    if (!contextRef.current || !containerLinesRef.current || !orbRef.current) return;

    const { analyser, data } = contextRef.current;
    analyser.getByteFrequencyData(data);

    const beat = data.slice(0, 32).reduce((a, b) => a + b) / 32 / 255;
    const mid = data.slice(32, 96).reduce((a, b) => a + b) / 64 / 255;

    const numSpikes = 32;
    const baseRadius = 50;
    const maxSpikeLength = 15;

    const points = [];
    for (let i = 0; i < numSpikes * 2; i++) {
      const angle = (i / (numSpikes * 2)) * Math.PI * 2;
      const isSpike = i % 2 === 0;

      let radius;
      if (isSpike) {
        const spikeIntensity = beat > 0.3 ? beat : 0;
        radius = baseRadius + (spikeIntensity * maxSpikeLength);
      } else {
        radius = baseRadius;
      }

      const x = 50 + Math.cos(angle) * radius * 0.8;
      const y = 50 + Math.sin(angle) * radius * 0.8;

      points.push(`${x}% ${y}%`);
    }

    containerLinesRef.current.style.clipPath = `polygon(${points.join(', ')})`;
    containerLinesRef.current.style.transform = `translate(-50%, -50%) scale(${1 + beat * 0.1})`;

    const glowIntensity = beat * 30 + mid * 20;
    const cyanGlow = Math.floor(255 * (0.5 + beat * 0.5));

    orbRef.current.style.filter = `drop-shadow(0 0 ${glowIntensity}px rgba(0, ${cyanGlow}, 255, 0.8)) drop-shadow(0 0 ${glowIntensity * 2}px rgba(0, 255, 255, 0.4))`;

    if (beat > 0.2) {
      const rotationSpeed = 1 + beat * 4;
      const rings = orbRef.current.querySelector('.container-rings');
      if (rings) {
        (rings as HTMLElement).style.animationDuration = `${3 / rotationSpeed}s`;
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  };

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
        const rings = orbRef.current.querySelector('.container-rings');
        if (rings) {
          (rings as HTMLElement).style.animationDuration = '';
        }
      }
    } else {
      if (!contextRef.current) {
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioCtx();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 1024;
          analyser.smoothingTimeConstant = 0.3;

          if (!sourceRef.current) {
            sourceRef.current = ctx.createMediaElementSource(audio);
          }

          // Reconnecting might throw if already connected, but createMediaElementSource is usually safe to reuse node if we stored it?
          // Actually you can't connect source to multiple things easily or reconnect. 
          // Better check if source is already connected.
          // But here we just created it if null.
          // NOTE: disconnect() if needed? 
          // Let's safe-guard:
          try {
            sourceRef.current.disconnect();
            analyser.disconnect();
          } catch (e) { }

          sourceRef.current.connect(analyser);
          analyser.connect(ctx.destination);

          contextRef.current = { ctx, analyser, data: new Uint8Array(analyser.frequencyBinCount) };
        } catch (e) {
          console.error("Audio Context Setup Error", e);
        }
      }

      if (contextRef.current?.ctx.state === 'suspended') {
        await contextRef.current.ctx.resume();
      }

      try {
        await audio.play();
        setIsPlaying(true);
        animate();
      } catch (e) {
        console.error("Play failed", e);
      }
    }
  };

  const handleBackgroundClick = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsPlaying(false);
    onCancel?.();
  };

  const handleAudioEnd = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsPlaying(false);
    onComplete?.();
  };

  return (
    <>
      <audio ref={audioRef} src={audioSrc} onEnded={handleAudioEnd} />
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleBackgroundClick}>
        <div className="orb-container" onClick={(e) => { e.stopPropagation(); handleBackgroundClick(); }}>
          <div className="orb" ref={orbRef} style={{ cursor: 'pointer' }}>
            <div className="ball">
              <div className="container-lines" ref={containerLinesRef}></div>
              <div className="container-rings"></div>
            </div>
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
              <filter id="gooey">
                <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
                <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -10" />
              </filter>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

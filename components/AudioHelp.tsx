import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

interface AudioHelpProps {
  audioType: 'male' | 'female';
}

const AudioHelp: React.FC<AudioHelpProps> = ({ audioType }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentlyPlaying, setCurrentlyPlaying } = useAudio();

  const audioId = `audio-${audioType}`;
  const audioFile = audioType === 'male' 
    ? '/Runa/audio/MaleJsonHelp.wav' 
    : '/Runa/audio/femaleJsonHelp.wav';

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentlyPlaying(null);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [setCurrentlyPlaying]);

  useEffect(() => {
    if (currentlyPlaying !== audioId && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  }, [currentlyPlaying, audioId, isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(audioId);
      audio.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
      <div className="flex items-center space-x-3 mb-3">
        <Volume2 className="w-5 h-5 text-brand-orange" />
        <h4 className="text-white font-medium">
          Audio Help ({audioType === 'male' ? 'Male' : 'Female'} Voice)
        </h4>
      </div>
      
      <div className="flex items-center space-x-3">
        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-10 h-10 bg-brand-orange hover:bg-orange-600 rounded-full transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white ml-0.5" />
          )}
        </button>
        
        <div className="flex-1">
          <div className="bg-gray-600 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-brand-orange h-full transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={audioFile} preload="metadata" />
    </div>
  );
};

export default AudioHelp;

'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceNotePlayerProps {
  src: string;
  isCurrentUser: boolean;
}

const Waveform = ({ isCurrentUser, isPlaying }: { isCurrentUser: boolean, isPlaying: boolean }) => {
  // Simple static representation of a waveform.
  const bars = [4, 8, 10, 12, 15, 18, 14, 11, 9, 7, 6, 8, 10, 12, 14, 11, 9, 7, 5, 10, 12, 15, 18, 14, 11, 9];
  return (
    <div className="flex items-center gap-px h-6 w-[140px] overflow-hidden">
      {bars.map((height, i) => (
        <div
          key={i}
          style={{ height: isPlaying ? `${Math.random() * 16 + 2}px` : `${height}px` }}
          className={cn(
            'w-0.5 rounded-full transition-all duration-300',
            isCurrentUser ? 'bg-white/70' : 'bg-primary/50'
          )}
        />
      ))}
    </div>
  );
};


export default function VoiceNotePlayer({ src, isCurrentUser }: VoiceNotePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
        setDuration(audio.duration);
    }
    const handleAudioEnd = () => {
        setIsPlaying(false);
        if (audioRef.current) audioRef.current.currentTime = 0;
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('ended', handleAudioEnd);
    
    // If src changes, load new metadata
    if(audio.src !== src){
        audio.load();
    }


    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('ended', handleAudioEnd);
    };
  }, [src]);

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity || time === 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const displayTime = formatTime(duration);

  return (
    <div className={cn(
        "flex items-center gap-2 p-2 w-[220px]",
        isCurrentUser ? 'text-primary-foreground' : 'text-primary'
    )}>
        <audio ref={audioRef} src={src} preload="metadata" />
        <div 
            role="button"
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
            className={cn(
                "h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center cursor-pointer",
                isCurrentUser ? "bg-white/20 hover:bg-white/30 text-white" : "bg-primary/20 hover:bg-primary/30 text-primary"
            )}
            onClick={togglePlayPause}
        >
            {isPlaying 
                ? <Pause className="h-5 w-5 fill-current" /> 
                : <Play className="h-5 w-5 fill-current ml-0.5" />
            }
        </div>
        <Waveform isCurrentUser={isCurrentUser} isPlaying={isPlaying} />
        <span className="text-xs font-mono w-10 tabular-nums">
            {displayTime}
        </span>
    </div>
  );
}

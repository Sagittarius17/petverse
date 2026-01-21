'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  src: string;
  isCurrentUser: boolean;
}

export default function AudioPlayer({ src, isCurrentUser }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.75);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => setDuration(audio.duration);
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const handleAudioEnd = () => {
        setIsPlaying(false);
        if (audioRef.current) audioRef.current.currentTime = 0;
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleAudioEnd);

    audio.volume = volume;

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleAudioEnd);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
  };
  
  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
  }

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const VolumeIcon = volume === 0 ? VolumeX : Volume2;
  
  const sliderClassNames = {
      track: "h-1 bg-white/30",
      range: "bg-white",
      thumb: "h-3 w-3 border-0 bg-white",
  };
  
  const receiverSliderClassNames = {
      track: "h-1 bg-foreground/20",
      range: "bg-foreground/50",
      thumb: "h-3 w-3 border-0 bg-foreground/80",
  }

  return (
    <div className={cn("flex items-center gap-2 w-full p-2 rounded-lg", isCurrentUser ? "bg-black/20 text-primary-foreground" : "bg-muted text-foreground")}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <Button variant="ghost" size="icon" className="h-8 w-8 text-inherit hover:bg-white/10 hover:text-inherit flex-shrink-0" onClick={togglePlayPause}>
        {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
      </Button>
      <Slider
          value={[currentTime]}
          max={duration || 1}
          step={0.1}
          onValueChange={handleProgressChange}
          classNames={isCurrentUser ? sliderClassNames : receiverSliderClassNames}
        />
      <div className="text-xs font-mono w-24 text-center tabular-nums">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
       <Button variant="ghost" size="icon" className="h-8 w-8 text-inherit hover:bg-white/10 hover:text-inherit flex-shrink-0" onClick={() => handleVolumeChange([volume > 0 ? 0 : 0.75])}>
          <VolumeIcon className="h-5 w-5" />
      </Button>
      <Slider
          value={[volume]}
          max={1}
          step={0.05}
          onValueChange={handleVolumeChange}
          className="w-20"
          classNames={isCurrentUser ? sliderClassNames : receiverSliderClassNames}
        />
    </div>
  );
}

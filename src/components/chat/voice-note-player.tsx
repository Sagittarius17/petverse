'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// New Waveform component using Canvas
const Waveform = ({
  analyser,
  isCurrentUser,
  isPlaying,
  isLoading,
}: {
  analyser: AnalyserNode | null;
  isCurrentUser: boolean;
  isPlaying: boolean;
  isLoading: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();

  const draw = useCallback(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    analyser.fftSize = 64; // Fewer bars for a cleaner look
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const drawVisual = () => {
      animationFrameId.current = requestAnimationFrame(drawVisual);

      analyser.getByteFrequencyData(dataArray);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 0.5;
      const barGap = 3;
      const totalWidth = (barWidth + barGap) * bufferLength;
      let x = (canvas.width - totalWidth) / 2;
      
      const primaryRgb = getComputedStyle(document.documentElement).getPropertyValue('--primary-rgb').trim();
      canvasCtx.fillStyle = isCurrentUser ? 'rgba(255, 255, 255, 0.7)' : `rgba(${primaryRgb}, 0.7)`;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        // Draw rounded bars
        const radius = barWidth / 2;
        if (barHeight > 0) {
            canvasCtx.beginPath();
            canvasCtx.moveTo(x + radius, canvas.height - barHeight);
            canvasCtx.lineTo(x + barWidth - radius, canvas.height - barHeight);
            canvasCtx.quadraticCurveTo(x + barWidth, canvas.height - barHeight, x + barWidth, canvas.height - barHeight + radius);
            canvasCtx.lineTo(x + barWidth, canvas.height - radius);
            canvasCtx.quadraticCurveTo(x + barWidth, canvas.height, x + barWidth - radius, canvas.height);
            canvasCtx.lineTo(x + radius, canvas.height);
            canvasCtx.quadraticCurveTo(x, canvas.height, x, canvas.height - radius);
            canvasCtx.lineTo(x, canvas.height - barHeight + radius);
            canvasCtx.quadraticCurveTo(x, canvas.height - barHeight, x + radius, canvas.height - barHeight);
            canvasCtx.closePath();
            canvasCtx.fill();
        }
        
        x += barWidth + barGap;
      }
    };
    
    if (isPlaying) {
      drawVisual();
    } else {
        if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [analyser, isPlaying, isCurrentUser]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.getContext('2d')?.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    
    const cleanup = draw();
    return cleanup;

  }, [draw]);

  // Loading state visualizer
  if (isLoading) {
      return (
          <div className="flex items-center gap-1 h-6 w-[140px] overflow-hidden">
              {[...Array(26)].map((_, i) => (
                  <div
                      key={i}
                      style={{
                          height: `${Math.random() * 70 + 20}%`,
                          animation: `loading-pulse 1.2s infinite ease-in-out ${i * 0.04}s`
                      }}
                      className={cn(
                          'w-0.5 rounded-full',
                          isCurrentUser ? 'bg-white/50' : 'bg-primary/30'
                      )}
                  />
              ))}
              <style>{`
                  @keyframes loading-pulse {
                      0%, 100% { transform: scaleY(0.5); opacity: 0.3; }
                      50% { transform: scaleY(1); opacity: 0.7; }
                  }
              `}</style>
          </div>
      )
  }

  return <canvas ref={canvasRef} className="h-6 w-[140px]" />;
};


// Main Player Component
interface VoiceNotePlayerProps {
  src: string;
  isCurrentUser: boolean;
}

export default function VoiceNotePlayer({ src, isCurrentUser }: VoiceNotePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Setup Web Audio API
  const setupAudioContext = useCallback(() => {
    if (!audioRef.current || sourceRef.current) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyserRef.current = analyser;
    
    const source = audioContext.createMediaElementSource(audioRef.current);
    sourceRef.current = source;
    source.connect(analyser);
    analyser.connect(audioContext.destination);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const setAudioData = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleCanPlay = () => {
        setIsLoading(false);
    };

    const handleAudioEnd = () => {
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.currentTime = 0;
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleAudioEnd);

    if (audio.src !== src) {
      setIsLoading(true);
      setDuration(0);
      audio.load();
    }

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleAudioEnd);
    };
  }, [src]);

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }
    
    if (!sourceRef.current) {
        setupAudioContext();
    }
    
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => console.error("Audio play failed:", err));
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
    <div
      className={cn(
        "flex items-center gap-2 p-2 w-[220px]",
        isCurrentUser ? 'text-primary-foreground' : 'text-primary'
      )}
    >
      <audio ref={audioRef} src={src} crossOrigin="anonymous" preload="metadata" />
      <div
        role="button"
        aria-label={isPlaying ? "Pause audio" : "Play audio"}
        className={cn(
          "h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center cursor-pointer",
          isCurrentUser ? "bg-white/20 hover:bg-white/30 text-white" : "bg-primary/20 hover:bg-primary/30 text-primary",
          isLoading && "cursor-not-allowed"
        )}
        onClick={!isLoading ? togglePlayPause : undefined}
      >
        {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin"/>
        ) : isPlaying ? (
          <Pause className="h-5 w-5 fill-current" />
        ) : (
          <Play className="h-5 w-5 fill-current ml-0.5" />
        )}
      </div>
      <Waveform analyser={analyserRef.current} isCurrentUser={isCurrentUser} isPlaying={isPlaying} isLoading={isLoading} />
      <span className="text-xs font-mono w-10 tabular-nums">
        {isLoading ? '...' : displayTime}
      </span>
    </div>
  );
}

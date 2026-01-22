'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Loader2, Mic, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirestore, useMemoFirebase, useDoc, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Define Message interface locally as it's passed down
interface Message {
  id: string;
  senderId: string;
  timestamp: any;
  mediaUrl?: string;
  isRead?: boolean;
  isPlayed?: boolean;
}

// New Waveform component using Canvas
const Waveform = ({
  analyser,
  isCurrentUser,
  isPlaying,
  isLoading,
  audioElement,
  onSeek,
}: {
  analyser: AnalyserNode | null;
  isCurrentUser: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  audioElement: HTMLAudioElement | null;
  onSeek: (progress: number) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();

  const draw = useCallback(() => {
    if (!analyser || !canvasRef.current || !audioElement) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    analyser.fftSize = 128;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const drawVisual = () => {
      animationFrameId.current = requestAnimationFrame(drawVisual);
      analyser.getByteFrequencyData(dataArray);
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = 2;
      const barGap = 2;
      const totalBarWidth = barWidth + barGap;
      const numBars = Math.floor(canvas.width / totalBarWidth);
      const step = Math.floor(bufferLength / numBars);
      let x = 0;

      const progress = audioElement.duration > 0 ? audioElement.currentTime / audioElement.duration : 0;
      const playedBars = Math.floor(numBars * progress);

      const primaryRgb = getComputedStyle(document.documentElement).getPropertyValue('--primary-rgb').trim();
      const playedColor = isCurrentUser ? 'rgba(255, 255, 255, 0.9)' : `rgba(${primaryRgb}, 0.9)`;
      const unplayedColor = isCurrentUser ? 'rgba(255, 255, 255, 0.4)' : `rgba(${primaryRgb}, 0.4)`;

      for (let i = 0; i < numBars; i++) {
        let barHeightSum = 0;
        for (let j = 0; j < step; j++) {
          barHeightSum += dataArray[i * step + j];
        }
        let barHeight = (barHeightSum / step) / 255 * (canvas.height * 0.9);
        barHeight = Math.max(barHeight, 2);

        const y = (canvas.height - barHeight) / 2;

        canvasCtx.fillStyle = i < playedBars ? playedColor : unplayedColor;
        const radius = barWidth / 2;
        if (barHeight > 0) {
          canvasCtx.beginPath();
          canvasCtx.moveTo(x + radius, y);
          canvasCtx.lineTo(x + barWidth - radius, y);
          canvasCtx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
          canvasCtx.lineTo(x + barWidth, y + barHeight - radius);
          canvasCtx.quadraticCurveTo(x + barWidth, y + barHeight, x + barWidth - radius, y + barHeight);
          canvasCtx.lineTo(x + radius, y + barHeight);
          canvasCtx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius);
          canvasCtx.lineTo(x, y + radius);
          canvasCtx.quadraticCurveTo(x, y, x + radius, y);
          canvasCtx.closePath();
          canvasCtx.fill();
        }
        x += totalBarWidth;
      }
      
      // Draw the pointer circle
      if (audioElement.duration > 0) {
        const circleX = progress * canvas.width;
        const circleY = canvas.height / 2;
        const circleRadius = 3;
        
        canvasCtx.beginPath();
        canvasCtx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI, false);
        canvasCtx.fillStyle = playedColor;
        canvasCtx.fill();
      }
    };
    drawVisual();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [analyser, audioElement, isPlaying, isCurrentUser]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
    }
    const cleanup = draw();
    return cleanup;
  }, [draw, isPlaying]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !audioElement || audioElement.duration === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const progress = clickX / rect.width;
    onSeek(progress);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-1 h-8 w-full overflow-hidden cursor-wait">
        {[...Array(35)].map((_, i) => (
          <div
            key={i}
            style={{
              height: `${Math.random() * 60 + 20}%`,
              animation: `loading-pulse 1.2s infinite ease-in-out ${i * 0.04}s`,
            }}
            className={cn('w-0.5 rounded-full', isCurrentUser ? 'bg-white/50' : 'bg-primary/30')}
          />
        ))}
        <style>{`
          @keyframes loading-pulse {
            0%, 100% { transform: scaleY(0.5); opacity: 0.3; }
            50% { transform: scaleY(1); opacity: 0.7; }
          }
        `}</style>
      </div>
    );
  }

  return <canvas ref={canvasRef} className="h-8 w-full cursor-pointer" onClick={handleCanvasClick} />;
};

function SenderAvatar({ senderId }: { senderId: string }) {
    const firestore = useFirestore();
    const userDocRef = useMemoFirebase(
      () => (firestore ? doc(firestore, 'users', senderId) : null),
      [firestore, senderId]
    );
    const { data: userProfile } = useDoc<{ profilePicture?: string, displayName?: string }>(userDocRef);
  
    return (
        <Avatar className="h-8 w-8">
            <AvatarImage src={userProfile?.profilePicture} />
            <AvatarFallback>{userProfile?.displayName?.[0] || 'U'}</AvatarFallback>
        </Avatar>
    );
}

// Main Player Component
interface VoiceNotePlayerProps {
  message: Message;
  isCurrentUser: boolean;
  activeConversationId: string;
}

export default function VoiceNotePlayer({ message, isCurrentUser, activeConversationId }: VoiceNotePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const firestore = useFirestore();

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
    
    const setAudioData = () => { setDuration(audio.duration); setIsLoading(false); };
    const handleCanPlay = () => { setIsLoading(false); };
    const handleTimeUpdate = () => { setCurrentTime(audio.currentTime); };
    const handleAudioEnd = () => { setIsPlaying(false); };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleAudioEnd);

    if (audio.src !== message.mediaUrl) {
      setIsLoading(true); setDuration(0); setCurrentTime(0); audio.load();
    }

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleAudioEnd);
    };
  }, [message.mediaUrl]);

  const handleSeek = (progress: number) => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      audioRef.current.currentTime = progress * audioRef.current.duration;
    }
  };

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') { audioContextRef.current.resume(); }
    if (!sourceRef.current) { setupAudioContext(); }
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); } 
    else {
      if (audio.currentTime >= audio.duration) { audio.currentTime = 0; }
      audio.play().catch(err => console.error("Audio play failed:", err));
      
      if (!isCurrentUser && !message.isPlayed) {
        if (firestore && activeConversationId) {
          const messageRef = doc(firestore, 'conversations', activeConversationId, 'messages', message.id);
          updateDocumentNonBlocking(messageRef, { isPlayed: true });
        }
      }
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const ReadReceipt = () => {
    if (!isCurrentUser) return null;
    
    const baseClass = "h-4 w-4";

    if (message.isPlayed) {
        return <Headphones className={cn(baseClass, "text-blue-400")} />;
    }
    if (message.isRead) {
        return <Mic className={cn(baseClass, "text-blue-400")} />;
    }
    return <Mic className={cn(baseClass, "text-primary-foreground/70")} />;
  };

  const displayTime = isPlaying ? formatTime(currentTime) : formatTime(duration);

  return (
    <div
      className={cn(
        "flex flex-col p-2 w-full max-w-[280px] rounded-2xl",
        isCurrentUser 
          ? 'bg-primary text-primary-foreground rounded-br-none' 
          : 'bg-background border rounded-bl-none'
      )}
    >
      <audio ref={audioRef} src={message.mediaUrl} crossOrigin="anonymous" preload="metadata" />
      <div className="flex items-center gap-2">
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
          {isLoading ? ( <Loader2 className="h-5 w-5 animate-spin"/> ) : isPlaying ? ( <Pause className="h-5 w-5 fill-current" /> ) : ( <Play className="h-5 w-5 fill-current ml-0.5" /> )}
        </div>
        <div className="flex-1 min-w-0">
            <Waveform 
                analyser={analyserRef.current} 
                isCurrentUser={isCurrentUser} 
                isPlaying={isPlaying} 
                isLoading={isLoading} 
                audioElement={audioRef.current}
                onSeek={handleSeek}
            />
        </div>
        <div className="flex-shrink-0">
            <SenderAvatar senderId={message.senderId} />
        </div>
      </div>
      <div className="flex justify-between items-center mt-1 px-1">
        <span className={cn("text-xs font-mono tabular-nums", isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
            {displayTime}
        </span>
        <div className={cn("flex items-center gap-1.5 text-xs", isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
            <span>{message.timestamp ? format(message.timestamp.toDate(), 'h:mm a') : ''}</span>
            <ReadReceipt />
        </div>
      </div>
    </div>
  );
}

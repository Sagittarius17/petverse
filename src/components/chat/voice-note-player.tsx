'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Loader2, Mic, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirestore, useMemoFirebase, useDoc, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useChatStore } from '@/lib/chat-store';

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
  currentTime,
  messageTimestamp,
}: {
  analyser: AnalyserNode | null;
  isCurrentUser: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  audioElement: HTMLAudioElement | null;
  onSeek: (progress: number) => void;
  currentTime: number;
  messageTimestamp: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const staticWaveform = useRef<number[]>([]);
  const animatedHeights = useRef<number[]>([]);

  // Generate a unique but consistent static waveform for each message
  useEffect(() => {
    if (canvasRef.current && staticWaveform.current.length === 0 && messageTimestamp > 0) {
      const numBars = Math.floor(canvasRef.current.width / 4); // Based on barWidth+barGap
      let seed = messageTimestamp % 2147483647;
      if (seed <= 0) seed += 2147483646;

      const pseudoRandom = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
      
      staticWaveform.current = Array.from({ length: numBars }, () => pseudoRandom());
    }
  }, [messageTimestamp]); // Depends on timestamp to generate once

  const draw = useCallback(() => {
    if (!canvasRef.current || !audioElement) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    let dataArray: Uint8Array | null = null;
    if (analyser) {
        analyser.fftSize = 128;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
    }
    
    const barWidth = 2;
    const barGap = 2;
    const totalBarWidth = barWidth + barGap;
    const numBars = Math.floor(canvas.width / totalBarWidth);

    if (animatedHeights.current.length !== numBars) {
      animatedHeights.current = new Array(numBars).fill(0);
    }

    const drawVisual = () => {
      animationFrameId.current = requestAnimationFrame(drawVisual);
      
      if (isPlaying && analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
      }
      
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      const progress = audioElement.duration > 0 ? audioElement.currentTime / audioElement.duration : 0;
      const playedBars = Math.floor(numBars * progress);

      const primaryRgb = getComputedStyle(document.documentElement).getPropertyValue('--primary-rgb').trim();
      const playedColor = isCurrentUser ? 'rgba(255, 255, 255, 0.9)' : `rgba(${primaryRgb}, 0.9)`;
      const unplayedColor = isCurrentUser ? 'rgba(255, 255, 255, 0.4)' : `rgba(${primaryRgb}, 0.4)`;
      const glowColor = isCurrentUser ? 'rgba(255, 255, 255, 0.5)' : `rgba(${primaryRgb}, 0.5)`;

      let x = 0;

      for (let i = 0; i < numBars; i++) {
        let targetHeight;
        if (isPlaying && dataArray) {
          const step = Math.floor(dataArray.length / numBars);
          let barHeightSum = 0;
          for (let j = 0; j < step; j++) {
            barHeightSum += dataArray[i * step + j];
          }
          targetHeight = (barHeightSum / step / 255) * (canvas.height * 0.9);
        } else {
          targetHeight = (staticWaveform.current[i] || 0.5) * (canvas.height * 0.7);
        }
        
        const currentHeight = animatedHeights.current[i];
        const smoothedHeight = currentHeight + (targetHeight - currentHeight) * 0.2;
        animatedHeights.current[i] = smoothedHeight;

        const barHeight = Math.max(smoothedHeight, 2);
        const y = (canvas.height - barHeight) / 2;

        const isPlayed = i < playedBars;
        canvasCtx.fillStyle = isPlayed ? playedColor : unplayedColor;
        
        canvasCtx.shadowBlur = isPlayed ? 8 : 0;
        canvasCtx.shadowColor = isPlayed ? glowColor : 'transparent';

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
      
      canvasCtx.shadowBlur = 0;

      if (audioElement.duration > 0) {
        const circleX = progress * canvas.width;
        const circleY = canvas.height / 2;
        const circleRadius = 5;
        
        canvasCtx.beginPath();
        canvasCtx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI, false);
        canvasCtx.fillStyle = playedColor;
        canvasCtx.shadowColor = glowColor;
        canvasCtx.shadowBlur = 10;
        canvasCtx.fill();
        canvasCtx.shadowBlur = 0;
      }
    };

    drawVisual();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [analyser, audioElement, isPlaying, isCurrentUser, messageTimestamp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
    }
    const cleanup = draw();
    return cleanup;
  }, [draw, isPlaying, currentTime]); // Re-draw on seek

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !audioElement || !isFinite(audioElement.duration)) return;
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

  const { setCurrentlyPlayingAudio, currentlyPlayingAudio } = useChatStore();

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
    const handlePlayEvent = () => setIsPlaying(true);
    const handlePauseEvent = () => setIsPlaying(false);
    
    const handleAudioEnd = () => {
      if (currentlyPlayingAudio === audio) {
        setCurrentlyPlayingAudio(null);
      }
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleAudioEnd);
    audio.addEventListener('play', handlePlayEvent);
    audio.addEventListener('pause', handlePauseEvent);

    if (audio.src !== message.mediaUrl) {
      setIsLoading(true); setDuration(0); setCurrentTime(0); audio.load();
    }

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleAudioEnd);
      audio.removeEventListener('play', handlePlayEvent);
      audio.removeEventListener('pause', handlePauseEvent);
    };
  }, [message.mediaUrl, currentlyPlayingAudio, setCurrentlyPlayingAudio]);

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

    if (audio.paused) {
      if (audio.currentTime >= audio.duration) { audio.currentTime = 0; }
      setCurrentlyPlayingAudio(audio); // This will pause any other playing audio
      audio.play().catch(err => console.error("Audio play failed:", err));
      
      if (!isCurrentUser && !message.isPlayed) {
        if (firestore && activeConversationId) {
          const messageRef = doc(firestore, 'conversations', activeConversationId, 'messages', message.id);
          updateDocumentNonBlocking(messageRef, { isPlayed: true });
        }
      }
    } else {
      audio.pause();
    }
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
                currentTime={currentTime}
                messageTimestamp={message.timestamp.toMillis()}
            />
        </div>
        {!isCurrentUser && <SenderAvatar senderId={message.senderId} />}
      </div>
      <div className="flex justify-between items-center px-1">
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

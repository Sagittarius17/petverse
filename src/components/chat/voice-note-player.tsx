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

// A simplified waveform component that draws a straight progress bar
const Waveform = ({
  isCurrentUser,
  audioElement,
  onSeek,
}: {
  isCurrentUser: boolean;
  audioElement: HTMLAudioElement | null;
  onSeek: (progress: number) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const isSeeking = useRef(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const audioElementRef = audioElement;
    if (!canvas || !audioElementRef) return;
    
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const drawVisual = () => {
      animationFrameId.current = requestAnimationFrame(drawVisual);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      const progress = audioElementRef.duration > 0 ? audioElementRef.currentTime / audioElementRef.duration : 0;
      
      const primaryRgb = getComputedStyle(document.documentElement).getPropertyValue('--primary-rgb').trim();
      const playedColor = isCurrentUser ? 'rgba(255, 255, 255, 0.9)' : `rgba(${primaryRgb}, 0.9)`;
      const unplayedColor = isCurrentUser ? 'rgba(255, 255, 255, 0.4)' : `rgba(${primaryRgb}, 0.4)`;
      const glowColor = isCurrentUser ? 'rgba(255, 255, 255, 0.5)' : `rgba(${primaryRgb}, 0.5)`;
      
      const lineY = canvas.height / 2;
      const circleRadius = 6;
      const playedLineWidth = 3;
      const unplayedLineWidth = 2;

      // Adjust drawing area to account for line caps and handle radius
      const padding = circleRadius + playedLineWidth;
      const startX = padding;
      const endX = canvas.width - padding;
      const drawableWidth = endX - startX;
      
      const progressX = startX + (progress * drawableWidth);

      // 1. Draw unplayed (background) line
      canvasCtx.strokeStyle = unplayedColor;
      canvasCtx.lineWidth = unplayedLineWidth;
      canvasCtx.lineCap = 'round';
      canvasCtx.beginPath();
      canvasCtx.moveTo(startX, lineY);
      canvasCtx.lineTo(endX, lineY);
      canvasCtx.stroke();
      
      // Draw small circles at both ends of the unplayed line for a finished look
      const endCapRadius = unplayedLineWidth;
      canvasCtx.fillStyle = unplayedColor;
      canvasCtx.beginPath();
      canvasCtx.arc(startX, lineY, endCapRadius, 0, 2 * Math.PI);
      canvasCtx.fill();
      canvasCtx.beginPath();
      canvasCtx.arc(endX, lineY, endCapRadius, 0, 2 * Math.PI);
      canvasCtx.fill();


      // 2. Draw played (glowing) line
      if (progress > 0) {
        canvasCtx.strokeStyle = playedColor;
        canvasCtx.lineWidth = playedLineWidth;
        canvasCtx.lineCap = 'round';
        canvasCtx.shadowBlur = 8;
        canvasCtx.shadowColor = glowColor;
        
        canvasCtx.beginPath();
        canvasCtx.moveTo(startX, lineY);
        canvasCtx.lineTo(progressX, lineY);
        canvasCtx.stroke();

        // Reset shadow
        canvasCtx.shadowBlur = 0;
      }
      
      // 3. Draw handle
      canvasCtx.beginPath();
      canvasCtx.arc(progressX, lineY, circleRadius, 0, 2 * Math.PI, false);
      canvasCtx.fillStyle = playedColor;
      canvasCtx.shadowColor = glowColor;
      canvasCtx.shadowBlur = 10;
      canvasCtx.fill();

      // Reset shadow for next frame
      canvasCtx.shadowBlur = 0;
    };

    drawVisual();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [audioElement, isCurrentUser]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    }
    const cleanup = draw();
    return cleanup;
  }, [draw]);

  const getProgressFromEvent = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !audioElement || !isFinite(audioElement.duration)) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    
    const circleRadius = 6;
    const playedLineWidth = 3;
    const padding = circleRadius + playedLineWidth;
    const startX = padding;
    const endX = rect.width - padding;
    const drawableWidth = endX - startX;

    const clampedX = Math.max(startX, Math.min(x, endX));
    const progress = (clampedX - startX) / drawableWidth;
    return progress;
  };
  
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    isSeeking.current = true;
    const progress = getProgressFromEvent(event);
    if (progress !== null) {
      onSeek(progress);
    }
  };
  
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSeeking.current) return;
    const progress = getProgressFromEvent(event);
    if (progress !== null) {
      onSeek(progress);
    }
  };

  const handleMouseUp = () => {
    isSeeking.current = false;
  };
  
  const handleMouseLeave = () => {
    isSeeking.current = false;
  };

  return (
    <canvas
      ref={canvasRef}
      className="h-8 w-full cursor-pointer"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  );
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

  const { setCurrentlyPlayingAudio, currentlyPlayingAudio } = useChatStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const firestore = useFirestore();

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
                isCurrentUser={isCurrentUser}
                audioElement={audioRef.current}
                onSeek={handleSeek}
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


'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, PawPrint, Mic, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirestore, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useChatStore } from '@/lib/chat-store';
import { useDoc } from '@/firebase';

// Define Message interface locally as it's passed down
interface Message {
  id: string;
  senderId: string;
  timestamp: any;
  mediaUrl?: string;
  isRead?: boolean;
  isPlayed?: boolean;
}

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
      
      const playedColor = isCurrentUser ? 'rgba(255, 255, 255, 0.9)' : 'rgba(34, 197, 94, 0.9)'; // green-500
      const unplayedColor = isCurrentUser ? 'rgba(255, 255, 255, 0.4)' : 'rgba(209, 213, 219, 0.9)'; // gray-300
      const glowColor = isCurrentUser ? 'rgba(255, 255, 255, 0.5)' : 'rgba(34, 197, 94, 0.5)';
      
      const circleRadius = 6;
      const playedLineWidth = 3;
      const padding = circleRadius + playedLineWidth / 2; // Adjust padding
      const startX = padding;
      const endX = canvas.width - padding;
      const drawableWidth = endX - startX;
      const lineY = canvas.height / 2;
      const progressX = startX + (progress * drawableWidth);

      canvasCtx.strokeStyle = unplayedColor;
      canvasCtx.lineWidth = playedLineWidth;
      canvasCtx.lineCap = 'round';

      // Draw the full unplayed line with end caps
      canvasCtx.beginPath();
      canvasCtx.moveTo(startX, lineY);
      canvasCtx.lineTo(endX, lineY);
      canvasCtx.stroke();
      
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
        canvasCtx.shadowBlur = 0;
      }
      
      canvasCtx.beginPath();
      canvasCtx.arc(progressX, lineY, circleRadius, 0, 2 * Math.PI, false);
      canvasCtx.fillStyle = playedColor;
      canvasCtx.shadowColor = glowColor;
      canvasCtx.shadowBlur = 10;
      canvasCtx.fill();
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
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    }
    const cleanup = draw();
    return cleanup;
  }, [draw]);
  
  const getProgressFromEvent = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !audioElement || !isFinite(audioElement.duration)) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    
    const circleRadius = 6;
    const playedLineWidth = 3;
    const padding = circleRadius + playedLineWidth / 2;
    const startX = padding;
    const endX = rect.width - padding;
    const drawableWidth = endX - startX;
    const clampedX = Math.max(startX, Math.min(x, endX));
    const progress = (clampedX - startX) / drawableWidth;
    return progress;
  };
  
  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.stopPropagation(); // Prevent swipe-to-reply gesture
    isSeeking.current = true;
    const progress = getProgressFromEvent(event);
    if (progress !== null) {
      onSeek(progress);
    }
  };
  
  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isSeeking.current) return;
    const progress = getProgressFromEvent(event);
    if (progress !== null) {
      onSeek(progress);
    }
  };

  const handlePointerUp = () => {
    isSeeking.current = false;
  };

  return (
    <canvas
      ref={canvasRef}
      className="h-8 w-full cursor-pointer"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { currentlyPlayingAudio, setCurrentlyPlayingAudio } = useChatStore();
  const currentlyPlayingId = currentlyPlayingAudio?.dataset.messageId;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const firestore = useFirestore();
  
  const initAudio = useCallback(() => {
      if (message.mediaUrl && !audioRef.current) {
          audioRef.current = new Audio(message.mediaUrl);
          audioRef.current.dataset.messageId = message.id;
      }
      const audio = audioRef.current;
      if (!audio) return;
    
      setIsLoading(true);
    
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
        setIsLoading(false);
      };
      const handleCanPlay = () => setIsLoading(false);
      const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentlyPlayingAudio(null);
      };
    
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('canplaythrough', handleCanPlay);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
    
      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
      };
  }, [message.id, message.mediaUrl, setCurrentlyPlayingAudio]);

  useEffect(() => {
    const cleanup = initAudio();
    return cleanup;
  }, [initAudio]);
  
  useEffect(() => {
    // This effect ensures this player pauses if another one starts
    if (currentlyPlayingId !== message.id && isPlaying) {
      audioRef.current?.pause();
    }
  }, [currentlyPlayingId, message.id, isPlaying]);


  const handleSeek = (progress: number) => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
        audioRef.current.currentTime = progress * audioRef.current.duration;
    }
  };
  
  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current || isLoading) return;

    if (isPlaying) {
      setCurrentlyPlayingAudio(null);
    } else {
      setCurrentlyPlayingAudio(audioRef.current);
      audioRef.current.play().catch(console.error);

      if (!isCurrentUser && !message.isPlayed) {
        if (firestore && activeConversationId) {
          const messageRef = doc(firestore, 'conversations', activeConversationId, 'messages', message.id);
          updateDocumentNonBlocking(messageRef, { isPlayed: true });
        }
      }
    }
  };


  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const ReadReceipt = () => {
    if (!isCurrentUser) return null;
    
    const baseClass = "h-4 w-4";

    if (message.isPlayed) {
      return <Headphones className={cn(baseClass, "text-green-400")} />;
    }
    if (message.isRead) {
      return <Mic className={cn(baseClass, "text-green-400")} />;
    }
    return <Mic className={cn(baseClass, "text-gray-400")} />;
  };

  const displayTime = isPlaying ? formatTime(currentTime) : formatTime(duration);

  return (
    <div
      className={cn(
        "flex flex-col p-2 w-full max-w-[280px] rounded-2xl",
        isCurrentUser 
          ? 'bg-gray-800 text-gray-50 rounded-br-none' 
          : 'bg-background border rounded-bl-none'
      )}
    >
      <div className="flex items-center gap-2">
        <div
          role="button"
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
          className={cn(
            "h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center cursor-pointer",
            "bg-green-500/20 hover:bg-green-500/30 text-green-600 dark:text-green-400",
            isLoading && "cursor-not-allowed"
          )}
          onClick={togglePlayPause}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {isLoading ? ( 
            <div className="relative flex h-5 w-5 items-center justify-center">
              <div className="absolute h-full w-full animate-spin rounded-full border-2 border-current border-t-transparent" />
              <PawPrint className="h-3 w-3 text-current" />
            </div>
           ) : isPlaying ? ( <Pause className="h-5 w-5 fill-current" /> ) : ( <Play className="h-5 w-5 fill-current ml-0.5" /> )}
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
        <span className={cn("text-xs font-mono tabular-nums", isCurrentUser ? 'text-gray-300' : 'text-muted-foreground')}>
            {displayTime}
        </span>
        <div className={cn("flex items-center gap-1.5 text-xs", isCurrentUser ? 'text-gray-300' : 'text-muted-foreground')}>
            <span>{message.timestamp ? new Date(message.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
            <ReadReceipt />
        </div>
      </div>
    </div>
  );
}

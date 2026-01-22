
'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { format } from 'date-fns';
import { Check, CheckCheck, CornerUpLeft, ImageIcon, MicIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import VoiceNotePlayer from './voice-note-player';
import { useChatStore, ReplyMessageInfo } from '@/lib/chat-store';

interface ReplyContext {
  messageId: string;
  senderId: string;
  text?: string;
  mediaType?: 'image' | 'audio';
}

interface Message {
  id: string;
  senderId: string;
  text?: string;
  timestamp: Timestamp;
  isRead?: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio';
  isPlayed?: boolean;
  replyTo?: ReplyContext;
}

interface OtherParticipant {
    id: string;
    displayName: string;
    photoURL?: string;
}

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  activeConversationId: string;
  currentUser: User;
  otherParticipant: OtherParticipant | null;
  highlightedMessageId: string | null;
  onReplyClick: (messageId: string) => void;
}

const SWIPE_THRESHOLD = 60; // pixels
const SWIPE_MAX_TRANSLATE = 80;

interface ReplyPreviewProps {
  replyTo: ReplyContext;
  currentUser: User;
  otherParticipant: OtherParticipant | null;
  onReplyClick: (messageId: string) => void;
}

function ReplyPreview({ replyTo, currentUser, otherParticipant, onReplyClick }: ReplyPreviewProps) {
    const senderName = replyTo.senderId === currentUser.uid ? 'You' : otherParticipant?.displayName || 'User';
    
    return (
        <button
            type="button"
            onClick={() => onReplyClick(replyTo.messageId)}
            onPointerDown={(e) => e.stopPropagation()} // Stop propagation to prevent swipe-to-reply
            className="bg-black/10 dark:bg-white/10 p-2 rounded-md mb-2 border-l-2 border-green-500 w-full text-left transition-colors hover:bg-black/20 dark:hover:bg-white/20"
        >
            <p className="font-semibold text-xs text-green-600">{senderName}</p>
            {replyTo.mediaType === 'image' && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground italic">
                    <ImageIcon className="h-3 w-3" />
                    <span>Photo</span>
                </div>
            )}
            {replyTo.mediaType === 'audio' && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground italic">
                    <MicIcon className="h-3 w-3" />
                    <span>Voice message</span>
                </div>
            )}
            {replyTo.text && (
                <p className="text-sm text-muted-foreground truncate">{replyTo.text}</p>
            )}
        </button>
    );
}

export default function MessageBubble({ message, isCurrentUser, activeConversationId, currentUser, otherParticipant, highlightedMessageId, onReplyClick }: MessageBubbleProps) {
  const hasMedia = !!message.mediaUrl;
  const hasText = !!message.text;

  const { setReplyingTo } = useChatStore();
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isHighlighted = highlightedMessageId === message.id;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only allow primary button for mouse
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = e.clientX;
    wrapperRef.current?.setPointerCapture(e.pointerId);
    if(wrapperRef.current) {
        wrapperRef.current.style.transition = 'none';
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    let deltaX = e.clientX - dragStartRef.current;

    // Constrain swipe direction
    if (isCurrentUser && deltaX > 0) deltaX = 0; // Can't swipe right on own message
    if (!isCurrentUser && deltaX < 0) deltaX = 0; // Can't swipe left on other's message

    // Apply rubber band effect
    const limitedDelta = Math.sign(deltaX) * Math.min(Math.abs(deltaX), SWIPE_MAX_TRANSLATE);
    setTranslateX(limitedDelta);
  };
  
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    wrapperRef.current?.releasePointerCapture(e.pointerId);
    if(wrapperRef.current) {
      wrapperRef.current.style.transition = 'transform 0.2s ease-out';
    }

    if (Math.abs(translateX) > SWIPE_THRESHOLD) {
      const replyInfo: ReplyMessageInfo = {
        id: message.id,
        senderId: message.senderId,
        displayName: isCurrentUser ? 'You' : otherParticipant?.displayName || 'User',
        text: message.text,
        mediaType: message.mediaType,
      };
      setReplyingTo(replyInfo);
    }
    
    setTranslateX(0);
  };
  
  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    wrapperRef.current?.releasePointerCapture(e.pointerId);
    if(wrapperRef.current) {
        wrapperRef.current.style.transition = 'transform 0.2s ease-out';
    }
    setTranslateX(0);
  }

  const TimestampAndStatus = () => (
    <div className={cn(
        "flex items-center gap-1.5 text-xs",
        isCurrentUser ? 'text-gray-300' : 'text-muted-foreground'
    )}>
        <span>
          {message.timestamp ? format(message.timestamp.toDate(), 'h:mm a') : ''}
        </span>
        {isCurrentUser && (
          message.isRead ? (
            <CheckCheck className="h-4 w-4 text-green-400" />
          ) : (
            <Check className="h-4 w-4 text-gray-300" />
          )
        )}
    </div>
  );

  return (
    <div className="relative" data-message-id={message.id}>
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 transition-opacity duration-200",
          isCurrentUser ? 'right-full mr-2' : 'left-full ml-2',
          isDragging ? 'opacity-100' : 'opacity-0'
        )}
        style={{ transform: `scale(${Math.min(1, Math.abs(translateX) / SWIPE_THRESHOLD)})` }}
      >
        <CornerUpLeft className="h-5 w-5 text-muted-foreground" />
      </div>

      <div 
        ref={wrapperRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className="touch-pan-y"
        style={{ transform: `translateX(${translateX}px)`}}
      >
        {message.mediaType === 'audio' && message.mediaUrl ? (
          <div className={cn('flex items-end gap-2 group', isCurrentUser ? 'justify-end' : 'justify-start')}>
            <VoiceNotePlayer message={message} isCurrentUser={isCurrentUser} activeConversationId={activeConversationId} />
          </div>
        ) : (
          <div className={cn('flex items-end gap-2 group', isCurrentUser ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-xs md:max-w-md rounded-2xl p-1',
                isCurrentUser
                  ? 'bg-gray-800 text-gray-50 rounded-br-none'
                  : 'bg-background border rounded-bl-none',
                isHighlighted && "animate-highlight"
              )}
            >
              {message.replyTo && (
                  <ReplyPreview
                    replyTo={message.replyTo}
                    currentUser={currentUser}
                    otherParticipant={otherParticipant}
                    onReplyClick={onReplyClick}
                  />
              )}
              {message.mediaType === 'image' && message.mediaUrl && (
                  <Dialog>
                      <DialogTrigger>
                          <div className="relative h-48 w-48 cursor-pointer rounded-lg overflow-hidden">
                              <Image src={message.mediaUrl} alt="Sent image" layout="fill" className="object-cover" />
                          </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl p-0">
                          <Image src={message.mediaUrl} alt="Sent image" width={1024} height={1024} className="w-full h-auto rounded-lg" />
                      </DialogContent>
                  </Dialog>
              )}
              
              <div className="flex items-end gap-2 px-2 pb-1 pt-1">
                  {hasText && (
                      <p className="text-sm break-words flex-1">{message.text}</p>
                  )}
                  <div className={cn("flex-shrink-0 self-end", hasText && "pl-8")}>
                      <TimestampAndStatus />
                  </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import VoiceNotePlayer from './voice-note-player';

interface Message {
  id: string;
  senderId: string;
  text?: string;
  timestamp: Timestamp;
  isRead?: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio';
}

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export default function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const hasMedia = !!message.mediaUrl;
  const hasText = !!message.text;

  const TimestampAndStatus = () => (
    <div className={cn(
        "flex items-center gap-1.5 text-xs",
        isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
    )}>
        <span>
          {message.timestamp ? format(message.timestamp.toDate(), 'h:mm a') : ''}
        </span>
        {isCurrentUser && (
          message.isRead ? (
            <CheckCheck className="h-4 w-4 text-blue-400" />
          ) : (
            <Check className="h-4 w-4 text-primary-foreground/70" />
          )
        )}
    </div>
  );

  // Render a dedicated bubble for voice notes
  if (message.mediaType === 'audio' && message.mediaUrl) {
    return (
      <div className={cn('flex items-end gap-2 group', isCurrentUser ? 'justify-end' : 'justify-start')}>
        <div
          className={cn(
            'rounded-full',
            isCurrentUser
              ? 'bg-primary'
              : 'bg-background border'
          )}
        >
          <VoiceNotePlayer src={message.mediaUrl} isCurrentUser={isCurrentUser} />
        </div>
      </div>
    );
  }

  // Render a bubble for images, with or without text
  if (message.mediaType === 'image' && message.mediaUrl) {
     return (
      <div className={cn('flex items-end gap-2 group', isCurrentUser ? 'justify-end' : 'justify-start')}>
        <div
          className={cn(
            'max-w-xs md:max-w-md rounded-2xl flex flex-col overflow-hidden',
            isCurrentUser
              ? 'bg-primary text-primary-foreground rounded-br-none'
              : 'bg-background border rounded-bl-none'
          )}
        >
          <Dialog>
              <DialogTrigger>
                  <div className="relative h-48 w-48 cursor-pointer">
                      <Image src={message.mediaUrl} alt="Sent image" layout="fill" className="object-cover" />
                  </div>
              </DialogTrigger>
              <DialogContent className="max-w-3xl p-0">
                  <Image src={message.mediaUrl} alt="Sent image" width={1024} height={1024} className="w-full h-auto rounded-lg" />
              </DialogContent>
          </Dialog>
          
          {(hasText || isCurrentUser) && (
             <div className="flex items-end gap-2 pt-1 px-2 pb-1">
                {hasText && (
                  <p className="text-sm break-words">{message.text}</p>
                )}
                <div className="flex-grow" />
                <div className="flex-shrink-0 self-end">
                    <TimestampAndStatus />
                </div>
            </div>
          )}
        </div>
      </div>
    );
  }


  // Render a bubble for text-only messages
  if (hasText) {
    return (
      <div className={cn('flex items-end gap-2 group', isCurrentUser ? 'justify-end' : 'justify-start')}>
        <div
          className={cn(
            'max-w-xs md:max-w-md rounded-2xl px-3 py-2 relative',
            isCurrentUser
              ? 'bg-primary text-primary-foreground rounded-br-none'
              : 'bg-background border rounded-bl-none'
          )}
        >
          <p className="text-sm break-words pr-20">{message.text}</p>
          <div className="absolute bottom-1.5 right-2">
            <TimestampAndStatus />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

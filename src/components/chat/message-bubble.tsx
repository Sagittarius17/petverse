'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

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
  const renderMedia = () => {
    if (!message.mediaUrl) return null;

    if (message.mediaType === 'image') {
      return (
        <Dialog>
            <DialogTrigger>
                <div className="relative h-48 w-48 mt-2 cursor-pointer">
                    <Image src={message.mediaUrl} alt="Sent image" layout="fill" className="rounded-md object-cover" />
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-3xl p-0">
                <Image src={message.mediaUrl} alt="Sent image" width={1024} height={1024} className="w-full h-auto rounded-lg" />
            </DialogContent>
        </Dialog>
      );
    }
    if (message.mediaType === 'audio') {
      return <audio controls src={message.mediaUrl} className="w-full mt-2" />;
    }
    return null;
  };

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
        {message.text && <p className="text-sm break-words pr-20">{message.text}</p>}
        {renderMedia()}
        <div className={cn(
            "absolute bottom-1.5 right-2 flex items-center gap-1.5 text-xs",
             message.text ? 'bottom-1.5 right-2' : '-bottom-5 right-1' // Adjust position if there's no text
        )}>
            <span className={cn(isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
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
      </div>
    </div>
  );
}

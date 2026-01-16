'use client';

import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
  isRead?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export default function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
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
        <div className="absolute bottom-1.5 right-2 flex items-center gap-1.5 text-xs">
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

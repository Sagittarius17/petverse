'use client';

import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
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
        <p className="text-sm break-words pr-12">{message.text}</p>
        <div className="absolute bottom-1 right-2 text-xs opacity-70">
            {message.timestamp ? format(message.timestamp.toDate(), 'h:mm a') : ''}
        </div>
      </div>
    </div>
  );
}

    
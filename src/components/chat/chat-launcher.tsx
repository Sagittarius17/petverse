'use client';

import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/lib/chat-store';

export default function ChatLauncher() {
  const { toggleChat } = useChatStore();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        size="icon"
        className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90 shadow-lg"
        onClick={toggleChat}
      >
        <MessageSquare className="h-8 w-8 text-primary-foreground" />
      </Button>
    </div>
  );
}

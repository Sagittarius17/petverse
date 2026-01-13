
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/lib/chat-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import ChatPanel from './chat-panel';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';

const BILLU_CONVERSATION_ID = 'ai-chatbot-billu';

export default function BilluChatLauncher() {
  const { isOpen, toggleChat, setActiveConversationId, closeChat } = useChatStore();
  const billuAvatar = PlaceHolderImages.find(p => p.id === 'billu-avatar') || { imageUrl: '', imageHint: 'cat' };
  const { user } = useUser();
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });
  const didMove = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragRef.current) {
        didMove.current = true;
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        setPosition({
          x: initialPos.current.x + dx,
          y: initialPos.current.y + dy,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(true);
    didMove.current = false;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    if (dragRef.current) {
        const rect = dragRef.current.getBoundingClientRect();
        initialPos.current = { 
            x: rect.right - rect.width, 
            y: rect.bottom - rect.height 
        };
    }
  };

  const handleClick = () => {
    if (didMove.current) {
        return;
    }
    setActiveConversationId(BILLU_CONVERSATION_ID);
    toggleChat();
  }

  // The chat panel needs a user to function, even for the AI bot
  if (!user) return null;

  return (
    <>
      <div
        ref={dragRef}
        className="fixed z-50"
        style={{
          bottom: `${position.y}px`,
          right: `${position.x}px`,
        }}
      >
        <Button
          variant="ghost"
          className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90 shadow-lg p-0 cursor-grab active:cursor-grabbing"
          onClick={handleClick}
          onMouseDown={handleMouseDown}
        >
          <Avatar className="w-full h-full pointer-events-none">
            <AvatarImage src={billuAvatar.imageUrl} />
            <AvatarFallback>B</AvatarFallback>
          </Avatar>
        </Button>
      </div>
      <ChatPanel
        isOpen={isOpen}
        onClose={closeChat}
        currentUser={user}
      />
    </>
  );
}

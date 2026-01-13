
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
const CAT_SOUNDS = ['Meow! 🐾', 'Purrr...', 'Miu 😺', 'Miaowww', '😻', '😽', '😹', '... purr ...'];

interface Meow {
  id: number;
  word: string;
  x: number;
  y: number;
}

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
  const [meows, setMeows] = useState<Meow[]>([]);
  const meowIdCounter = useRef(0);

  // Interval to create new meows, but only when the chat is closed.
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (!isOpen) {
      interval = setInterval(() => {
        const word = CAT_SOUNDS[Math.floor(Math.random() * CAT_SOUNDS.length)];
        const id = meowIdCounter.current++;
        const newMeow: Meow = {
          id,
          word,
          x: Math.random() * 80 - 40, // Random horizontal position around avatar
          y: -20 - Math.random() * 20, // Start just above the avatar
        };
        setMeows(prev => [...prev, newMeow]);
      }, 5000 + Math.random() * 2000); // every 5-7 seconds
    }

    // Cleanup function: clears the interval if it exists.
    // This runs when the component unmounts or when `isOpen` changes.
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isOpen]); // Re-run this effect whenever the chat's open state changes.


  const handleAnimationEnd = (id: number) => {
    setMeows(prev => prev.filter(meow => meow.id !== id));
  };


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragRef.current) {
        didMove.current = true;
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        
        let newX = initialPos.current.x - dx;
        let newY = initialPos.current.y - dy;

        // Prevent dragging off-screen
        const rect = dragRef.current.getBoundingClientRect();
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX > window.innerWidth - rect.width) newX = window.innerWidth - rect.width;
        if (newY > window.innerHeight - rect.height) newY = window.innerHeight - rect.height;

        setPosition({ x: newX, y: newY });
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
    initialPos.current = { x: position.x, y: position.y };
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
        <div className="relative">
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
          {meows.map(meow => (
            <span
              key={meow.id}
              className="absolute text-lg font-bold text-primary pointer-events-none whitespace-nowrap animate-meow-float bg-background rounded-xl px-3 py-1 shadow-lg"
              style={{
                left: `calc(50% + ${meow.x}px)`,
                top: `calc(50% + ${meow.y}px)`,
                transform: 'translate(-50%, -50%)',
                textShadow: '0 1px 1px hsl(var(--background) / 0.5)',
              }}
              onAnimationEnd={() => handleAnimationEnd(meow.id)}
            >
              {meow.word}
            </span>
          ))}
        </div>
      </div>
      <ChatPanel
        isOpen={isOpen}
        onClose={closeChat}
        currentUser={user}
      />
    </>
  );
}

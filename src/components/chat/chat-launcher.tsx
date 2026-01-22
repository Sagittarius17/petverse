
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, MessagesSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/lib/chat-store';
import { Badge } from '../ui/badge';

interface ChatLauncherProps {
  unreadMessages: number;
  unreadChats: number;
}

export default function ChatLauncher({ unreadMessages, unreadChats }: ChatLauncherProps) {
  const { toggleChat } = useChatStore();
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
    toggleChat();
  };

  return (
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
          size="icon"
          className="rounded-full w-16 h-16 bg-gray-800 hover:bg-gray-700 text-white shadow-lg cursor-grab active:cursor-grabbing"
          onClick={handleClick}
          onMouseDown={handleMouseDown}
        >
          <MessageSquare className="h-8 w-8 pointer-events-none" />
        </Button>
        {unreadMessages > 0 && (
          <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center rounded-full bg-green-600 text-white p-0">
            {unreadMessages}
          </Badge>
        )}
        {unreadChats > 0 && (
           <Badge className="absolute -bottom-1 -right-2 h-7 w-7 flex items-center justify-center rounded-full bg-gray-600 text-white p-0 border-2 border-background">
             <MessagesSquare className="h-3 w-3 mr-0.5" /> {unreadChats}
          </Badge>
        )}
      </div>
    </div>
  );
}

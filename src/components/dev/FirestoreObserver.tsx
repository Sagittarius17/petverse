'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDevStore } from '@/lib/dev-store';
import { RefreshCw, Database, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function FirestoreObserver() {
  // Get all counts from the store
  const { reads, writes, totalReads, totalWrites, resetCounts } = useDevStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Position state, initialized in useEffect to avoid SSR window issues
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isClient, setIsClient] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    // Start at bottom-right corner
    setPosition({ 
      top: window.innerHeight - 200, // Adjusted for slightly larger default height
      left: window.innerWidth - 272 
    });
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only allow left-click drags
    
    setIsDragging(true);
    const cardRect = cardRef.current!.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - cardRect.left,
      y: e.clientY - cardRect.top,
    };
    e.currentTarget.style.cursor = 'grabbing';
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;

      let newTop = e.clientY - dragOffset.current.y;
      let newLeft = e.clientX - dragOffset.current.x;

      // Prevent dragging off-screen
      const cardWidth = cardRef.current?.offsetWidth || 256;
      const cardHeight = cardRef.current?.offsetHeight || 124;
      
      newTop = Math.max(0, Math.min(newTop, window.innerHeight - cardHeight));
      newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - cardWidth));
      
      setPosition({ top: newTop, left: newLeft });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      if(cardRef.current) {
        const header = cardRef.current.querySelector('[data-drag-handle]');
        if (header) (header as HTMLElement).style.cursor = 'grab';
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  const toggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger drag
    setIsCollapsed(prev => !prev);
  }

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger drag
    resetCounts();
  }
  
  if (!isClient) return null;

  return (
    <div
      ref={cardRef}
      className="fixed z-[200] w-64 shadow-2xl"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <Card>
        <CardHeader 
          data-drag-handle
          onPointerDown={handlePointerDown}
          className={cn(
            "flex flex-row items-center justify-between space-y-0 p-3 cursor-grab active:cursor-grabbing",
            !isCollapsed && "border-b"
          )}
        >
          {isCollapsed ? (
            <div className="text-sm font-medium">
              R: <span className="font-bold font-mono">{reads}/{totalReads}</span> | W: <span className="font-bold font-mono">{writes}/{totalWrites}</span>
            </div>
          ) : (
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Firestore Activity
            </CardTitle>
          )}

          <div className='flex items-center'>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleCollapse}>
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Collapse</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReset}>
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Reset session counts</span>
            </Button>
          </div>
        </CardHeader>
        
        {!isCollapsed && (
          <CardContent className="p-3 text-sm space-y-2">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Session Reads:</span>
                <span className="font-bold font-mono">{reads}</span>
              </div>
               <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground/70">Total Reads:</span>
                <span className="font-mono text-muted-foreground/80">{totalReads}</span>
              </div>
            </div>
            <Separator />
             <div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Session Writes:</span>
                <span className="font-bold font-mono">{writes}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground/70">Total Writes:</span>
                <span className="font-mono text-muted-foreground/80">{totalWrites}</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

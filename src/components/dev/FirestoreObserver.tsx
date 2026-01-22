'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDevStore } from '@/lib/dev-store';
import {
  RefreshCw,
  Database,
  ChevronsUpDown,
  PanelLeft,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function FirestoreObserver() {
  const { reads, writes, totalReads, totalWrites, resetCounts } = useDevStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isClient, setIsClient] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // New states for docking
  const [isDocked, setIsDocked] = useState(false);
  const [dockedSide, setDockedSide] = useState<'top' | 'right' | 'bottom' | 'left'>('right');
  const [lastPosition, setLastPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setIsClient(true);
    const initialTop = window.innerHeight - 200;
    const initialLeft = window.innerWidth - 272;
    setPosition({ top: initialTop, left: initialLeft });
    setLastPosition({ top: initialTop, left: initialLeft });
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || isDocked) return;
    setIsDragging(true);
    const cardRect = cardRef.current!.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - cardRect.left,
      y: e.clientY - cardRect.top,
    };
    const header = e.currentTarget;
    header.style.cursor = 'grabbing';
    document.body.classList.add('select-none');
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      let newTop = e.clientY - dragOffset.current.y;
      let newLeft = e.clientX - dragOffset.current.x;
      const cardWidth = cardRef.current?.offsetWidth || 256;
      const cardHeight = cardRef.current?.offsetHeight || 124;
      newTop = Math.max(0, Math.min(newTop, window.innerHeight - cardHeight));
      newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - cardWidth));
      setPosition({ top: newTop, left: newLeft });
    };

    const handlePointerUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      const header = cardRef.current?.querySelector('[data-drag-handle]');
      if (header) (header as HTMLElement).style.cursor = 'grab';
      document.body.classList.remove('select-none');
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.body.classList.remove('select-none');
    };
  }, [isDragging]);

  const toggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCollapsed(prev => !prev);
  }

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    resetCounts();
  }

  const handleDock = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cardRef.current) return;
    
    setLastPosition(position); // Save current position

    const rect = cardRef.current.getBoundingClientRect();
    const distances = {
        top: position.top,
        left: position.left,
        bottom: window.innerHeight - (position.top + rect.height),
        right: window.innerWidth - (position.left + rect.width),
    };
    
    const nearestSide = Object.keys(distances).reduce((a, b) => distances[a] < distances[b] ? a : b) as 'top' | 'right' | 'bottom' | 'left';
    
    setDockedSide(nearestSide);
    setIsDocked(true);
  };
  
  const handleUndock = () => {
    setIsDocked(false);
    const cardWidth = 256; // w-64
    const cardHeight = cardRef.current?.offsetHeight || 150;
    const restoredTop = Math.max(0, Math.min(lastPosition.top, window.innerHeight - cardHeight));
    const restoredLeft = Math.max(0, Math.min(lastPosition.left, window.innerWidth - cardWidth));
    setPosition({ top: restoredTop, left: restoredLeft });
  };
  
  const getDockedHandleIcon = () => {
    switch (dockedSide) {
      case 'left': return <ArrowRight />;
      case 'right': return <ArrowLeft />;
      case 'top': return <ArrowDown />;
      case 'bottom': return <ArrowUp />;
      default: return <ArrowLeft />;
    }
  };
  
  if (!isClient) return null;

  return (
    <>
      <div
        ref={cardRef}
        className={cn(
          "fixed z-[200] w-64 shadow-2xl transition-all duration-300 ease-in-out",
          isDragging && "transition-none",
          isDocked && "opacity-0 pointer-events-none"
        )}
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
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDock}>
                <PanelLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReset}>
                <RefreshCw className="h-4 w-4" />
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

      <button
        onClick={handleUndock}
        className={cn(
          "fixed z-[200] flex items-center justify-center gap-2 rounded-md bg-card p-2 text-card-foreground shadow-lg transition-opacity duration-300 ease-in-out hover:bg-muted cursor-pointer",
          !isDocked && "opacity-0 pointer-events-none",
          dockedSide === 'right' && "top-1/2 -translate-y-1/2 right-0 rounded-r-none border-y border-l",
          dockedSide === 'left' && "top-1/2 -translate-y-1/2 left-0 rounded-l-none border-y border-r",
          dockedSide === 'top' && "left-1/2 -translate-x-1/2 top-0 rounded-t-none border-x border-b",
          dockedSide === 'bottom' && "left-1/2 -translate-x-1/2 bottom-0 rounded-b-none border-x border-t",
          (dockedSide === 'left' || dockedSide === 'right') && 'flex-col py-4 h-28',
          (dockedSide === 'top' || dockedSide === 'bottom') && 'flex-row px-4 w-48'
        )}
      >
        {getDockedHandleIcon()}
        <div className={cn("font-mono text-xs font-semibold", (dockedSide === 'left' || dockedSide === 'right') && "[writing-mode:vertical-rl]")}>
           R:{reads} | W:{writes}
        </div>
      </button>
    </>
  );
}

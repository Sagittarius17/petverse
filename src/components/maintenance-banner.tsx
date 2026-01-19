
'use client';

import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
import { differenceInSeconds, formatDuration, intervalToDuration } from 'date-fns';

interface MaintenanceBannerProps {
  startTime: string;
  message: string;
}

export default function MaintenanceBanner({ startTime, message }: MaintenanceBannerProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(startTime);
      const secondsLeft = differenceInSeconds(end, now);

      if (secondsLeft <= 0) {
        setTimeLeft('starting now...');
        clearInterval(interval);
        return;
      }

      const duration = intervalToDuration({ start: 0, end: secondsLeft * 1000 });
      setTimeLeft(formatDuration(duration, {
        format: ['hours', 'minutes', 'seconds'],
        zero: false,
        delimiter: ', '
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="bg-destructive text-destructive-foreground py-2 text-sm text-center font-medium animate-in fade-in">
      <div className="container mx-auto flex items-center justify-center gap-2">
        <Timer className="h-4 w-4" />
        <p>{message} Maintenance will begin in: {timeLeft}</p>
      </div>
    </div>
  );
}

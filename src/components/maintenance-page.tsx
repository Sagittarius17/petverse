
'use client';

import { useState, useEffect } from 'react';
import { PawPrint, Cat, Dog, Bird, Timer } from 'lucide-react';
import { differenceInSeconds, formatDuration, intervalToDuration } from 'date-fns';

interface MaintenancePageProps {
  message?: string;
  maintenanceEndTime?: string | null;
}

function Countdown({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(endTime);
      const secondsLeft = differenceInSeconds(end, now);

      if (secondsLeft <= 0) {
        setTimeLeft('Refreshing now...');
        clearInterval(interval);
        // The main-layout component will handle turning off maintenance mode
        return;
      }

      const duration = intervalToDuration({ start: 0, end: secondsLeft * 1000 });
      setTimeLeft(formatDuration(duration, {
        format: ['hours', 'minutes', 'seconds'],
        zero: false
      }));

    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  if (!timeLeft) {
    return null;
  }

  return (
    <p className="mt-6 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary flex items-center gap-2">
      <Timer className="h-4 w-4" />
      <span>Automatically back in: {timeLeft}</span>
    </p>
  );
}

export default function MaintenancePage({ message, maintenanceEndTime }: MaintenancePageProps) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-secondary/50 p-4 text-center">
      <div className="flex items-center gap-4 text-primary">
          <Dog className="h-16 w-16 animate-bounce [animation-delay:-0.3s]" />
          <Cat className="h-20 w-20 animate-bounce [animation-delay:-0.1s]" />
          <Bird className="h-16 w-16 animate-bounce" />
      </div>
      <PawPrint className="my-8 h-12 w-12 text-primary" />
      <h1 className="text-4xl font-bold font-headline text-foreground">
        We'll be right back!
      </h1>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        {message || "Our team is currently performing some essential maintenance to make PetVerse even better for you and our furry friends."}
      </p>
      {maintenanceEndTime && (
        <Countdown endTime={maintenanceEndTime} />
      )}
    </div>
  );
}

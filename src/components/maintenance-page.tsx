
'use client';

import { PawPrint, Cat, Dog, Bird } from 'lucide-react';

interface MaintenancePageProps {
  estimatedTime?: string;
}

export default function MaintenancePage({ estimatedTime }: MaintenancePageProps) {
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
        Our team is currently performing some essential maintenance to make PetVerse even better for you and our furry friends.
      </p>
      {estimatedTime && (
         <p className="mt-6 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary-foreground">
            We expect to be back in {estimatedTime}.
        </p>
      )}
    </div>
  );
}

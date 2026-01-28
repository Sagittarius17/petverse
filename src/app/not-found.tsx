
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PawPrint, Map, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center bg-background p-4 text-center">
      <div className="relative mb-8">
        <Map className="h-48 w-48 text-muted-foreground/20" />
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
                 <PawPrint className="h-12 w-12 text-muted-foreground" />
            </div>
        </div>
      </div>
      <h1 className="text-6xl font-bold font-headline text-primary">404</h1>
      <h2 className="mt-4 text-3xl font-bold font-headline text-foreground">
        Page Not Found
      </h2>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        Uh-oh! It looks like this page has gone for a walk. Let's get you back on track.
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild size="lg">
          <Link href="/">Return to Homepage</Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
            <Link href="/adopt">
                <Search className="mr-2 h-5 w-5" />
                Find a Pet
            </Link>
        </Button>
      </div>
    </div>
  );
}

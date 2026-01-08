
'use client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Pet } from '@/lib/data';
import AdoptionList from '@/components/adoption-list';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdoptPage() {
  const firestore = useFirestore();

  const petsCollection = useMemoFirebase(
    () => collection(firestore, 'pets'),
    [firestore]
  );
  
  const petsQuery = useMemoFirebase(
    () => petsCollection ? query(petsCollection, orderBy('name')) : null,
    [petsCollection]
  );

  const { data: pets, isLoading, error } = useCollection<Pet>(petsQuery);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Find Your New Best Friend</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Browse our listings of lovable pets waiting for a forever home.
        </p>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({length: 8}).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ))}
        </div>
      ) : error ? (
        <div className="text-center text-destructive">
            <p>Error loading pets: {error.message}</p>
        </div>
      ) : (
        <AdoptionList allPets={pets || []} />
      )}
    </div>
  );
}

    
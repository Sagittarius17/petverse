'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Pet } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Eye, AtSign } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, DocumentData } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';

interface PetCardProps {
  pet: Pet;
  onPetSelect?: (pet: Pet) => void;
  actions?: React.ReactNode;
}

interface UserProfile extends DocumentData {
    username?: string;
}

function PetOwnerUsername({ userId }: { userId: string }) {
    const firestore = useFirestore();
    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !userId) return null;
        return doc(firestore, 'users', userId);
    }, [firestore, userId]);
    
    const { data: userProfile, isLoading } = useDoc<UserProfile>(userDocRef);

    if (isLoading) {
        return (
            <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                <Skeleton className="h-3 w-12" />
            </div>
        );
    }

    if (!userProfile?.username) {
        return null;
    }
    
    return (
        <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
            <AtSign className="h-3 w-3" />
            <span>{userProfile.username}</span>
        </div>
    );
}


export default function PetCard({ pet, onPetSelect, actions }: PetCardProps) {
  const image = PlaceHolderImages.find(p => p.id === pet.imageId);
  
  return (
    <Card 
      className="flex flex-col overflow-hidden transition-all hover:shadow-lg group"
    >
        <CardHeader className="relative h-48 w-full p-0">
          <div 
            className="cursor-pointer h-full w-full"
            onClick={() => onPetSelect?.(pet)}
          >
            {image && (
              <Image
                src={image.imageUrl}
                alt={pet.name}
                fill
                style={{ objectFit: 'cover' }}
                data-ai-hint={image.imageHint}
                className="transition-transform duration-300 group-hover:scale-105"
              />
            )}
          </div>
          {pet.userId && <PetOwnerUsername userId={pet.userId} />}
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
            <Eye className="h-3 w-3" />
            <span>{pet.viewCount || 0}</span>
          </div>
        </CardHeader>
        <CardContent 
            className="flex-grow p-4 cursor-pointer"
            onClick={() => onPetSelect?.(pet)}
        >
          <CardTitle className="mb-2 text-xl font-headline group-hover:underline">
            {pet.name}
          </CardTitle>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{pet.breed}</Badge>
            <Badge variant="secondary">{pet.age}</Badge>
            <Badge variant="secondary">{pet.gender}</Badge>
          </div>
          <p className="mt-3 text-sm line-clamp-2">{pet.description}</p>
        </CardContent>
      <CardFooter className="p-4 pt-0">
        {actions ? (
          <div className="w-full">{actions}</div>
        ) : (
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => onPetSelect?.(pet)} disabled={!onPetSelect}>
            Meet {pet.name}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

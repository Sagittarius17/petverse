'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Pet, UserProfile } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Eye, AtSign, MapPin } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface PetCardProps {
  pet: Pet;
  onPetSelect?: (pet: Pet) => void;
  actions?: React.ReactNode;
  owner?: UserProfile;
}

export default function PetCard({ pet, onPetSelect, actions, owner }: PetCardProps) {
    const image = useMemo(() => {
        if (pet.imageId?.startsWith('data:image')) {
            return {
                imageUrl: pet.imageId,
                description: pet.name,
                imageHint: pet.breed.toLowerCase(),
            };
        }
        return PlaceHolderImages.find(p => p.id === pet.imageId);
    }, [pet.imageId, pet.name, pet.breed]);

  const isAvailable = pet.isAdoptable !== false;

  const adoptionStatusText = () => {
    if (isAvailable) return 'Available';
    if (pet.adoptedAt) {
      return `Adopted ${formatDistanceToNow(pet.adoptedAt.toDate(), { addSuffix: true })}`;
    }
    return 'Adopted';
  }
  
  return (
    <Card 
      className="flex flex-col overflow-hidden transition-all hover:shadow-lg group"
    >
      <div 
        className="flex-grow cursor-pointer"
        onClick={() => onPetSelect?.(pet)}
      >
        <CardHeader className="relative h-48 w-full p-0">
          <div className="h-full w-full">
            {image ? (
              <Image
                src={image.imageUrl}
                alt={pet.name}
                fill
                style={{ objectFit: 'cover' }}
                data-ai-hint={image.imageHint}
                className="transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
                <div className="h-full w-full bg-secondary flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">No Image</p>
                </div>
            )}
          </div>
          {owner?.username && (
            <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                <AtSign className="h-3 w-3" />
                <span className="font-semibold">{owner.username}</span>
            </div>
          )}
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
            <Eye className="h-3 w-3" />
            <span className="font-semibold">{pet.viewCount || 0}</span>
          </div>
        </CardHeader>
        <CardContent 
            className="flex-grow p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-xl font-headline group-hover:underline">
              {pet.name}
            </CardTitle>
             <Badge className={cn(!isAvailable ? "bg-success text-success-foreground hover:bg-success/90" : "bg-secondary text-secondary-foreground", "whitespace-nowrap")}>
                {adoptionStatusText()}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {pet.location && (
                <Badge variant="outline" className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" />
                    {pet.location}
                </Badge>
            )}
            <Badge variant="secondary">{pet.breed}</Badge>
            <Badge variant="secondary">{pet.age}</Badge>
            <Badge variant="secondary">{pet.gender}</Badge>
          </div>
          <p className="mt-3 text-sm line-clamp-2">{pet.description}</p>
        </CardContent>
      </div>
      <CardFooter 
        className="p-4 pt-0"
        onClick={(e) => {if(actions) { e.stopPropagation() }}}
      >
        {actions ? (
          <div className="w-full">{actions}</div>
        ) : (
          <Button className="w-full" onClick={() => onPetSelect?.(pet)} disabled={!onPetSelect || !isAvailable}>
            {isAvailable ? `Meet ${pet.name}` : 'Already Adopted'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

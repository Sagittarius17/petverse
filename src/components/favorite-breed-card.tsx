'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { PetBreed } from '@/lib/data';

interface FavoriteBreedCardProps {
  breed: PetBreed;
  onSelect: (breed: PetBreed) => void;
}

const FavoriteBreedCard = React.memo(function FavoriteBreedCard({ breed, onSelect }: FavoriteBreedCardProps) {
  const imageId = breed.imageIds && breed.imageIds.length > 0 ? breed.imageIds[0] : 'dog-1';
  const image = PlaceHolderImages.find((p) => p.id === imageId) ||
    { imageUrl: (imageId.startsWith('data:') || imageId.startsWith('http')) ? imageId : '', imageHint: breed.name };

  return (
    <Card
      className="flex flex-col overflow-hidden transition-all hover:shadow-lg cursor-pointer h-full"
      onClick={() => onSelect(breed)}
    >
      <CardHeader className="relative h-48 w-full p-0">
        {image.imageUrl ? (
          <Image
            src={image.imageUrl}
            alt={breed.name}
            fill
            style={{ objectFit: 'cover' }}
            data-ai-hint={image.imageHint}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary">
            <p className="text-xs text-muted-foreground">No Image</p>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-headline mb-2">{breed.name}</CardTitle>
        <CardDescription className="text-sm line-clamp-3">{breed.description}</CardDescription>
      </CardContent>
    </Card>
  );
});

export default FavoriteBreedCard;

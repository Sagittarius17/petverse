'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Pet } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Eye, Heart } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PetCardProps {
  pet: Pet;
  onPetSelect?: (pet: Pet) => void;
  actions?: React.ReactNode;
}

export default function PetCard({ pet, onPetSelect, actions }: PetCardProps) {
  const image = PlaceHolderImages.find(p => p.id === pet.imageId);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const favoritesCollectionRef = useMemoFirebase(
    () => (user && firestore ? collection(firestore, `users/${user.uid}/favorites`) : null),
    [user, firestore]
  );
  
  const { data: favorites } = useCollection(favoritesCollectionRef);

  const isFavorited = useMemo(() => favorites?.some(fav => fav.id === pet.id), [favorites, pet.id]);

  const handleFavoriteToggle = () => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Please log in',
        description: 'You need to be logged in to favorite a pet.',
      });
      return;
    }
    
    const favoriteDocRef = doc(firestore, `users/${user.uid}/favorites`, pet.id);

    if (isFavorited) {
      deleteDocumentNonBlocking(favoriteDocRef);
      toast({
        title: 'Removed from Favorites',
        description: `${pet.name} has been removed from your favorites.`,
      });
    } else {
      setDocumentNonBlocking(favoriteDocRef, { petId: pet.id });
      toast({
        title: 'Added to Favorites',
        description: `${pet.name} has been added to your favorites!`,
      });
    }
  };

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
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
            <Eye className="h-3 w-3" />
            <span>{pet.viewCount || 0}</span>
          </div>
          {user && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 left-2 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/75 hover:text-white"
              onClick={handleFavoriteToggle}
            >
              <Heart className={cn("h-5 w-5 transition-colors", isFavorited ? "fill-red-500 text-red-500" : "text-white")} />
            </Button>
          )}
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

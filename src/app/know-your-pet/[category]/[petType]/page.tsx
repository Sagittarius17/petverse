'use client';

import { useState, useMemo, useEffect, use } from 'react';
import Image from 'next/image';
import { getSpeciesData } from './actions';
import { PetBreed, PetCategory, PetSpecies } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PetInfoDialog from '@/components/pet-info-dialog';
import { useRouter } from 'next/navigation';
import BreedSearch from '@/components/ai/breed-search';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PawPrint, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


interface BreedCardProps {
  breed: PetBreed;
  onSelect: (breed: PetBreed) => void;
  speciesName: string;
  speciesImageId: string;
}

function BreedCard({ breed, onSelect, speciesName, speciesImageId }: BreedCardProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const breedId = `${speciesName.toLowerCase().replace(/ /g, '-')}-${breed.name.replace(/ /g, '-').toLowerCase()}`;

  const favoriteBreedsCollectionRef = useMemoFirebase(
    () => (user && firestore ? collection(firestore, `users/${user.uid}/favoriteBreeds`) : null),
    [user, firestore]
  );
  
  const { data: favorites } = useCollection(favoriteBreedsCollectionRef);

  const isFavorited = useMemo(() => favorites?.some(fav => fav.id === breedId), [favorites, breedId]);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from firing
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Please log in',
        description: 'You need to be logged in to favorite a breed.',
      });
      return;
    }
    
    const favoriteDocRef = doc(firestore, `users/${user.uid}/favoriteBreeds`, breedId);

    if (isFavorited) {
      deleteDocumentNonBlocking(favoriteDocRef);
      toast({
        title: 'Removed from Favorites',
        description: `${breed.name} has been removed from your favorite breeds.`,
      });
    } else {
      setDocumentNonBlocking(favoriteDocRef, { breedId: breedId }, { merge: true });
      toast({
        title: 'Added to Favorites',
        description: `${breed.name} has been added to your favorite breeds!`,
      });
    }
  };
  
  const imageId = breed.imageIds && breed.imageIds.length > 0 ? breed.imageIds[0] : speciesImageId;
  const image = PlaceHolderImages.find((p) => p.id === imageId) || PlaceHolderImages.find(p => p.id === speciesImageId) || { imageUrl: imageId.startsWith('data:') ? imageId : '', imageHint: breed.name };


  return (
    <Card
      className="flex flex-col overflow-hidden transition-all hover:shadow-lg cursor-pointer group"
      onClick={() => onSelect(breed)}
    >
      <CardHeader className="relative h-40 w-full p-0">
         {image.imageUrl ? (
          <Image
            src={image.imageUrl}
            alt={breed.name}
            fill
            style={{ objectFit: 'cover' }}
            data-ai-hint={image.imageHint}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary">
              <p className="text-xs text-muted-foreground">No Image</p>
          </div>
        )}
        {user && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/75 hover:text-white"
            onClick={handleFavoriteToggle}
          >
            <Heart className={cn("h-5 w-5 transition-colors", isFavorited ? "fill-red-500 text-red-500" : "text-white")} />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-headline mb-2 group-hover:underline">{breed.name}</CardTitle>
        <CardDescription className="text-sm line-clamp-3">{breed.description}</CardDescription>
      </CardContent>
    </Card>
  );
}


interface PetSpeciesPageProps {
  params: Promise<{
    category: string;
    petType: string;
  }>;
}

export default function PetSpeciesPage({ params }: PetSpeciesPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [selectedPet, setSelectedPet] = useState<PetBreed | null>(null);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [currentSpecies, setCurrentSpecies] = useState<PetSpecies | null>(null);
  const [allBreeds, setAllBreeds] = useState<PetBreed[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryName = useMemo(() => decodeURIComponent(resolvedParams.category), [resolvedParams.category]);
  const petTypeName = useMemo(() => decodeURIComponent(resolvedParams.petType), [resolvedParams.petType]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const speciesData = await getSpeciesData(categoryName, petTypeName);
        
        if (speciesData) {
          setCurrentSpecies(speciesData);
          setAllBreeds(speciesData.breeds || []);
        } else {
          setCurrentSpecies(null);
          setAllBreeds([]);
        }
      } catch (error) {
        console.error("Error fetching pet data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryName, petTypeName]);

  const handleBreedFound = (newBreed: PetBreed) => {
    setAllBreeds(prevBreeds => {
        if (prevBreeds.some(b => b.name.toLowerCase() === newBreed.name.toLowerCase())) {
            return prevBreeds;
        }
        return [newBreed, ...prevBreeds];
    });
    setSelectedPet(newBreed);
    setLocalSearchTerm('');
  };


  const filteredBreeds = useMemo(() => {
    if (!localSearchTerm) return allBreeds;
    return allBreeds.filter((breed) =>
      breed.name.toLowerCase().includes(localSearchTerm.toLowerCase())
    );
  }, [allBreeds, localSearchTerm]);

  if (!loading && !currentSpecies) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Not Found</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          The requested pet type &quot;{petTypeName}&quot; in category &quot;{categoryName}&quot; does not exist.
        </p>
        <button
          onClick={() => router.push('/know-your-pet')}
          className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-lg"
        >
          Go back to Know Your Pet
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 relative">
        {loading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
                <div className="relative flex h-24 w-24 items-center justify-center">
                    <div className="absolute h-full w-full animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <PawPrint className="h-10 w-10 text-primary" />
                </div>
            </div>
        )}
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-headline tracking-tight">{currentSpecies?.name} Breeds</h1>
          <p className="mt-2 text-lg text-muted-foreground">Explore different breeds of {currentSpecies?.name}.</p>
        </div>

        <div className="mb-8 max-w-2xl mx-auto">
          <BreedSearch 
            speciesName={currentSpecies?.name || ''} 
            categoryName={categoryName}
            onBreedFound={handleBreedFound} 
            searchTerm={localSearchTerm}
            setSearchTerm={setLocalSearchTerm}
            placeholder={`Search or type a new ${currentSpecies?.name.toLowerCase()} breed for AI to find...`}
            existingBreeds={allBreeds}
          />
        </div>

        <section>
          {filteredBreeds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBreeds.map((breed) => (
                  <BreedCard 
                    key={breed.name} 
                    breed={breed} 
                    onSelect={setSelectedPet}
                    speciesName={currentSpecies?.name || ''} 
                    speciesImageId={currentSpecies?.imageId || ''}
                  />
              ))}
            </div>
          ) : (
            !loading && <div className="text-center py-16 text-muted-foreground">
                <p>No breeds found matching &quot;{localSearchTerm}&quot;.</p>
                <p className="text-sm mt-2">If you type a new breed name, our AI will try to discover it for you!</p>
            </div>
          )}
        </section>
      </div>

      <PetInfoDialog pet={selectedPet} isOpen={!!selectedPet} onClose={() => setSelectedPet(null)} />
    </>
  );
}

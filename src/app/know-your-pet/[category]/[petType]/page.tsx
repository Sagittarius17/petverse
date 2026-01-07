'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { getPetCategories } from './actions';
import { PetBreed, PetCategory } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PetInfoDialog from '@/components/pet-info-dialog';
import { useRouter } from 'next/navigation';
import BreedSearch from '@/components/ai/breed-search';
import { initialPetCategories } from '@/lib/initial-pet-data';

interface PetSpeciesPageProps {
  params: {
    category: string;
    petType: string;
  };
}

export default function PetSpeciesPage({ params }: PetSpeciesPageProps) {
  const router = useRouter();
  const [selectedPet, setSelectedPet] = useState<PetBreed | null>(null);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [allBreeds, setAllBreeds] = useState<PetBreed[]>([]);
  const [loadingBreeds, setLoadingBreeds] = useState(true);

  const categoryName = useMemo(() => decodeURIComponent(params.category), [params.category]);
  const petTypeName = useMemo(() => decodeURIComponent(params.petType), [params.petType]);

  useEffect(() => {
    const fetchBreeds = async () => {
      setLoadingBreeds(true);
      const allPetData: PetCategory[] = await getPetCategories();

      const currentCategory = allPetData.find(
        (cat) => cat.category.toLowerCase() === categoryName.toLowerCase()
      );

      const currentPetType = currentCategory?.species.find(
        (s) => s.name.toLowerCase() === petTypeName.toLowerCase()
      );

      if (currentPetType?.breeds) {
        setAllBreeds(currentPetType.breeds);
      } else {
        setAllBreeds([]);
      }
      setLoadingBreeds(false);
    };

    fetchBreeds();
  }, [categoryName, petTypeName]);

  const currentCategoryResolved = initialPetCategories.find(
    (cat) => cat.category.toLowerCase() === categoryName.toLowerCase()
  );
  const currentPetTypeResolved = currentCategoryResolved?.species.find(
    (s) => s.name.toLowerCase() === petTypeName.toLowerCase()
  );

  const handleBreedFound = (newBreed: PetBreed) => {
    setAllBreeds(prevBreeds => [newBreed, ...prevBreeds]);
    setSelectedPet(newBreed);
    setLocalSearchTerm('');
  };

  const filteredBreeds = useMemo(() => {
    if (!localSearchTerm) return allBreeds;
    return allBreeds.filter((breed) =>
      breed.name.toLowerCase().includes(localSearchTerm.toLowerCase())
    );
  }, [allBreeds, localSearchTerm]);

  if (loadingBreeds) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Loading Breeds...</h1>
        <p className="mt-2 text-lg text-muted-foreground">Please wait while we fetch the amazing {petTypeName} breeds.</p>
      </div>
    );
  }

  if (!currentCategoryResolved || !currentPetTypeResolved) {
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-headline tracking-tight">{currentPetTypeResolved.name} Breeds</h1>
          <p className="mt-2 text-lg text-muted-foreground">Explore different breeds of {currentPetTypeResolved.name}.</p>
        </div>

        <div className="mb-8 max-w-2xl mx-auto">
          <BreedSearch 
            speciesName={currentPetTypeResolved.name} 
            onBreedFound={handleBreedFound} 
            searchTerm={localSearchTerm}
            setSearchTerm={setLocalSearchTerm}
            placeholder={`Search for a ${currentPetTypeResolved.name} breed (e.g., "Siberian Husky")`}
          />
        </div>

        <section>
          {filteredBreeds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBreeds.map((breed) => {
                const image = PlaceHolderImages.find((p) => p.id === breed.imageId);
                return (
                  <Card
                    key={breed.name}
                    className="flex flex-col overflow-hidden transition-all hover:shadow-lg cursor-pointer"
                    onClick={() => setSelectedPet(breed)}
                  >
                    <CardHeader className="relative h-40 w-full p-0">
                      {image && (
                        <Image
                          src={image.imageUrl}
                          alt={image.description}
                          fill
                          style={{ objectFit: 'cover' }}
                          data-ai-hint={image.imageHint}
                        />
                      )}
                    </CardHeader>
                    <CardContent className="p-4 flex-grow">
                      <CardTitle className="text-xl font-headline mb-2">{breed.name}</CardTitle>
                      <CardDescription className="text-sm">{breed.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
                <p>No breeds found matching &quot;{localSearchTerm}&quot;.</p>
                <p className="text-sm mt-2">Try a different search term or use the AI search above to find and add it to our database.</p>
            </div>
          )}
        </section>
      </div>

      <PetInfoDialog pet={selectedPet} isOpen={!!selectedPet} onClose={() => setSelectedPet(null)} />
    </>
  );
}

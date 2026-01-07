
'use client';

import { useState, useMemo, useEffect, use } from 'react';
import Image from 'next/image';
import { getPetCategories } from './actions';
import { PetBreed, PetCategory, PetSpecies } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PetInfoDialog from '@/components/pet-info-dialog';
import { useRouter } from 'next/navigation';
import BreedSearch from '@/components/ai/breed-search';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
  const [allBreeds, setAllBreeds] = useState<PetBreed[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<PetCategory | null>(null);
  const [currentPetType, setCurrentPetType] = useState<PetSpecies | null>(null);

  const categoryName = useMemo(() => decodeURIComponent(resolvedParams.category), [resolvedParams.category]);
  const petTypeName = useMemo(() => decodeURIComponent(resolvedParams.petType), [resolvedParams.petType]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const allPetData: PetCategory[] = await getPetCategories();
        
        const category = allPetData.find(
          (cat) => cat.category.toLowerCase() === categoryName.toLowerCase()
        );
        
        const petType = category?.species.find(
          (s) => s.name.toLowerCase() === petTypeName.toLowerCase()
        );

        if (category && petType) {
          setCurrentCategory(category);
          setCurrentPetType(petType);
          setAllBreeds(petType.breeds || []);
        } else {
          setCurrentCategory(null);
          setCurrentPetType(null);
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
        // Prevent adding duplicates if the breed somehow already exists
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Loading...</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Please wait while we fetch the details for {petTypeName} in {categoryName}.
        </p>
      </div>
    );
  }

  if (!currentCategory || !currentPetType) {
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
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-headline tracking-tight">{currentPetType.name} Breeds</h1>
          <p className="mt-2 text-lg text-muted-foreground">Explore different breeds of {currentPetType.name}.</p>
        </div>

        <div className="mb-8 max-w-2xl mx-auto">
          <BreedSearch 
            speciesName={currentPetType.name} 
            categoryName={currentCategory.category}
            onBreedFound={handleBreedFound} 
            searchTerm={localSearchTerm}
            setSearchTerm={setLocalSearchTerm}
            placeholder={`Search for a ${currentPetType.name} breed (e.g., "Siberian Husky")`}
          />
        </div>

        <section>
          {filteredBreeds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBreeds.map((breed) => {
                const imageId = breed.imageIds && breed.imageIds.length > 0 ? breed.imageIds[0] : 'dog-1';
                const image = PlaceHolderImages.find((p) => p.id === imageId);
                return (
                  <Card
                    key={breed.name}
                    className="flex flex-col overflow-hidden transition-all hover:shadow-lg cursor-pointer"
                    onClick={() => setSelectedPet(breed)}
                  >
                    <CardHeader className="relative h-40 w-full p-0">
                      {image ? (
                        <Image
                          src={image.imageUrl}
                          alt={image.description}
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

'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
// Importing getPetCategories which now integrates static and Firestore data
import { getPetCategories, PetBreed, PetCategory, PetSpecies } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PetInfoDialog from '@/components/pet-info-dialog';
import { useRouter } from 'next/navigation';
// Removed direct import of Input, as it will be integrated into BreedSearch
// import { Input } from '@/components/ui/input';
import BreedSearch from '@/components/ai/breed-search'; // Import the new component
import { useEffect } from 'react';

// Define props for the page component
interface PetSpeciesPageProps {
  params: {
    category: string;
    petType: string;
  };
}

export default function PetSpeciesPage({ params }: PetSpeciesPageProps) {
  const router = useRouter();
  const [selectedPet, setSelectedPet] = useState<PetBreed | null>(null);
  const [localSearchTerm, setLocalSearchTerm] = useState(''); // New state for local filtering search term
  const [allBreeds, setAllBreeds] = useState<PetBreed[]>([]); // State to hold all breeds (static + AI-added)
  const [loadingBreeds, setLoadingBreeds] = useState(true); // Loading state for initial breed fetch

  const { category: categoryName, petType: petTypeName } = params;

  // Function to fetch all breeds (static + Firestore)
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

  useEffect(() => {
    fetchBreeds();
  }, [categoryName, petTypeName]); // Re-fetch if category or petType changes

  // Resolve category and petType directly from the fetched allBreeds (or a consolidated structure)
  // This is a simplified approach, a more robust solution might consolidate `petCategories` on the server
  // and pass it down as a prop, or fetch the specific petType directly.
  const currentCategoryResolved = petCategories.find( // Use initialPetCategories structure for resolution
    (cat) => cat.category.toLowerCase() === categoryName.toLowerCase()
  );
  const currentPetTypeResolved = currentCategoryResolved?.species.find(
    (s) => s.name.toLowerCase() === petTypeName.toLowerCase()
  );

  // When a new breed is found by the AI, add it to our state and clear the local search term
  const handleBreedFound = (newBreed: PetBreed) => {
    setAllBreeds(prevBreeds => [newBreed, ...prevBreeds]);
    setSelectedPet(newBreed); // Open the dialog for the new breed
    setLocalSearchTerm(''); // Clear local filter after AI search adds a new breed
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

        {/* Combined AI-Powered Search and Local Filter */}
        <div className="mb-8 max-w-2xl mx-auto">
          <BreedSearch 
            speciesName={currentPetTypeResolved.name} 
            onBreedFound={handleBreedFound} 
            // Pass the localSearchTerm and its setter to BreedSearch so it can control the input
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
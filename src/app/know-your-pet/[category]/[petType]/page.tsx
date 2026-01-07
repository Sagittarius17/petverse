'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { petCategories } from '@/lib/data';
import type { PetBreed } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PetInfoDialog from '@/components/pet-info-dialog';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import BreedSearch from '@/components/ai/breed-search'; // Import the new component

export default function PetSpeciesPage({ params }: { params: { category: string; petType: string } }) {
  const router = useRouter();
  const [selectedPet, setSelectedPet] = useState<PetBreed | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { category: categoryName, petType: petTypeName } = params;

  const category = petCategories.find(
    (cat) => cat.category.toLowerCase() === categoryName.toLowerCase()
  );

  const petType = category?.species.find(
    (s) => s.name.toLowerCase() === petTypeName.toLowerCase()
  );
  
  const [breeds, setBreeds] = useState<PetBreed[]>(petType?.breeds || []);

  // When a new breed is found by the AI, add it to our state
  const handleBreedFound = (newBreed: PetBreed) => {
    setBreeds(prevBreeds => [newBreed, ...prevBreeds]);
    // Optional: open the dialog for the new breed immediately
    setSelectedPet(newBreed);
  };

  const filteredBreeds = useMemo(() => {
    if (!searchTerm) return breeds;
    return breeds.filter((breed) =>
      breed.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [breeds, searchTerm]);

  if (!category || !petType) {
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
          <h1 className="text-4xl font-bold font-headline tracking-tight">{petType.name} Breeds</h1>
          <p className="mt-2 text-lg text-muted-foreground">Explore different breeds of {petType.name}.</p>
        </div>

        {/* AI-Powered Breed Search */}
        <div className="mb-8 max-w-2xl mx-auto">
            <BreedSearch speciesName={petType.name} onBreedFound={handleBreedFound} />
        </div>

        {/* Local Search Filter */}
        <div className="mb-8 max-w-lg mx-auto">
          <Input 
            placeholder={`Search the list of ${breeds.length} breeds...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                <p>No breeds found matching &quot;{searchTerm}&quot; in our current list.</p>
                <p className="text-sm mt-2">You can use the AI search above to find and add it to our database.</p>
            </div>
          )}
        </section>
      </div>

      <PetInfoDialog pet={selectedPet} isOpen={!!selectedPet} onClose={() => setSelectedPet(null)} />
    </>
  );
}

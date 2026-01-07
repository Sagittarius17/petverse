'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { petCategories } from '@/lib/data';
import type { PetSpecies, PetBreed } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PetInfoDialog from '@/components/pet-info-dialog';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleAiBreedSearch } from './actions';

export default function PetSpeciesPage({ params }: { params: { category: string; petType: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedPet, setSelectedPet] = useState<PetBreed | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const categoryName = decodeURIComponent(params.category);
  const petTypeName = decodeURIComponent(params.petType);

  const category = petCategories.find(
    (cat) => cat.category.toLowerCase() === categoryName.toLowerCase()
  );

  const petType = category?.species.find(
    (s) => s.name.toLowerCase() === petTypeName.toLowerCase()
  );
  
  const [breeds, setBreeds] = useState<PetBreed[]>(petType?.breeds || []);

  const filteredBreeds = useMemo(() => {
    if (!searchTerm) return breeds;
    return breeds.filter((breed) =>
      breed.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [breeds, searchTerm]);


  const handleAiSearch = async () => {
    setIsSearching(true);
    toast({ title: 'AI Search Started', description: `Looking for information on "${searchTerm}"...` });

    const result = await handleAiBreedSearch({
      breedName: searchTerm,
      speciesName: petTypeName,
    });

    setIsSearching(false);

    if (result.error || !result.data) {
      toast({
        variant: 'destructive',
        title: 'AI Search Failed',
        description: result.error || `Could not find information for "${searchTerm}".`,
      });
      return;
    }

    toast({
      title: 'AI Search Complete!',
      description: `Successfully found information for "${result.data.name}".`,
    });

    const newBreed: PetBreed = {
      ...result.data,
      imageId: 'dog-1', // You can assign a default or a new placeholder
    };
    
    // Add to state and open the dialog
    setBreeds(prev => [newBreed, ...prev]);
    setSelectedPet(newBreed);
    setSearchTerm('');
  };


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

        <div className="mb-8 max-w-lg mx-auto">
          <Input 
            placeholder={`Search for a ${petType.name} breed...`}
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
                <p>No breeds found for &quot;{searchTerm}&quot;.</p>
                <Button onClick={handleAiSearch} disabled={isSearching} className="mt-4">
                  {isSearching ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...</>
                  ) : (
                    <><Wand2 className="mr-2 h-4 w-4" /> Search for &quot;{searchTerm}&quot; with AI</>
                  )}
                </Button>
            </div>
          )}
        </section>
      </div>

      <PetInfoDialog pet={selectedPet} isOpen={!!selectedPet} onClose={() => setSelectedPet(null)} />
    </>
  );
}

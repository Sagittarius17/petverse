'use client';

import { useState } from 'react';
import Image from 'next/image';
import { petCategories } from '@/lib/data';
import type { PetSpecies } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PetInfoDialog from '@/components/pet-info-dialog';
import { useRouter } from 'next/navigation';

export default function PetSpeciesPage({ params }: { params: { category: string; petType: string } }) {
  const router = useRouter();
  const [selectedPet, setSelectedPet] = useState<PetSpecies | null>(null);

  const categoryName = decodeURIComponent(params.category);
  const petTypeName = decodeURIComponent(params.petType);

  const category = petCategories.find(
    (cat) => cat.category.toLowerCase() === categoryName.toLowerCase()
  );

  const petType = category?.species.find(
    (s) => s.name.toLowerCase() === petTypeName.toLowerCase()
  );

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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-headline tracking-tight">{petType.name} Breeds</h1>
          <p className="mt-2 text-lg text-muted-foreground">Explore different breeds of {petType.name}.</p>
        </div>

        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {petType.breeds?.map((breed) => {
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
        </section>
      </div>

      <PetInfoDialog pet={selectedPet} isOpen={!!selectedPet} onClose={() => setSelectedPet(null)} />
    </>
  );
}

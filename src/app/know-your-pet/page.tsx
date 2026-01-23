
'use client';

import Image from 'next/image';
import { petCategories } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PawPrint } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function KnowYourPetPage() {
  const router = useRouter();

  const handlePetTypeClick = (categoryName: string, petTypeName: string) => {
    router.push(`/know-your-pet/${encodeURIComponent(categoryName)}/${encodeURIComponent(petTypeName)}`);
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">Know Your Pet</h1>
        <p className="mt-2 text-md md:text-lg text-muted-foreground">
          Explore different types of animals and learn which might be the perfect pet for you.
        </p>
      </div>

      <div className="space-y-8 md:space-y-12">
        {petCategories.map((category) => (
          <section key={category.category}>
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <PawPrint className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-headline">{category.category}</h2>
                <p className="text-muted-foreground">{category.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {category.species.map((s) => {
                const image = PlaceHolderImages.find(p => p.id === s.imageId);
                return (
                  <Card
                    key={s.name}
                    className="flex flex-col overflow-hidden transition-all hover:shadow-lg cursor-pointer"
                    onClick={() => handlePetTypeClick(category.category, s.name)}
                  >
                    <CardHeader className="relative h-32 sm:h-40 w-full p-0">
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
                    <CardContent className="p-3 md:p-4 flex-grow">
                      <CardTitle className="text-lg md:text-xl font-headline mb-1 md:mb-2">{s.name}</CardTitle>
                      <CardDescription className="text-sm">{s.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

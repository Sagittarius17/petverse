import Image from 'next/image';
import { petCategories } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PawPrint } from 'lucide-react';

export default function KnowYourPetPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Know Your Pet</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Explore different types of animals and learn which might be the perfect pet for you.
        </p>
      </div>

      <div className="space-y-12">
        {petCategories.map((category) => (
          <section key={category.category}>
            <div className="flex items-center gap-3 mb-6">
                <PawPrint className="h-8 w-8 text-primary" />
                <div>
                    <h2 className="text-3xl font-bold font-headline">{category.category}</h2>
                    <p className="text-muted-foreground">{category.description}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {category.species.map((s) => {
                const image = PlaceHolderImages.find(p => p.id === s.imageId);
                return (
                  <Card key={s.name} className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
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
                      <CardTitle className="text-xl font-headline mb-2">{s.name}</CardTitle>
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

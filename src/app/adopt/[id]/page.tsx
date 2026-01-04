'use client';

import React from 'react';
import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import { allPets } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PetDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const pet = allPets.find(p => p.id === id);

  if (!pet) {
    notFound();
  }

  const image = PlaceHolderImages.find(p => p.id === pet.imageId);

  return (
    <div className="bg-secondary/30">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Adoption List
        </Button>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
          {/* Image Section */}
          <div className="relative h-96 w-full overflow-hidden rounded-xl shadow-lg md:h-auto">
            {image && (
              <Image
                src={image.imageUrl}
                alt={`Photo of ${pet.name}`}
                fill
                style={{ objectFit: 'cover' }}
                data-ai-hint={image.imageHint}
                priority
              />
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col space-y-6">
            <header>
              <h1 className="text-5xl font-bold font-headline tracking-tight">{pet.name}</h1>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="default" className="text-lg">{pet.breed}</Badge>
                <Badge variant="secondary" className="text-lg">{pet.age}</Badge>
                <Badge variant="secondary" className="text-lg">{pet.gender}</Badge>
              </div>
            </header>

            <div>
              <h2 className="text-2xl font-bold font-headline">About {pet.name}</h2>
              <p className="mt-2 text-muted-foreground leading-relaxed">{pet.description}</p>
            </div>
             <div>
              <h2 className="text-2xl font-bold font-headline">Temperament & Personality</h2>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                A very good boy who loves to play fetch. Loyal and intelligent, great with families and other pets. He is house-trained and knows basic commands.
              </p>
            </div>


            <Card className="bg-background">
              <CardHeader>
                <CardTitle className="font-headline">Interested in Adoption?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                    To start the adoption process or ask any questions, please contact our adoption coordinator.
                </p>
                <div className="space-y-3">
                     <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <a href="mailto:adoptions@petverse.com" className="hover:underline">adoptions@petverse.com</a>
                    </div>
                     <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <span>(555) 123-4567</span>
                    </div>
                </div>
                <Button className="mt-6 w-full text-lg" size="lg">
                    <Heart className="mr-2" /> Inquire About {pet.name}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


'use client';

import React, { useEffect, use } from 'react';
import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, increment } from 'firebase/firestore';
import type { Pet } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function PetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const firestore = useFirestore();
  const resolvedParams = use(params);

  const petDocRef = useMemoFirebase(
      () => firestore ? doc(firestore, 'pets', resolvedParams.id) : null,
      [firestore, resolvedParams.id]
  );

  const { data: pet, isLoading, error } = useDoc<Pet>(petDocRef);

  useEffect(() => {
    if (petDocRef) {
      // Increment view count, non-blocking
      updateDocumentNonBlocking(petDocRef, {
        viewCount: increment(1)
      });
    }
  }, [petDocRef]);

  if (isLoading) {
    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <Skeleton className="h-8 w-24 mb-6" />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
                <Skeleton className="h-96 w-full rounded-xl" />
                <div className="space-y-6">
                    <Skeleton className="h-12 w-1/2" />
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        </div>
    );
  }

  if (!pet) {
    // This will be triggered if the doc doesn't exist or there was an error
    notFound();
  }

  const image = PlaceHolderImages.find(p => p.id === pet.imageId);

  return (
    <div className="bg-secondary/30">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
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

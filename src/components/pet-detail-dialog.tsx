'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, increment } from 'firebase/firestore';
import type { Pet } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface PetDetailDialogProps {
  pet: Pet | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PetDetailDialog({ pet, isOpen, onClose }: PetDetailDialogProps) {
  const firestore = useFirestore();
  const [hasBeenViewed, setHasBeenViewed] = useState(false);

  const petDocRef = useMemoFirebase(
    () => (firestore && pet ? doc(firestore, 'pets', pet.id) : null),
    [firestore, pet]
  );
  
  useEffect(() => {
    // Reset view flag when the pet changes or dialog closes
    if (!isOpen) {
      setHasBeenViewed(false);
    }
  }, [isOpen]);


  useEffect(() => {
    // Only increment if the dialog is open, we have a document reference,
    // and this specific dialog session hasn't already incremented the count.
    if (isOpen && petDocRef && !hasBeenViewed) {
      updateDocumentNonBlocking(petDocRef, {
        viewCount: increment(1)
      });
      // Set the flag to true to prevent further increments in this session
      setHasBeenViewed(true);
    }
  }, [isOpen, petDocRef, hasBeenViewed]);

  if (!pet) {
    return null;
  }

  const image = PlaceHolderImages.find(p => p.id === pet.imageId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Section */}
            <div className="relative h-96 w-full md:h-full min-h-[300px]">
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
            <div className="flex flex-col space-y-6 p-6 overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-4xl font-bold font-headline tracking-tight">{pet.name}</DialogTitle>
                     <DialogDescription className="sr-only">Detailed information about {pet.name}, a {pet.breed} available for adoption.</DialogDescription>
                    <div className="pt-4 flex flex-wrap gap-2">
                        <Badge variant="default" className="text-md">{pet.breed}</Badge>
                        <Badge variant="secondary" className="text-md">{pet.age}</Badge>
                        <Badge variant="secondary" className="text-md">{pet.gender}</Badge>
                    </div>
                </DialogHeader>

                <div>
                    <h2 className="text-xl font-bold font-headline">About {pet.name}</h2>
                    <p className="mt-2 text-muted-foreground leading-relaxed">{pet.description}</p>
                </div>
                <div>
                    <h2 className="text-xl font-bold font-headline">Temperament & Personality</h2>
                    <p className="mt-2 text-muted-foreground leading-relaxed">
                        A very good boy who loves to play fetch. Loyal and intelligent, great with families and other pets. He is house-trained and knows basic commands.
                    </p>
                </div>

                <Card className="bg-background">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Interested in Adoption?</CardTitle>
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
      </DialogContent>
    </Dialog>
  );
}

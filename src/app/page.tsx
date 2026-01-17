
'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { featuredCareGuides, type Pet } from '@/lib/data';
import PetCard from '@/components/pet-card';
import CareGuideCard from '@/components/care-guide-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, where } from 'firebase/firestore';
import PetDetailDialog from '@/components/pet-detail-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-1');
  const firestore = useFirestore();
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  const petsCollection = useMemoFirebase(
    () => collection(firestore, 'pets'),
    [firestore]
  );
  
  const petsQuery = useMemoFirebase(
    () => petsCollection ? query(petsCollection, where('isAdoptable', '==', true), orderBy('name'), limit(4)) : null,
    [petsCollection]
  );

  const { data: featuredPets, isLoading: petsLoading } = useCollection<Pet>(petsQuery);

  const handlePetSelect = (pet: Pet) => {
    setSelectedPet(pet);
  };

  const handleCloseDialog = () => {
    setSelectedPet(null);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full bg-primary/10 py-12 md:py-24">
        <div className="container mx-auto grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
          <div className="space-y-4 text-center lg:text-left">
            <h1 className="font-headline text-3xl font-bold tracking-tighter text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              Welcome to PetVerse
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl lg:mx-0">
              Your one-stop destination for pet adoption, care, and community. Find your new best friend today!
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/adopt">
                  Find a Pet <PawPrint className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/care">
                  Learn Pet Care <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative h-64 w-full overflow-hidden rounded-xl shadow-2xl md:h-96">
            {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  fill
                  style={{ objectFit: 'cover' }}
                  data-ai-hint={heroImage.imageHint}
                  priority
                />
              )}
          </div>
        </div>
      </section>

      {/* Featured Pets */}
      <section id="featured-pets" className="w-full py-12 md:py-20">
        <div className="container mx-auto space-y-8 px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">Ready for a Home</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              These lovely pets are looking for a forever family. Could it be you?
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
             {petsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ))
            ) : (
                featuredPets?.map((pet) => (
                    <PetCard key={pet.id} pet={pet} onPetSelect={handlePetSelect} />
                ))
            )}
          </div>
          <div className="text-center">
             <Button asChild size="lg" variant="secondary">
                <Link href="/adopt">
                    View All Adoptable Pets <ArrowRight className="ml-2" />
                </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Care Guides */}
      <section id="care-guides" className="w-full bg-secondary py-12 md:py-20">
        <div className="container mx-auto space-y-8 px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">Expert Pet Care Guides</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Everything you need to know to keep your furry, feathery, or scaly friend happy and healthy.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
             {featuredCareGuides.map((guide) => (
                <CareGuideCard key={guide.id} guide={guide} />
             ))}
          </div>
          <div className="text-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/care">Explore All Guides <ArrowRight className="ml-2" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Lost and Found */}
      <section id="lost-found" className="w-full py-12 md:py-20">
        <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="font-headline text-3xl font-bold tracking-tighter md:text-4xl/tight">Lost & Found</h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Help reunite pets with their families. Report a lost pet or browse found pet listings in your area.
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-y-2">
             <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/lost-and-found">
                  Go to Lost & Found
                </Link>
              </Button>
          </div>
        </div>
      </section>

      {selectedPet && (
        <PetDetailDialog
          pet={selectedPet}
          isOpen={!!selectedPet}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
}

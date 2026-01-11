'use client';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PawPrint, Heart, Users } from 'lucide-react';

export default function AboutUsPage() {
  const aboutImage = PlaceHolderImages.find(p => p.id === 'shop-hero-1');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">About PetVerse</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          We are a passionate team of animal lovers dedicated to connecting pets with loving families and providing the resources to help them thrive.
        </p>
      </div>

      {aboutImage && (
        <div className="relative h-64 md:h-96 w-full max-w-5xl mx-auto overflow-hidden rounded-2xl shadow-xl mb-12">
          <Image
            src={aboutImage.imageUrl}
            alt={aboutImage.description}
            fill
            style={{ objectFit: 'cover' }}
            data-ai-hint={aboutImage.imageHint}
            priority
          />
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
              <PawPrint className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold font-headline">Our Mission</h2>
            <p className="mt-2 text-muted-foreground">
              To reduce the number of homeless pets by making adoption accessible and providing comprehensive support and education to pet owners.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-accent/10 mb-4">
              <Heart className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-2xl font-bold font-headline">Our Vision</h2>
            <p className="mt-2 text-muted-foreground">
              A world where every pet has a safe, loving, and permanent home, and every owner has the knowledge to provide the best possible care.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-secondary mb-4">
              <Users className="h-8 w-8 text-secondary-foreground" />
            </div>
            <h2 className="text-2xl font-bold font-headline">Our Community</h2>
            <p className="mt-2 text-muted-foreground">
              We believe in the power of community. PetVerse is a place for shelters, rescuers, veterinarians, and pet lovers to connect and share their passion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

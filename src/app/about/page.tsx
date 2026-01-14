'use client';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PawPrint, Heart, Users } from 'lucide-react';

export default function AboutUsPage() {
  const aboutImage = PlaceHolderImages.find(p => p.id === 'shop-hero-1');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">So, About PetVerse...</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          It's mostly just me, a keyboard, and an unreasonable number of pets who think they're my supervisors. This whole thing started because my heart has more room for animals than my house does.
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
            <h2 className="text-2xl font-bold font-headline">My Mission</h2>
            <p className="mt-2 text-muted-foreground">
              To build a place so good at finding homes for pets that my own living room ceases to be an unofficial shelter. And to maybe, just maybe, see every kennel and cage empty for good. A guy can dream, right?
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-accent/10 mb-4">
              <Heart className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-2xl font-bold font-headline">My Hope</h2>
            <p className="mt-2 text-muted-foreground">
              I picture a world where the saddest 'goodbye' is the one at the shelter door when a pet leaves for their forever home, not when they're left behind. A world where every "Hello" is the start of a lifelong friendship.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-secondary mb-4">
              <Users className="h-8 w-8 text-secondary-foreground" />
            </div>
            <h2 className="text-2xl font-bold font-headline">The "Community"</h2>
            <p className="mt-2 text-muted-foreground">
              This isn't just my project; it's a testament to everyone who has ever loved an animal. Every share, every adoption, every time you choose kindness, you're a part of this. You are the "we" in this mission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

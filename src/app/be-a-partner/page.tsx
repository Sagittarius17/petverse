'use client';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { PawPrint } from 'lucide-react';
import Link from 'next/link';

const partnerSections = [
  {
    title: 'Dog Trainers',
    description: "Join our network of certified trainers dedicated to positive reinforcement. Help new pet parents build a strong, positive bond with their dogs through expert guidance and compassionate training techniques. Your expertise can turn challenging behaviors into triumphant milestones.",
    imageId: 'partner-trainer',
    imageHint: 'dog training',
    link: '/contact'
  },
  {
    title: 'Veterinarians',
    description: "Your veterinary expertise is invaluable. Partner with us to provide trusted medical advice, wellness checks, and emergency care information to our community. Together, we can ensure every pet receives the high-quality care they need to live a long, healthy, and happy life.",
    imageId: 'partner-vet',
    imageHint: 'veterinarian pet',
    link: '/contact'
  },
  {
    title: 'Dog Walkers',
    description: "Help keep the pets in our community happy, healthy, and well-exercised. We're looking for reliable and passionate dog walkers to provide daily adventures and much-needed potty breaks. Your steps can make a huge difference in a dog's day.",
    imageId: 'partner-walker',
    imageHint: 'dog walking',
    link: '/contact'
  },
  {
    title: 'Pet Groomers',
    description: "A clean pet is a happy pet. Offer your professional grooming services to our community to help pets look and feel their best. From stylish cuts to essential nail trims, your skills are a key part of responsible pet ownership.",
    imageId: 'partner-groomer',
    imageHint: 'pet grooming',
    link: '/contact'
  },
];

export default function BeAPartnerPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <PawPrint className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-4xl md:text-5xl font-bold font-headline tracking-tight">Become a PetVerse Partner</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          We believe in the power of community. Join our network of trusted professionals and help us provide the best possible care for pets everywhere.
        </p>
      </div>

      <div className="space-y-16 md:space-y-24">
        {partnerSections.map((section, index) => {
          const image = PlaceHolderImages.find(p => p.id === section.imageId);
          const isReversed = index % 2 !== 0;

          return (
            <div key={section.title} className="grid md:grid-cols-2 items-center gap-12">
              <div className={`relative h-80 w-full overflow-hidden rounded-2xl shadow-xl ${isReversed ? 'md:order-last' : ''}`}>
                {image && (
                  <Image
                    src={image.imageUrl}
                    alt={section.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    data-ai-hint={section.imageHint}
                  />
                )}
              </div>
              <div className={`space-y-4 text-center md:text-left ${isReversed ? 'md:order-first' : ''}`}>
                <h2 className="text-3xl font-bold font-headline">{section.title}</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {section.description}
                </p>
                <Button asChild size="lg">
                  <Link href={section.link}>Partner With Us</Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

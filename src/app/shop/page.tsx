'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { allProducts } from '@/lib/shop-data';
import ProductCard from '@/components/product-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PawPrint, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function ShopContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  
  const heroImage = PlaceHolderImages.find(p => p.id === 'shop-hero-1');
  const toyImage = PlaceHolderImages.find(p => p.id === 'product-toy-3');
  const foodImage = PlaceHolderImages.find(p => p.id === 'product-food-1');
  const beddingImage = PlaceHolderImages.find(p => p.id === 'product-bed-1');

  const filteredProducts = query
    ? allProducts.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase()))
    : allProducts;

  const featuredProducts = allProducts.filter(p => p.isFeatured);
  
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full bg-amber-100/50 dark:bg-amber-900/20 py-12 md:py-24 lg:py-32">
        <div className="container mx-auto grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
          <div className="space-y-4 text-center lg:text-left">
            <h1 className="font-headline text-3xl font-bold tracking-tighter text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              Everything Your Pet Deserves
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl lg:mx-0">
              High-quality food, engaging toys, and stylish accessories to keep your best friend happy and healthy.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
              <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-amber-950">
                <Link href="/shop/toys">
                  shop toys?
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/adopt">
                  want to adopt a pet?
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

      {/* Interactive Toys Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container mx-auto grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
          <div className="relative h-80 w-full overflow-hidden rounded-xl shadow-lg">
            {toyImage && (
              <Image
                src={toyImage.imageUrl}
                alt="Interactive Dog Puzzle Toy"
                fill
                style={{ objectFit: 'cover' }}
                data-ai-hint="dog puzzle"
              />
            )}
          </div>
          <div className="space-y-4">
            <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Smarter Playtime</div>
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">Keep Their Minds Sharp</h2>
            <p className="text-muted-foreground md:text-xl/relaxed">
              Our interactive puzzle toys are designed to challenge your pet, prevent boredom, and reward them with treats. It's a fantastic way to stimulate their brain and strengthen your bond.
            </p>
            <Button asChild size="lg">
              <Link href="/shop/toys">Shop Interactive Toys</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Premium Food Section */}
      <section className="w-full bg-secondary py-12 md:py-24 lg:py-32">
        <div className="container mx-auto grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
          <div className="space-y-4">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary-foreground">Nutrition First</div>
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">Fuel Their Adventures</h2>
            <p className="text-muted-foreground md:text-xl/relaxed">
              Give your pet the best with our range of organic and grain-free foods. Packed with high-quality proteins and essential nutrients, our formulas support everything from puppy growth to senior vitality.
            </p>
            <Button asChild size="lg">
              <Link href="/shop/food">Explore Pet Food</Link>
            </Button>
          </div>
          <div className="relative h-80 w-full overflow-hidden rounded-xl shadow-lg">
            {foodImage && (
              <Image
                src={foodImage.imageUrl}
                alt="Organic Puppy Kibble"
                fill
                style={{ objectFit: 'cover' }}
                data-ai-hint="dog food"
              />
            )}
          </div>
        </div>
      </section>

      {/* Cozy Bedding Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container mx-auto grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
          <div className="relative h-80 w-full overflow-hidden rounded-xl shadow-lg">
            {beddingImage && (
              <Image
                src={beddingImage.imageUrl}
                alt="Orthopedic Dog Bed"
                fill
                style={{ objectFit: 'cover' }}
                data-ai-hint="dog bed"
              />
            )}
          </div>
          <div className="space-y-4">
            <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Sweet Dreams</div>
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">Ultimate Comfort Zone</h2>
            <p className="text-muted-foreground md:text-xl/relaxed">
              From plush orthopedic beds that support aging joints to cozy cat caves perfect for a quiet nap, our bedding provides the perfect spot for your pet to rest and recharge.
            </p>
            <Button asChild size="lg">
              <Link href="/shop/bedding">Discover Cozy Beds</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}

export default function ShopPage() {
    return (
        <Suspense fallback={<ShopSkeleton />}>
            <ShopContent />
        </Suspense>
    );
}

function ShopSkeleton() {
    return <div className="container mx-auto p-4"><Skeleton className="h-96 w-full" /></div>
}

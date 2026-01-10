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

  const filteredProducts = query
    ? allProducts.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase()))
    : allProducts;

  const featuredProducts = allProducts.filter(p => p.isFeatured);
  const categories = [
    { name: 'Food', href: '/shop/food', imageId: 'category-food' },
    { name: 'Toys', href: '/shop/toys', imageId: 'category-toys' },
    { name: 'Accessories', href: '/shop/accessories', imageId: 'category-accessories' },
    { name: 'Bedding', href: '/shop/bedding', imageId: 'category-bedding' },
  ];

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
            <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-amber-950">
              <Link href="/shop/food">
                Shop All Products <Sparkles className="ml-2" />
              </Link>
            </Button>
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

      {/* Categories Section */}
      <section className="w-full py-12 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="font-headline text-3xl font-bold tracking-tighter text-center mb-8 sm:text-4xl">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => {
              const image = PlaceHolderImages.find(p => p.id === category.imageId);
              return (
                <Link key={category.name} href={category.href} className="group relative overflow-hidden rounded-lg">
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors z-10" />
                  {image && (
                    <Image
                      src={image.imageUrl}
                      alt={category.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      data-ai-hint={image.imageHint}
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  <div className="relative z-20 flex h-full flex-col items-center justify-center p-4">
                    <h3 className="text-xl font-bold text-white font-headline text-center">{category.name}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="w-full bg-secondary py-12 md:py-24 lg:py-32">
        <div className="container mx-auto space-y-8 px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">Featured Products</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our top picks and best-sellers, loved by pets and their owners.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
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

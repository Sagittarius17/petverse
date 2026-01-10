'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { allProducts, Product } from '@/lib/shop-data';
import ProductCard from '@/components/product-card';
import { PawPrint } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function FoodPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  
  const foodProducts = useMemo(() => allProducts.filter(p => p.category === 'Food'), []);

  const filteredProducts = useMemo(() => {
    if (!query) return foodProducts;
    return foodProducts.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase()));
  }, [query, foodProducts]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Pet Food</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Nutritious and delicious meals for your beloved pets.
        </p>
      </div>
      
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <PawPrint className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 text-xl font-semibold">No Food Found</h3>
          <p className="mt-2 text-muted-foreground">
            No products matched your search for &quot;{query}&quot;. Try a different search term.
          </p>
        </div>
      )}
    </div>
  );
}

export default function FoodPage() {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <FoodPageContent />
        </Suspense>
    );
}

function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-6 w-96 mx-auto mt-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

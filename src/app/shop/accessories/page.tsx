'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { allProducts, Product } from '@/lib/shop-data';
import ProductCard from '@/components/product-card';
import { PawPrint } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function AccessoriesPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  
  const accessories = useMemo(() => allProducts.filter(p => p.category === 'Accessories'), []);

  const filteredProducts = useMemo(() => {
    if (!query) return accessories;
    return accessories.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase()));
  }, [query, accessories]);

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <PawPrint className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 text-xl font-semibold">No Accessories Found</h3>
          <p className="mt-2 text-muted-foreground">
            No products matched your search for &quot;{query}&quot;. Try a different search term.
          </p>
        </div>
      )}
    </div>
  );
}

export default function AccessoriesPage() {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <AccessoriesPageContent />
        </Suspense>
    );
}

function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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

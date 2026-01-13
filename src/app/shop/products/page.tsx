
'use client';

import { Suspense } from 'react';
import ProductGrid from '@/components/product-grid';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProductGrid />
    </Suspense>
  );
}

function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        {/* Filter Skeleton */}
        <div className="lg:col-span-1 space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        {/* Product Grid Skeleton */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

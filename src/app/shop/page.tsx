
import { type Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ShopContent from './shop-content';

export const metadata: Metadata = {
  title: 'PetVerse Shop - High-Quality Pet Supplies',
  description: 'Shop for everything your pet deserves! Find high-quality food, engaging toys, cozy beds, and stylish accessories to keep your best friend happy and healthy.',
};

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


'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { allProducts } from '@/lib/shop-data';
import ProductCard from '@/components/product-card';
import ProductFilters from '@/components/product-filters';
import { PawPrint } from 'lucide-react';

export default function ProductGrid() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number]>([100]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchesPrice = product.price <= priceRange[0];
      const matchesRating = selectedRatings.length === 0 || selectedRatings.includes(Math.round(product.rating || 0));
      const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesPrice && matchesRating && matchesSearch;
    });
  }, [searchQuery, selectedCategories, priceRange, selectedRatings]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <ProductFilters
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            selectedRatings={selectedRatings}
            setSelectedRatings={setSelectedRatings}
          />
        </div>
        <div className="lg:col-span-3">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 col-span-full">
              <PawPrint className="mx-auto h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 text-xl font-semibold">No Products Found</h3>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

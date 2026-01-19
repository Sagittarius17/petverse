'use client';

import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatCurrency, config } from '@/lib/localization';

interface ProductFiltersProps {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  priceRange: [number];
  setPriceRange: (range: [number]) => void;
  selectedRatings: number[];
  setSelectedRatings: (ratings: number[]) => void;
}

const categories = ['Food', 'Toys', 'Accessories', 'Bedding'];
const ratings = [5, 4, 3, 2, 1];
const MAX_PRICE_SLIDER = 65; // This value will represent "5000+"

export default function ProductFilters({
  selectedCategories,
  setSelectedCategories,
  priceRange,
  setPriceRange,
  selectedRatings,
  setSelectedRatings,
}: ProductFiltersProps) {

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(
      selectedCategories.includes(category)
        ? selectedCategories.filter(c => c !== category)
        : [...selectedCategories, category]
    );
  };

  const handleRatingChange = (rating: number) => {
    setSelectedRatings(
      selectedRatings.includes(rating)
        ? selectedRatings.filter(r => r !== rating)
        : [...selectedRatings, rating]
    );
  };
  
  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([MAX_PRICE_SLIDER]);
    setSelectedRatings([]);
  };

  const displayPriceLabel = () => {
    if (priceRange[0] >= MAX_PRICE_SLIDER) {
      const formatter = new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
      return `${formatter.format(5000)}+`;
    }
    return `Up to ${formatCurrency(priceRange[0])}`;
  };

  return (
    <div className="space-y-6 sticky top-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-headline">Filters</h2>
        <Button variant="ghost" onClick={clearFilters} className="text-sm">Clear All</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map(category => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleCategoryChange(category)}
              />
              <Label htmlFor={category} className="cursor-pointer">{category}</Label>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price Range</CardTitle>
        </CardHeader>
        <CardContent>
          <Slider
            min={0}
            max={MAX_PRICE_SLIDER}
            step={5}
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number])}
          />
          <div className="mt-2 text-sm text-muted-foreground">
            {displayPriceLabel()}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rating</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ratings.map(rating => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={selectedRatings.includes(rating)}
                onCheckedChange={() => handleRatingChange(rating)}
              />
              <Label htmlFor={`rating-${rating}`} className="flex items-center cursor-pointer">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-5 w-5",
                      i < rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground"
                    )}
                  />
                ))}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

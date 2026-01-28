
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Search, MapPin } from 'lucide-react';
import { petCategories } from '@/lib/data';
import { LocationInput } from './ui/location-input';

interface PetFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  locationFilter: string;
  setLocationFilter: (location: string) => void;
  onUseLocation: () => void;
  categoryFilter: string[];
  setCategoryFilter: (categories: string[]) => void;
  genderFilter: string[];
  setGenderFilter: (genders: string[]) => void;
  ageRange: [number];
  setAgeRange: (ages: [number]) => void;
  distanceRange: [number];
  setDistanceRange: (distance: [number]) => void;
}

export default function PetFilters({
  searchTerm,
  setSearchTerm,
  locationFilter,
  setLocationFilter,
  onUseLocation,
  categoryFilter,
  setCategoryFilter,
  genderFilter,
  setGenderFilter,
  ageRange,
  setAgeRange,
  distanceRange,
  setDistanceRange,
}: PetFiltersProps) {

  const categories = [...petCategories.map(c => c.category), 'Other'];

  const handleCheckboxChange = (
    value: string,
    filter: string[],
    setter: (newFilter: string[]) => void
  ) => {
    setter(
      filter.includes(value)
        ? filter.filter(item => item !== value)
        : [...filter, value]
    );
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setCategoryFilter([]);
    setGenderFilter([]);
    setAgeRange([180]);
    setDistanceRange([50]);
  };

  const formatAgeLabel = (months: number): string => {
    if (months < 12) {
      return `${months} month${months > 1 ? 's' : ''}`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
        return `${years} year${years > 1 ? 's' : ''}`;
    }
    return `${years}y ${remainingMonths}m`;
};


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-headline">Filters</h2>
        <Button variant="ghost" onClick={clearFilters} className="text-sm">Clear All</Button>
      </div>

       <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by name or breed..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10"
          />
       </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <div className="relative">
            <LocationInput
                id="location"
                placeholder="City, State"
                value={locationFilter}
                onChange={setLocationFilter}
            />
            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full" onClick={onUseLocation} title="Find pets near me">
                <MapPin className="h-4 w-4 text-muted-foreground hover:text-primary"/>
                <span className="sr-only">Use my location</span>
            </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distance</CardTitle>
        </CardHeader>
        <CardContent>
          <Slider
            min={0}
            max={50}
            step={5}
            value={distanceRange}
            onValueChange={(value) => setDistanceRange(value as [number])}
            disabled={!locationFilter}
          />
          <div className="mt-2 text-sm text-muted-foreground">
            Up to {distanceRange[0]} km away
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map(category => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={categoryFilter.includes(category)}
                onCheckedChange={() => handleCheckboxChange(category, categoryFilter, setCategoryFilter)}
              />
              <Label htmlFor={`category-${category}`} className="cursor-pointer capitalize">{category}</Label>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gender</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {['Male', 'Female'].map(gender => (
            <div key={gender} className="flex items-center space-x-2">
              <Checkbox
                id={`gender-${gender}`}
                checked={genderFilter.includes(gender)}
                onCheckedChange={() => handleCheckboxChange(gender, genderFilter, setGenderFilter)}
              />
              <Label htmlFor={`gender-${gender}`} className="cursor-pointer">{gender}</Label>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Age</CardTitle>
        </CardHeader>
        <CardContent>
          <Slider
            min={1}
            max={180} // 15 years in months
            step={1}
            value={ageRange}
            onValueChange={(value) => setAgeRange(value as [number])}
          />
          <div className="mt-2 text-sm text-muted-foreground">
            Up to {formatAgeLabel(ageRange[0])}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

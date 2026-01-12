'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import type { Pet } from '@/lib/data';

interface PetFiltersProps {
  allPets: Pet[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  speciesFilter: string[];
  setSpeciesFilter: (species: string[]) => void;
  genderFilter: string[];
  setGenderFilter: (genders: string[]) => void;
}

export default function PetFilters({
  allPets,
  searchTerm,
  setSearchTerm,
  speciesFilter,
  setSpeciesFilter,
  genderFilter,
  setGenderFilter,
}: PetFiltersProps) {

  const uniqueSpecies = ['All', ...Array.from(new Set(allPets.map(p => p.species)))];

  const handleSpeciesChange = (species: string) => {
    setSpeciesFilter(
      speciesFilter.includes(species)
        ? speciesFilter.filter(s => s !== species)
        : [...speciesFilter, species]
    );
  };
  
  const handleGenderChange = (gender: string) => {
    setGenderFilter(
      genderFilter.includes(gender)
        ? genderFilter.filter(g => g !== gender)
        : [...genderFilter, gender]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSpeciesFilter([]);
    setGenderFilter([]);
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Species</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {uniqueSpecies.filter(s => s !== 'All').map(species => (
            <div key={species} className="flex items-center space-x-2">
              <Checkbox
                id={`species-${species}`}
                checked={speciesFilter.includes(species)}
                onCheckedChange={() => handleSpeciesChange(species)}
              />
              <Label htmlFor={`species-${species}`} className="cursor-pointer capitalize">{species}</Label>
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
                onCheckedChange={() => handleGenderChange(gender)}
              />
              <Label htmlFor={`gender-${gender}`} className="cursor-pointer">{gender}</Label>
            </div>
          ))}
        </CardContent>
      </Card>
      {/* Age and Breed filters can be added here in the future */}
    </div>
  );
}

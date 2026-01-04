'use client';

import { useState, useMemo } from 'react';
import type { Pet } from '@/lib/data';
import PetCard from './pet-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { PawPrint } from 'lucide-react';

interface AdoptionListProps {
  allPets: Pet[];
}

export default function AdoptionList({ allPets }: AdoptionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('All');
  const [ageFilter, setAgeFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');

  const filteredPets = useMemo(() => {
    return allPets.filter(pet => {
      const matchesSearch =
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecies = speciesFilter === 'All' || pet.species === speciesFilter;
      const matchesAge = ageFilter === 'All' || pet.age.includes(ageFilter.replace(' years', '').replace(' year', ''));
      const matchesGender = genderFilter === 'All' || pet.gender === genderFilter;
      
      return matchesSearch && matchesSpecies && matchesAge && matchesGender;
    });
  }, [allPets, searchTerm, speciesFilter, ageFilter, genderFilter]);

  const uniqueSpecies = ['All', ...Array.from(new Set(allPets.map(p => p.species)))];
  // Simple age groups for filtering
  const ageGroups = ['All', '6 months', '1 year', '2 years', '3 years', '4 years', '5 years'];

  return (
    <div>
      <Card className="mb-8 shadow-md">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            <Input
                placeholder="Search by name or breed..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="lg:col-span-2"
            />
            <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
                <SelectTrigger><SelectValue placeholder="Species" /></SelectTrigger>
                <SelectContent>
                    {uniqueSpecies.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Genders</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
            </Select>
        </CardContent>
      </Card>
      
      {filteredPets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPets.map(pet => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <PawPrint className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 text-xl font-semibold">No Pets Found</h3>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search filters to find more friends.
          </p>
        </div>
      )}
    </div>
  );
}

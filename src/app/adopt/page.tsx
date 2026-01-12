'use client';
import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Pet } from '@/lib/data';
import AdoptionList from '@/components/adoption-list';
import PetFilters from '@/components/pet-filters';
import { Skeleton } from '@/components/ui/skeleton';

// Helper function to categorize age string into groups
const getAgeGroup = (ageString: string): string => {
  const ageNum = parseInt(ageString);
  const isMonths = ageString.toLowerCase().includes('month');

  if (isMonths || ageNum < 1) {
    return 'Puppy/Kitten';
  }
  if (ageNum >= 1 && ageNum <= 3) {
    return 'Young';
  }
  if (ageNum > 3 && ageNum <= 7) {
    return 'Adult';
  }
  return 'Senior';
};

export default function AdoptPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<string[]>([]);
  const [genderFilter, setGenderFilter] = useState<string[]>([]);
  const [ageFilter, setAgeFilter] = useState<string[]>([]);

  const petsCollection = useMemoFirebase(
    () => collection(firestore, 'pets'),
    [firestore]
  );
  
  const petsQuery = useMemoFirebase(
    () => petsCollection ? query(petsCollection, orderBy('name')) : null,
    [petsCollection]
  );

  const { data: allPets, isLoading, error } = useCollection<Pet>(petsQuery);

  const filteredPets = useMemo(() => {
    if (!allPets) return [];
    return allPets.filter(pet => {
      const matchesSearch =
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecies = speciesFilter.length === 0 || speciesFilter.includes(pet.species);
      const matchesGender = genderFilter.length === 0 || genderFilter.includes(pet.gender);
      const matchesAge = ageFilter.length === 0 || ageFilter.includes(getAgeGroup(pet.age));
      
      return matchesSearch && matchesSpecies && matchesGender && matchesAge;
    });
  }, [allPets, searchTerm, speciesFilter, genderFilter, ageFilter]);

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {Array.from({length: 6}).map((_, i) => (
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

  if (error) {
    return (
        <div className="container mx-auto px-4 py-8 text-center text-destructive">
            <p>Error loading pets: {error.message}</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Find Your New Best Friend</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Browse our listings of lovable pets waiting for a forever home.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="lg:col-span-1 lg:sticky lg:top-20">
          <PetFilters
            allPets={allPets || []}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            speciesFilter={speciesFilter}
            setSpeciesFilter={setSpeciesFilter}
            genderFilter={genderFilter}
            setGenderFilter={setGenderFilter}
            ageFilter={ageFilter}
            setAgeFilter={setAgeFilter}
          />
        </div>
        <div className="lg:col-span-3">
            <AdoptionList pets={filteredPets} />
        </div>
      </div>
    </div>
  );
}

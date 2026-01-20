'use client';
import { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Pet, UserProfile } from '@/lib/data';
import AdoptionList from '@/components/adoption-list';
import PetFilters from '@/components/pet-filters';
import { Skeleton } from '@/components/ui/skeleton';
import { petCategories } from '@/lib/data';

// Helper function to parse age string into total months
const getAgeInMonths = (ageString: string): number => {
  if (!ageString) return 0;
  const parts = ageString.toLowerCase().split(' ');
  let totalMonths = 0;
  
  const yearsIndex = parts.findIndex(p => p.includes('year'));
  if (yearsIndex !== -1) {
    totalMonths += parseInt(parts[yearsIndex - 1] || '0') * 12;
  }
  
  const monthsIndex = parts.findIndex(p => p.includes('month'));
  if (monthsIndex !== -1) {
    totalMonths += parseInt(parts[monthsIndex - 1] || '0');
  }
  
  return totalMonths;
};


// Create a mapping from species to category for efficient lookup
const speciesToCategoryMap = new Map<string, string>();
petCategories.forEach(category => {
  category.species.forEach(specie => {
    speciesToCategoryMap.set(specie.name, category.category);
  });
});

const getCategoryFromSpecies = (species: string): string => {
  // Handle 'Dog' and 'Cat' which are inside 'Mammals'
  if (species === 'Dog' || species === 'Cat') return 'Mammals';
  // Handle 'Parrots' which is inside 'Birds'
  if (species === 'Parrot' || species === 'Bird') return 'Birds';
  // A more robust lookup
  for (const category of petCategories) {
    if (category.species.some(s => s.name === species)) {
      return category.category;
    }
  }
  return 'Other'; // Fallback category
};


export default function AdoptPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [genderFilter, setGenderFilter] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<[number]>([180]); // Max age in months (15 years)

  const petsCollection = useMemoFirebase(
    () => collection(firestore, 'pets'),
    [firestore]
  );
  
  const petsQuery = useMemoFirebase(
    () => petsCollection ? query(petsCollection) : null,
    [petsCollection]
  );

  const { data: unsortedPets, isLoading, error } = useCollection<Pet>(petsQuery);

  const allPets = useMemo(() => {
    if (!unsortedPets) return null;
    return [...unsortedPets].sort((a, b) => {
      const timeA = a.createdAt?.toMillis() || 0;
      const timeB = b.createdAt?.toMillis() || 0;
      return timeB - timeA; // Sort descending (newest first)
    });
  }, [unsortedPets]);


  const [activePets, setActivePets] = useState<Pet[] | null>(null);
  const [userProfilesMap, setUserProfilesMap] = useState<Map<string, UserProfile>>(new Map());
  const [isFilteringUsers, setIsFilteringUsers] = useState(true);

  useEffect(() => {
    const filterPetsByActiveUsers = async () => {
      if (!allPets || !firestore) {
        if (!isLoading) {
            setIsFilteringUsers(false);
            setActivePets([]);
        }
        return;
      };

      setIsFilteringUsers(true);
      const userIds = [...new Set(allPets.map(pet => pet.userId).filter((id): id is string => !!id))];
      
      if (userIds.length === 0) {
        setActivePets(allPets.filter(p => !p.userId));
        setIsFilteringUsers(false);
        return;
      }

      const userChunks: string[][] = [];
      for (let i = 0; i < userIds.length; i += 30) {
          userChunks.push(userIds.slice(i, i + 30));
      }

      const activeUserProfiles = new Map<string, UserProfile>();

      try {
        await Promise.all(userChunks.map(async (chunk) => {
            const usersQuery = query(collection(firestore, 'users'), where('__name__', 'in', chunk), where('status', '==', 'Active'));
            const usersSnapshot = await getDocs(usersQuery);
            usersSnapshot.forEach(doc => {
              activeUserProfiles.set(doc.id, { id: doc.id, ...doc.data() } as UserProfile);
            });
        }));
        
        setUserProfilesMap(activeUserProfiles);
        const filtered = allPets.filter(pet => !pet.userId || activeUserProfiles.has(pet.userId));
        setActivePets(filtered);

      } catch (e) {
          console.error("Error filtering pets by user status:", e);
          setActivePets(allPets); // Fallback to showing all pets on error
      } finally {
        setIsFilteringUsers(false);
      }
    };

    if (!isLoading) {
        filterPetsByActiveUsers();
    }
  }, [allPets, firestore, isLoading]);

  const filteredPets = useMemo(() => {
    if (!activePets) return [];
    return activePets.filter(pet => {
      const matchesSearch =
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(getCategoryFromSpecies(pet.species));
      const matchesGender = genderFilter.length === 0 || genderFilter.includes(pet.gender);
      const petAgeInMonths = getAgeInMonths(pet.age);
      const matchesAge = petAgeInMonths <= ageRange[0];
      
      return matchesSearch && matchesCategory && matchesGender && matchesAge;
    });
  }, [activePets, searchTerm, categoryFilter, genderFilter, ageRange]);
  
  const finalIsLoading = isLoading || isFilteringUsers;


  if (finalIsLoading) {
    return (
        <div className="container mx-auto px-4 py-6 md:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
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
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">Find Your New Best Friend</h1>
        <p className="mt-2 text-md md:text-lg text-muted-foreground">
          Browse our listings of lovable pets waiting for a forever home.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 items-start">
        <div className="lg:col-span-1 lg:sticky lg:top-20">
          <PetFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            genderFilter={genderFilter}
            setGenderFilter={setGenderFilter}
            ageRange={ageRange}
            setAgeRange={setAgeRange}
          />
        </div>
        <div className="lg:col-span-3">
            <AdoptionList pets={filteredPets} userProfiles={userProfilesMap} />
        </div>
      </div>
    </div>
  );
}

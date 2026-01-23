'use client';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, orderBy, limit, startAfter, DocumentSnapshot, DocumentData } from 'firebase/firestore';
import type { Pet, UserProfile } from '@/lib/data';
import AdoptionList from '@/components/adoption-list';
import PetFilters from '@/components/pet-filters';
import { Skeleton } from '@/components/ui/skeleton';
import { petCategories } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';

const PAGE_SIZE = 8;

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

// Manual mapping for inconsistencies between Pet.species enum and the data in initial-pet-data
speciesToCategoryMap.set('Dog', 'Mammals');
speciesToCategoryMap.set('Cat', 'Mammals');
speciesToCategoryMap.set('Bird', 'Birds');
speciesToCategoryMap.set('Lizard', 'Reptiles');
speciesToCategoryMap.set('Fish', 'Fish');


export default function AdoptPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [genderFilter, setGenderFilter] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<[number]>([180]); // Max age in months (15 years)

  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [userProfilesMap, setUserProfilesMap] = useState<Map<string, UserProfile>>(new Map());
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot<DocumentData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const fetchPets = useCallback(async (lastDoc: DocumentSnapshot<DocumentData> | null) => {
    if (!firestore) return;
    
    let petsQuery;
    const petsCollection = collection(firestore, 'pets');
    
    if (lastDoc) {
        petsQuery = query(petsCollection, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(PAGE_SIZE));
    } else {
        petsQuery = query(petsCollection, orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
    }

    const documentSnapshots = await getDocs(petsQuery);
    
    const newPets = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pet));
    const newLastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];

    setLastVisible(newLastVisible);
    setHasMore(documentSnapshots.docs.length === PAGE_SIZE);

    if (newPets.length > 0) {
      const userIds = [...new Set(newPets.map(pet => pet.userId).filter((id): id is string => !!id))];
      const fetchedUserProfiles = new Map<string, UserProfile>();
      let petsToShow = newPets;

      if (userIds.length > 0) {
        const userChunks: string[][] = [];
        for (let i = 0; i < userIds.length; i += 30) {
          userChunks.push(userIds.slice(i, i + 30));
        }

        try {
          await Promise.all(
            userChunks.map(async (chunk) => {
              const usersQuery = query(collection(firestore, 'users'), where('__name__', 'in', chunk), where('status', '==', 'Active'));
              const usersSnapshot = await getDocs(usersQuery);
              usersSnapshot.forEach((doc) => {
                fetchedUserProfiles.set(doc.id, { id: doc.id, ...doc.data() } as UserProfile);
              });
            })
          );
          petsToShow = newPets.filter(pet => !pet.userId || fetchedUserProfiles.has(pet.userId));
        } catch (e) {
          console.log("Could not fetch user statuses. This is expected for unauthenticated users.");
          // petsToShow remains as newPets, so all pets are shown.
        }
      }

      setAllPets(prev => lastDoc ? [...prev, ...petsToShow] : petsToShow);
      setUserProfilesMap(prev => new Map([...prev, ...fetchedUserProfiles]));
    }
  }, [firestore]);
  
  useEffect(() => {
    setIsLoading(true);
    fetchPets(null).finally(() => setIsLoading(false));
  }, [fetchPets]);

  const handleLoadMore = () => {
    if (!lastVisible) return;
    setIsLoadingMore(true);
    fetchPets(lastVisible).finally(() => setIsLoadingMore(false));
  };


  const filteredPets = useMemo(() => {
    return allPets.filter(pet => {
      const matchesSearch =
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
      const petCategory = speciesToCategoryMap.get(pet.species) || 'Other';
      const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(petCategory);
      const matchesGender = genderFilter.length === 0 || genderFilter.includes(pet.gender);
      const petAgeInMonths = getAgeInMonths(pet.age);
      const matchesAge = petAgeInMonths <= ageRange[0];
      
      return matchesSearch && matchesCategory && matchesGender && matchesAge;
    });
  }, [allPets, searchTerm, categoryFilter, genderFilter, ageRange]);
  

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-4 md:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
                <div className="hidden lg:block lg:col-span-1 space-y-4">
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

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-headline tracking-tight">Find Your New Best Friend</h1>
        <p className="mt-2 text-base md:text-lg text-muted-foreground">
          Browse our listings of lovable pets waiting for a forever home.
        </p>
      </div>

      <div className="flex justify-end items-center mb-4 lg:hidden">
        <Button variant="outline" onClick={() => setIsFilterSheetOpen(true)}>
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
        </Button>
      </div>
      
      <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
        <SheetContent side="left" className="w-full max-w-sm p-0">
            <div className="h-full overflow-y-auto p-6">
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
        </SheetContent>
      </Sheet>


      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 items-start">
        <div className="hidden lg:block lg:col-span-1 lg:sticky lg:top-20">
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
            <div className="mt-8 text-center">
              {hasMore && (
                <Button onClick={handleLoadMore} disabled={isLoadingMore}>
                  {isLoadingMore ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</> : 'Load More Pets'}
                </Button>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}

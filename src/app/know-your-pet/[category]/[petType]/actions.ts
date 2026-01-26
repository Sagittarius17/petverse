'use server';
/**
 * @fileOverview Fetches detailed information for a specific pet species, including its breeds.
 */
import { unstable_cache } from 'next/cache';
import { db } from '@/firebase/server';
import { PetBreed, PetCategory, PetSpecies, initialPetCategories } from '@/lib/initial-pet-data';

/**
 * Fetches the static data for a species and merges it with breeds from Firestore.
 * This server action is cached for 10 minutes to reduce database reads and improve performance.
 * @param categoryName The name of the category (e.g., "Mammals").
 * @param speciesName The name of the species (e.g., "Dogs").
 * @returns A PetSpecies object with its breeds, or null if not found.
 */
export const getSpeciesData = unstable_cache(
  async (categoryName: string, speciesName: string): Promise<PetSpecies | null> => {
    // 1. Find the static category and species data.
    const category = initialPetCategories.find(c => c.category.toLowerCase() === categoryName.toLowerCase());
    if (!category) return null;
    
    const species = category.species.find(s => s.name.toLowerCase() === speciesName.toLowerCase());
    if (!species) return null;

    // Make a deep copy to avoid mutating the original object.
    const speciesData: PetSpecies = JSON.parse(JSON.stringify(species));

    try {
      if (!db) {
        console.warn("Firestore is not initialized. Returning only static breeds.");
        return speciesData;
      }

      // 2. Fetch breeds for this specific species from Firestore.
      const breedsSnapshot = await db.collection('animalBreeds')
        .where('speciesName', '==', speciesName)
        .get();
        
      const firestoreBreeds: PetBreed[] = breedsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PetBreed[];

      // 3. Merge static and Firestore breeds, avoiding duplicates.
      const allBreeds = new Map<string, PetBreed>();

      // Add static breeds first
      if (speciesData.breeds) {
          speciesData.breeds.forEach(breed => allBreeds.set(breed.name.toLowerCase(), breed));
      }

      // Add/overwrite with Firestore breeds
      firestoreBreeds.forEach(breed => {
          const { speciesName: sName, categoryName: cName, ...restOfBreed } = breed as any;
          allBreeds.set(breed.name.toLowerCase(), restOfBreed);
      });

      speciesData.breeds = Array.from(allBreeds.values());

    } catch (error) {
      console.error(`Error fetching breeds for ${speciesName}:`, error);
      // Return the static data as a fallback.
    }

    return speciesData;
  },
  ['species-data'], // Cache key prefix
  { 
    revalidate: 600, // Revalidate every 10 minutes
    tags: ['species-data']
  }
);

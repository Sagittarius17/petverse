"use server";

import { PetBreed, PetCategory, initialPetCategories } from '@/lib/initial-pet-data';
import { db } from '@/firebase/server';

export async function getPetCategories(): Promise<PetCategory[]> {
  const allCategories = JSON.parse(JSON.stringify(initialPetCategories)) as PetCategory[];

  try {
    if (!db) {
        console.warn("Firestore is not initialized. Skipping fetching AI breeds.");
        return allCategories;
    }
    const aiBreedsSnapshot = await db.collection('aiBreeds').get();
    const aiBreeds: PetBreed[] = aiBreedsSnapshot.docs.map(doc => ({
      id: doc.id, // Store the Firestore document ID
      ...doc.data()
    })) as PetBreed[];

    aiBreeds.forEach(aiBreed => {
      const { speciesName, categoryName, ...restOfBreed } = aiBreed as any; // Destructure extra fields
      const category = allCategories.find(cat => cat.category.toLowerCase() === categoryName.toLowerCase());
      if (category) {
        const species = category.species.find(sp => sp.name.toLowerCase() === speciesName.toLowerCase());
        if (species) {
          if (!species.breeds) {
            species.breeds = [];
          }
          // Check if the breed already exists to avoid duplicates
          if (!species.breeds.some(b => b.name.toLowerCase() === restOfBreed.name.toLowerCase())) {
            species.breeds.push(restOfBreed);
          }
        }
      }
    });

  } catch (error) {
    console.error("Error fetching AI breeds from Firestore:", error);
    // Optionally, handle error more gracefully, e.g., return initial categories only
  }

  return allCategories;
}

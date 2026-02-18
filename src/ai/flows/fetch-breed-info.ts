'use server';
/**
 * @fileOverview Fetches detailed information about a specific pet breed using an AI model and saves it to Firestore.
 *
 * - fetchBreedInfo - A function that handles fetching and saving breed information.
 */

import { z } from 'zod';
import { PetBreedSchema } from '@/lib/data';
import { db } from '@/firebase/server';
import type { PetBreed } from '@/lib/data';
import { scrapeBreedFromWiki } from '@/lib/breed-scraper';

const FetchBreedInfoInputSchema = z.object({
  breedName: z.string().describe('The name of the breed to look up.'),
  speciesName: z.string().describe('The species of the breed (e.g., "Dog", "Cat").'),
  categoryName: z.string().optional().describe('The category of the breed (e.g., "Mammals").'),
});
export type FetchBreedInfoInput = z.infer<typeof FetchBreedInfoInputSchema>;

export async function fetchBreedInfo(input: FetchBreedInfoInput): Promise<PetBreed> {
  // Use the scraper instead of AI flow
  const result = await scrapeBreedFromWiki(input.breedName, input.speciesName);

  // If the result is empty or doesn't have a name, the breed is not real/found.
  if (!result || !result.name) {
    throw new Error(`The breed "${input.breedName}" could not be found. Please try a different name.`);
  }

  const breedId = `${input.speciesName.toLowerCase()}-${result.name.replace(/ /g, '-').toLowerCase()}`;

  // Construct the full breed data
  const breedData: PetBreed = {
    id: breedId,
    name: result.name,
    description: result.description || `A wonderful ${input.speciesName} looking for a home!`,
    imageIds: result.imageIds?.length ? result.imageIds : [`${input.speciesName.toLowerCase()}-1`],
    careDetails: result.careDetails || [],
  };

  // Save to Firestore if database is available
  if (db) {
    try {
      const breedRef = db.collection('animalBreeds').doc(breedId);

      const firestoreBreedData = {
        name: breedData.name,
        description: breedData.description,
        careDetails: breedData.careDetails,
        imageIds: breedData.imageIds,
        speciesName: input.speciesName,
        categoryName: input.categoryName || 'Mammals',
      };

      await breedRef.set(firestoreBreedData, { merge: true });
      return breedData;
    } catch (error) {
      console.error("Error saving breed to Firestore:", error);
    }
  }

  return breedData;
}

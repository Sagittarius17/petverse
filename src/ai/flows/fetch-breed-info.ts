'use server';
/**
 * @fileOverview Fetches detailed information about a specific pet breed using an AI model and saves it to Firestore.
 *
 * - fetchBreedInfo - A function that handles fetching and saving breed information.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { BreedCareDetailSchema, PetBreedSchema } from '@/lib/data';
import { db } from '@/firebase/server';
import { initialPetCategories } from '@/lib/initial-pet-data';

const FetchBreedInfoInputSchema = z.object({
  breedName: z.string().describe('The name of the breed to look up.'),
  speciesName: z.string().describe('The species of the breed (e.g., "Dog", "Cat").'),
  categoryName: z.string().optional().describe('The category of the breed (e.g., "Mammals").'),
});
export type FetchBreedInfoInput = z.infer<typeof FetchBreedInfoInputSchema>;


const FetchBreedInfoOutputSchema = PetBreedSchema.pick({ 
  name: true, 
  description: true, 
  careDetails: true,
  imageIds: true,
});
export type FetchBreedInfoOutput = z.infer<typeof FetchBreedInfoOutputSchema>;


export async function fetchBreedInfo(input: FetchBreedInfoInput): Promise<PetBreed> {
  const result = await fetchBreedInfoFlow(input);
  
  const breedId = `${input.speciesName.toLowerCase()}-${result.name.replace(/ /g, '-').toLowerCase()}`;
  const breedData = {
    id: breedId,
    ...result,
  };

  // Save to Firestore if database is available
  if (db) {
    try {
      // Changed from aiBreeds to animalBreeds
      const breedRef = db.collection('animalBreeds').doc(breedId);
      
      const firestoreBreedData = {
        ...result,
        speciesName: input.speciesName,
        categoryName: input.categoryName || 'Mammals', // Default to Mammals if not provided
      };
      
      await breedRef.set(firestoreBreedData, { merge: true });
      return breedData;
    } catch (error) {
      console.error("Error saving breed to Firestore:", error);
      // Still return the result even if DB save fails
    }
  }

  return breedData;
}


const fetchBreedInfoPrompt = ai.definePrompt({
    name: 'fetchBreedInfoPrompt',
    input: { schema: FetchBreedInfoInputSchema },
    output: { schema: FetchBreedInfoOutputSchema },
    prompt: `You are a pet expert and researcher. The user wants to learn about a specific breed of {{speciesName}}.

    Your task is to provide detailed information for the breed: "{{breedName}}".

    Generate a concise, one-sentence 'description' for this breed.

    Then, provide a comprehensive set of care details in the 'careDetails' array. Include topics like Overview, Temperament, Lifespan, etc.
    
    Assign a new, unique, and descriptive placeholder imageId for the breed, following the format 'ai-generated-[species]-[breed]-1'. For example, for a "Siberian Husky" dog, the imageId should be 'ai-generated-dog-siberian-husky-1'. For the imageIds array, please return a list containing just this one new ID.

    Ensure the output is structured according to the provided JSON schema.`,
});

const fetchBreedInfoFlow = ai.defineFlow(
  {
    name: 'fetchBreedInfoFlow',
    inputSchema: FetchBreedInfoInputSchema,
    outputSchema: FetchBreedInfoOutputSchema,
  },
  async (input) => {
    const { output } = await fetchBreedInfoPrompt(input);
    return output!;
  }
);

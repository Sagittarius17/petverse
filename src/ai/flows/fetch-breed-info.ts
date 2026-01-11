'use server';
/**
 * @fileOverview Fetches detailed information about a specific pet breed using an AI model and saves it to Firestore.
 *
 * - fetchBreedInfo - A function that handles fetching and saving breed information.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { PetBreedSchema } from '@/lib/data';
import { db } from '@/firebase/server';
import type { PetBreed } from '@/lib/data';

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
  
  if (!result.name) {
    throw new Error(`The breed "${input.breedName}" could not be found or is not a recognized breed. Please try a different name.`);
  }

  const breedId = `${input.speciesName.toLowerCase()}-${result.name.replace(/ /g, '-').toLowerCase()}`;
  const breedData: PetBreed = {
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

    Your FIRST task is to determine if the user-provided breed name, "{{breedName}}", is a real, recognized breed of {{speciesName}}.
    - If it is a real breed, find its most common, internationally recognized name. For example, if the user provides a local name like "Desi Kukur", you must identify it as "Indian Pariah Dog". Use this official name for the 'name' field in your response.
    - If it is NOT a real breed (e.g., a random string like "ghjtyghf", a fantasy creature, or a breed that does not exist for this species), you MUST NOT invent information. Respond with an empty object.

    If the breed is real, your SECOND task is to provide the following information:
    1.  'name': The most common, official name of the breed.
    2.  'description': A concise, one-sentence 'description' for this breed.
    3.  'careDetails': A comprehensive set of care details in an array. Include topics like Overview, Temperament, Lifespan, etc.
    4.  'imageIds': Assign a new, unique, and descriptive placeholder imageId for the breed, following the format 'ai-generated-[species]-[breed]-1'. For example, for a "Siberian Husky" dog, the imageId should be 'ai-generated-dog-siberian-husky-1'. Return a list containing just this one new ID.

    Ensure the output is structured according to the provided JSON schema. If the breed is not real, return an empty object.`,
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

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
}).partial(); // Make all fields optional
export type FetchBreedInfoOutput = z.infer<typeof FetchBreedInfoOutputSchema>;


export async function fetchBreedInfo(input: FetchBreedInfoInput): Promise<PetBreed> {
  const result = await fetchBreedInfoFlow(input);
  
  // If the result is empty or doesn't have a name, the breed is not real.
  if (!result || !result.name) {
    throw new Error(`The breed "${input.breedName}" could not be found or is not a recognized breed. Please try a different name.`);
  }

  const breedId = `${input.speciesName.toLowerCase()}-${result.name.replace(/ /g, '-').toLowerCase()}`;
  
  // Construct the full breed data, ensuring all required fields have defaults if not provided by AI
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
      // Changed from aiBreeds to animalBreeds
      const breedRef = db.collection('animalBreeds').doc(breedId);
      
      const firestoreBreedData = {
        name: breedData.name,
        description: breedData.description,
        careDetails: breedData.careDetails,
        imageIds: breedData.imageIds,
        speciesName: input.speciesName,
        categoryName: input.categoryName || 'Mammals', // Default to Mammals if not provided
      };
      
      await breedRef.set(firestoreBreedData, { merge: true });
      return breedData;
    } catch (error) {
      console.error("Error saving breed to Firestore:", error);
      // Still return the result even if DB save fails, but now we know it's a valid breed
    }
  }

  return breedData;
}

// New schema for the text-only output from the initial prompt
const BreedInfoTextOutputSchema = PetBreedSchema.pick({
  name: true,
  description: true,
  careDetails: true,
}).partial();

const fetchBreedInfoPrompt = ai.definePrompt({
    name: 'fetchBreedInfoPrompt',
    input: { schema: FetchBreedInfoInputSchema },
    output: { schema: BreedInfoTextOutputSchema },
    prompt: `You are a pet expert and researcher. The user wants to learn about a specific breed of {{speciesName}}.

    Your FIRST task is to determine if the user-provided breed name, "{{breedName}}", is a real, recognized breed of {{speciesName}}.
    - If it is a real breed, find its most common, internationally recognized name. For example, if the user provides a local name like "Desi Kukur", you must identify it as "Indian Pariah Dog". Use this official name for the 'name' field in your response.
    - If it is NOT a real breed (e.g., a random string like "ghjtyghf", a fantasy creature, or a breed that does not exist for this species), you MUST NOT invent information. Respond with a completely empty object.

    If the breed is real, your SECOND task is to provide the following information:
    1.  'name': The most common, official name of the breed.
    2.  'description': A concise, one-sentence 'description' for this breed.
    3.  'careDetails': A comprehensive set of care details in an array. Include topics like Overview, Temperament, Lifespan, etc.

    Ensure the output is structured according to the provided JSON schema. If the breed is not real, return an empty object.`,
});

const fetchBreedInfoFlow = ai.defineFlow(
  {
    name: 'fetchBreedInfoFlow',
    inputSchema: FetchBreedInfoInputSchema,
    outputSchema: FetchBreedInfoOutputSchema,
  },
  async (input) => {
    // 1. Get text info from the prompt
    const { output: textOutput } = await fetchBreedInfoPrompt(input);
    if (!textOutput || !textOutput.name) {
      return {}; // Not a real breed, return empty object.
    }

    // 2. If it's a real breed, generate images in parallel.
    const imagePrompts = [
        `A high-quality, photorealistic image of a ${textOutput.name}.`,
        `A cute ${textOutput.name} playing outdoors in a sunny field.`,
        `A professional, close-up portrait of a ${textOutput.name}, highlighting its features.`
    ];
    
    const imageGenerationPromises = imagePrompts.map(prompt => 
        ai.generate({
            model: 'googleai/imagen-4.0-fast-generate-001',
            prompt: prompt,
        })
    );

    const imageResults = await Promise.all(imageGenerationPromises);
    
    // Filter out any failed generations and get the data URIs.
    const imageUrls = imageResults
      .map(result => result.media?.url)
      .filter((url): url is string => !!url);

    // 3. Combine text info and image URLs and return
    return {
      ...textOutput,
      imageIds: imageUrls,
    };
  }
);

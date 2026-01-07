'use server';
/**
 * @fileOverview Fetches detailed information about a specific pet breed using an AI model and saves it to Firestore.
 *
 * - fetchBreedInfo - A function that handles fetching and saving breed information.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { BreedCareDetailSchema } from '@/lib/data';
import { db } from '@/firebase/server';

const FetchBreedInfoInputSchema = z.object({
  breedName: z.string().describe('The name of the breed to look up.'),
  speciesName: z.string().describe('The species of the breed (e.g., "Dog", "Cat").'),
  categoryName: z.string().optional().describe('The category of the breed (e.g., "Mammals").'),
});
export type FetchBreedInfoInput = z.infer<typeof FetchBreedInfoInputSchema>;

const FetchBreedInfoOutputSchema = z.object({
  name: z.string().describe('The official name of the breed.'),
  description: z.string().describe('A brief, one-sentence description of the breed.'),
  careDetails: z.array(BreedCareDetailSchema).describe('An array of detailed care topics for the breed.'),
});
export type FetchBreedInfoOutput = z.infer<typeof FetchBreedInfoOutputSchema>;


export async function fetchBreedInfo(input: FetchBreedInfoInput): Promise<FetchBreedInfoOutput & { imageId: string }> {
  const result = await fetchBreedInfoFlow(input);
  
  // Save to Firestore if database is available
  if (db) {
    try {
      const breedId = `${input.speciesName.toLowerCase()}-${result.name.replace(/ /g, '-').toLowerCase()}`;
      const breedRef = db.collection('aiBreeds').doc(breedId);
      
      const breedData = {
        ...result,
        speciesName: input.speciesName,
        categoryName: input.categoryName || 'Mammals', // Default to Mammals if not provided
        imageId: `know-${input.speciesName.toLowerCase().split(' ')[0]}`,
      };
      
      await breedRef.set(breedData, { merge: true });
      return breedData;
    } catch (error) {
      console.error("Error saving breed to Firestore:", error);
    }
  }

  return {
    ...result,
    imageId: `know-${input.speciesName.toLowerCase().split(' ')[0]}`,
  };
}


const fetchBreedInfoPrompt = ai.definePrompt({
    name: 'fetchBreedInfoPrompt',
    input: { schema: FetchBreedInfoInputSchema },
    output: { schema: FetchBreedInfoOutputSchema },
    prompt: `You are a pet expert and researcher. The user wants to learn about a specific breed of {{speciesName}}.

    Your task is to provide detailed information for the breed: "{{breedName}}".

    Generate a concise, one-sentence 'description' for this breed.

    Then, provide a comprehensive set of care details in the 'careDetails' array. Include the following topics if they are relevant to the species:
    - Overview
    - Temperament
    - Lifespan
    - Size
    - Diet
    - Exercise Needs
    - Grooming
    - Health Issues
    - Training Difficulty
    - Suitability for Families
    - Climate Adaptability
    - Living Space Requirements
    - Social Needs
    - Fun Facts

    For each topic, provide a helpful and informative paragraph. Ensure the output is structured according to the provided JSON schema.`,
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

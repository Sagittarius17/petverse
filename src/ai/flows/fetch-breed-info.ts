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


export async function fetchBreedInfo(input: FetchBreedInfoInput): Promise<z.infer<typeof PetBreedWithImagesSchema>> {
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
      };
      
      await breedRef.set(breedData, { merge: true });
      return breedData;
    } catch (error) {
      console.error("Error saving breed to Firestore:", error);
      // Fallback to returning data without saving
      return {
        ...result,
        imageIds: result.imageIds || []
      };
    }
  }

  // Fallback for when DB is not available
  return {
    ...result,
    imageIds: result.imageIds || []
  };
}

const PetBreedWithImagesSchema = PetBreedSchema.extend({
    imageIds: z.array(z.string()).describe("An array of generated image data URIs."),
});

const fetchBreedInfoPrompt = ai.definePrompt({
    name: 'fetchBreedInfoPrompt',
    input: { schema: FetchBreedInfoInputSchema },
    output: { schema: FetchBreedInfoOutputSchema },
    prompt: `You are a pet expert and researcher. The user wants to learn about a specific pet breed.

    Your task is to provide detailed information for the breed: '{{breedName}}' of the species '{{speciesName}}'.

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

const generateImagePrompt = new Array(3).fill(null).map((_, i) =>
  ai.definePrompt({
    name: `generateBreedImagePrompt_${i}`,
    input: { schema: z.object({ breedName: z.string(), speciesName: z.string() }) },
    output: { format: "media" },
    prompt: `A high-quality, photorealistic image of a {{speciesName}} of the {{breedName}} breed.`,
    model: 'googleai/imagen-4.0-fast-generate-001'
  })
);

const fetchBreedInfoFlow = ai.defineFlow(
  {
    name: 'fetchBreedInfoFlow',
    inputSchema: FetchBreedInfoInputSchema,
    outputSchema: PetBreedWithImagesSchema,
  },
  async (input) => {
    const [info, ...images] = await Promise.all([
      fetchBreedInfoPrompt(input),
      ...generateImagePrompt.map(p => p(input))
    ]);

    const imageUrls = images.map(img => img.output?.url).filter((url): url is string => !!url);
    
    return {
      ...info.output!,
      imageIds: imageUrls,
    };
  }
);

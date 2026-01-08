'use server';
/**
 * @fileOverview Fetches detailed information about a specific pet breed using an AI model and saves it to Firestore.
 *
 * - fetchBreedInfo - A function that handles fetching and saving breed information.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { FetchBreedInfoOutputSchema, PetBreedWithImagesSchema } from '@/lib/data';
import { db } from '@/firebase/server';

const FetchBreedInfoInputSchema = z.object({
  breedName: z.string().describe('The name of the breed to look up.'),
  speciesName: z.string().describe('The species of the breed (e.g., "Dog", "Cat").'),
  categoryName: z.string().optional().describe('The category of the breed (e.g., "Mammals").'),
});
export type FetchBreedInfoInput = z.infer<typeof FetchBreedInfoInputSchema>;


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
        speciesName: input.speciesName,
        categoryName: input.categoryName || 'Mammals',
      };
    }
  }

  // Fallback for when DB is not available
  return {
      ...result,
      speciesName: input.speciesName,
      categoryName: input.categoryName || 'Mammals',
  };
}

const fetchBreedInfoPrompt = ai.definePrompt({
    name: 'fetchBreedInfoPrompt',
    input: { schema: FetchBreedInfoInputSchema },
    output: { schema: FetchBreedInfoOutputSchema },
    prompt: `You are a pet expert and researcher. The user wants to learn about a specific pet breed.

    Your task is to provide detailed information for the breed: '{{breedName}}' of the species '{{speciesName}}'.

    First, determine if '{{breedName}}' is a real, recognized breed for the '{{speciesName}}' species.
    - If it is NOT a real breed, set the 'isReal' output field to false and DO NOT generate any other information.
    - If it IS a real breed, set 'isReal' to true and proceed to generate the following information:

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

const generateImageForBreed = ai.defineTool(
    {
        name: 'generateImageForBreed',
        description: 'Generates a photorealistic image for a given pet breed and species.',
        inputSchema: z.object({
            breedName: z.string(),
            speciesName: z.string(),
        }),
        outputSchema: z.string().describe('The data URI of the generated image.'),
    },
    async (input) => {
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.5-flash-image-preview',
            prompt: `generate a high-quality, photorealistic image of a ${input.speciesName} of the ${input.breedName} breed.`,
            config: {
                responseModalities: ['IMAGE'],
            },
        });
        return media.url;
    }
);


const fetchBreedInfoFlow = ai.defineFlow(
  {
    name: 'fetchBreedInfoFlow',
    inputSchema: FetchBreedInfoInputSchema,
    outputSchema: PetBreedWithImagesSchema,
  },
  async (input) => {
    try {
      const [infoResult, imageUrl] = await Promise.all([
        fetchBreedInfoPrompt(input),
        generateImageForBreed(input),
      ]);
  
      const info = infoResult.output;
      
      if (!info || !info.isReal) {
        throw new Error(`'${input.breedName}' is not a recognized ${input.speciesName} breed.`);
      }

      const imageUrls = imageUrl ? [imageUrl] : [];
      
      return {
        ...info,
        imageIds: imageUrls,
      };

    } catch (error) {
       if (error instanceof Error && error.message.includes("is not a recognized")) {
         throw error; // Re-throw the specific error for the client to catch
       }
      console.warn("Image generation or full info fetch failed. Trying text-only. Error:", error);
      // If image generation or the main call fails, try one more time for just the text.
      const infoResult = await fetchBreedInfoPrompt(input);
      const info = infoResult.output;

      if (!info || !info.isReal) {
        throw new Error(`'${input.breedName}' is not a recognized ${input.speciesName} breed.`);
      }
      
      return {
        ...info,
        imageIds: [], // Return empty array for images
      };
    }
  }
);

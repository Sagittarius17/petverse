'use server';
/**
 * @fileOverview Fetches detailed information about a specific pet breed using an AI model.
 *
 * - fetchBreedInfo - A function that handles fetching breed information.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { BreedCareDetailSchema } from '@/lib/data';

const FetchBreedInfoInputSchema = z.object({
  breedName: z.string().describe('The name of the breed to look up.'),
  speciesName: z.string().describe('The species of the breed (e.g., "Dog", "Cat").'),
});
export type FetchBreedInfoInput = z.infer<typeof FetchBreedInfoInputSchema>;

const FetchBreedInfoOutputSchema = z.object({
  name: z.string().describe('The official name of the breed.'),
  description: z.string().describe('A brief, one-sentence description of the breed.'),
  careDetails: z.array(BreedCareDetailSchema).describe('An array of detailed care topics for the breed.'),
});
export type FetchBreedInfoOutput = z.infer<typeof FetchBreedInfoOutputSchema>;


export async function fetchBreedInfo(input: FetchBreedInfoInput): Promise<FetchBreedInfoOutput> {
  return fetchBreedInfoFlow(input);
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

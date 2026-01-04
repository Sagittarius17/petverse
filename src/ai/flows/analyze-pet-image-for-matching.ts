'use server';
/**
 * @fileOverview Analyzes a pet image to identify key attributes for matching.
 *
 * - analyzePetImageForMatching - A function that handles the pet image analysis process.
 * - AnalyzePetImageForMatchingInput - The input type for the analyzePetImageForMatching function.
 * - AnalyzePetImageForMatchingOutput - The return type for the analyzePetImageForMatching function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePetImageForMatchingInputSchema = z.object({
  petImageDataUri: z
    .string()
    .describe(
      "A photo of a pet, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzePetImageForMatchingInput = z.infer<typeof AnalyzePetImageForMatchingInputSchema>;

const AnalyzePetImageForMatchingOutputSchema = z.object({
  attributeSummary: z
    .string()
    .describe("A summary of key attributes identified in the pet's image that would aid in identification."),
  isAnalysisHelpful: z
    .boolean()
    .describe('Whether the AI believes the attribute summary will be helpful in finding a match.'),
});
export type AnalyzePetImageForMatchingOutput = z.infer<typeof AnalyzePetImageForMatchingOutputSchema>;

export async function analyzePetImageForMatching(
  input: AnalyzePetImageForMatchingInput
): Promise<AnalyzePetImageForMatchingOutput> {
  return analyzePetImageForMatchingFlow(input);
}

const analyzePetImagePrompt = ai.definePrompt({
  name: 'analyzePetImagePrompt',
  input: {schema: AnalyzePetImageForMatchingInputSchema},
  output: {schema: AnalyzePetImageForMatchingOutputSchema},
  prompt: `You are an AI assistant helping to find lost pets. A user will provide an image of their lost pet.

You will analyze the image and identify key attributes such as species, breed (if identifiable), color, markings, and any other unique features.

Based on your analysis, create a concise summary of these attributes that would help someone identify the pet in found pet listings. Also, make a determination as to whether providing a summary of key attributes will be helpful in finding a match.

Image: {{media url=petImageDataUri}}

Attribute Summary:`,
});

const analyzePetImageForMatchingFlow = ai.defineFlow(
  {
    name: 'analyzePetImageForMatchingFlow',
    inputSchema: AnalyzePetImageForMatchingInputSchema,
    outputSchema: AnalyzePetImageForMatchingOutputSchema,
  },
  async input => {
    const {output} = await analyzePetImagePrompt(input);
    return output!;
  }
);

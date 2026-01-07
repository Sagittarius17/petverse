'use server';

import { fetchBreedInfo, FetchBreedInfoInput, FetchBreedInfoOutput } from '@/ai/flows/fetch-breed-info';
import { z } from 'zod';

const actionInputSchema = z.object({
  breedName: z.string(),
  speciesName: z.string(),
});

export async function handleAiBreedSearch(
  input: FetchBreedInfoInput
): Promise<{ data?: FetchBreedInfoOutput; error?: string }> {
  const parsedInput = actionInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return { error: 'Invalid input.' };
  }

  try {
    const output = await fetchBreedInfo(parsedInput.data);
    return { data: output };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during AI search.';
    return { error: errorMessage };
  }
}

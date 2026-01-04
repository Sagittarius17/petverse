"use server";

import { analyzePetImageForMatching, AnalyzePetImageForMatchingInput, AnalyzePetImageForMatchingOutput } from "@/ai/flows/analyze-pet-image-for-matching";
import { z } from "zod";

const actionInputSchema = z.object({
  petImageDataUri: z.string(),
});

export async function handleLostPetReport(
    input: AnalyzePetImageForMatchingInput
  ): Promise<{ data?: AnalyzePetImageForMatchingOutput; error?: string }> {
  const parsedInput = actionInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return { error: "Invalid input." };
  }

  try {
    const output = await analyzePetImageForMatching(parsedInput.data);
    
    // In a real application, you would now save the report and the analysis to your database.
    // e.g., db.lostPetReports.create({ ...otherFormData, analysis: output });

    return { data: output };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during AI analysis.";
    return { error: errorMessage };
  }
}

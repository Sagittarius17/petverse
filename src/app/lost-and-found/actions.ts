"use server";

import { analyzePetImageForMatching, AnalyzePetImageForMatchingOutput } from "@/ai/flows/analyze-pet-image-for-matching";
import { z } from "zod";
import { db } from '@/firebase/server';
import { FieldValue } from 'firebase-admin/firestore';

const actionInputSchema = z.object({
  reportType: z.enum(['Lost', 'Found']),
  ownerName: z.string(),
  contactEmail: z.string().email(),
  petName: z.string(),
  lastSeenLocation: z.string(),
  petImageDataUri: z.string(),
});

export async function handleLostPetReport(
    input: z.infer<typeof actionInputSchema>
  ): Promise<{ success: boolean; error?: string }> {
  const parsedInput = actionInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return { success: false, error: "Invalid input." };
  }

  try {
    const { petImageDataUri, ...reportData } = parsedInput.data;
    
    // 1. Analyze the image
    const analysisOutput = await analyzePetImageForMatching({ petImageDataUri });

    if (!analysisOutput) {
        throw new Error('AI analysis did not return a result.');
    }
    
    // 2. Construct the full report
    const newReport = {
        ...reportData,
        petImage: petImageDataUri, // Storing data URI directly for simplicity
        analysis: analysisOutput,
        reportDate: FieldValue.serverTimestamp(),
    };

    // 3. Save to Firestore
    await db.collection('lost_found_reports').add(newReport);
    
    return { success: true };
  } catch (e) {
    console.error("Error handling lost pet report:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during submission.";
    return { success: false, error: errorMessage };
  }
}

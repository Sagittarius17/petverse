import { NextResponse } from 'next/server';
import { petCategories } from '@/lib/data';
import { promises as fs } from 'fs';
import path from 'path';

// A simple representation of an AI model call
async function generateBreedInfo(breed: string, species: string) {
    // In a real app, this would be a call to a powerful AI model (e.g., Google's Gemini)
    // For this example, we'll create plausible, structured data.
    console.log(`AI: Generating info for ${breed} (${species})...`);

    // Simulate network delay for AI generation
    await new Promise(res => setTimeout(res, 1500));

    // Basic validation
    if (!breed || !species) {
        throw new Error("Breed and species names are required.");
    }

    // This is a simplified placeholder for a real AI's structured output.
    const newBreedData = {
        name: breed,
        description: `A wonderful ${species} known for its unique traits.`,
        imageId: `know-${species.toLowerCase().slice(0, -1)}`,
        careDetails: [
            { title: 'Overview', content: `The ${breed} is a distinct breed with a rich history.` },
            { title: 'Temperament', content: 'Generally friendly and intelligent, but varies by individual.' },
            { title: 'Lifespan', content: 'Typically 10-15 years, with proper care.' },
            { title: 'Diet', content: 'Requires a balanced diet suitable for the species.' },
            { title: 'Exercise Needs', content: 'Moderate to high, depending on the breed\'s energy levels.' },
            { title: 'Fun Facts', content: `The ${breed} is recognized by major kennel clubs.` }
        ]
    };

    console.log("AI: Generation complete.");
    return newBreedData;
}

export async function POST(request: Request) {
  const { breed, species } = await request.json();

  if (!breed || !species) {
    return NextResponse.json({ error: 'Breed and species are required.' }, { status: 400 });
  }

  // Find the correct category and species to update
  const categoryIndex = petCategories.findIndex(cat => 
    cat.species.some(sp => sp.name.toLowerCase() === species.toLowerCase())
  );
  if (categoryIndex === -1) {
    return NextResponse.json({ error: `Category for species \"${species}\" not found.` }, { status: 404 });
  }

  const speciesIndex = petCategories[categoryIndex].species.findIndex(
    sp => sp.name.toLowerCase() === species.toLowerCase()
  );
  if (speciesIndex === -1) {
    return NextResponse.json({ error: `Species \"${species}\" not found.` }, { status: 404 });
  }

  // Check if breed already exists
  const breedExists = petCategories[categoryIndex].species[speciesIndex].breeds?.some(
      b => b.name.toLowerCase() === breed.toLowerCase()
  );

  if (breedExists) {
      return NextResponse.json({ error: `Breed \"${breed}\" already exists in our database.` }, { status: 409 });
  }

  try {
    // 1. Generate new breed data using our AI placeholder
    const newBreed = await generateBreedInfo(breed, species);

    // 2. Add the new breed to the in-memory data object
    petCategories[categoryIndex].species[speciesIndex].breeds?.push(newBreed);

    // 3. Construct the full path to the data file
    const dataFilePath = path.join(process.cwd(), 'src', 'lib', 'data.ts');

    // 4. Create the updated file content as a string
    // IMPORTANT: This is a simplified approach. A more robust solution would
    // use an Abstract Syntax Tree (AST) parser to safely modify the code.
    // For this project, string manipulation is sufficient.
    const updatedFileContent = `// IMPORTANT: This file is dynamically updated by an AI. Do not manually edit.

` +
        `import { AnalyzePetImageForMatchingOutput } from "@/ai/flows/analyze-pet-image-for-matching";

` +
        `// Interface definitions remain the same...
` +
        `export interface Pet { id: string; name: string; species: 'Dog' | 'Cat' | 'Bird' | 'Other'; breed: string; age: string; gender: 'Male' | 'Female'; imageId: string; description: string; }
` +
        `export interface CareGuide { id: string; title: string; petType: 'Dogs' | 'Cats' | 'Birds' | 'Fish' | 'All Pets'; summary: string; imageId: string; content: string; }
` +
        `export interface LostPetReport { id: string; ownerName: string; contactEmail: string; petName: string; reportType: 'Lost' | 'Found'; lastSeenLocation: string; petImage: string; analysis: AnalyzePetImageForMatchingOutput; }
` +
        `export interface PetBreed { name: string; description: string; imageId: string; careDetails: { title: string; content: string; }[]; }
` +
        `export interface PetSpecies { name: string; description: string; imageId: string; breeds?: PetBreed[]; careDetails: { title: string; content: string; }[]; }
` +
        `export interface PetCategory { category: string; description: string; species: PetSpecies[]; }

` +
        `export const allPets: Pet[] = ${JSON.stringify(allPets, null, 2)};

` +
        `export const featuredPets = allPets.slice(0, 4);

` +
        `export const allCareGuides: CareGuide[] = ${JSON.stringify(allCareGuides, null, 2)};

` +
        `export const featuredCareGuides = allCareGuides.slice(0, 3);

` +
        `export const petCategories: PetCategory[] = ${JSON.stringify(petCategories, null, 2)};
`;

    // 5. Write the updated content back to the file
    await fs.writeFile(dataFilePath, updatedFileContent, 'utf8');

    // 6. Return the newly created breed info to the client
    return NextResponse.json(newBreed, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

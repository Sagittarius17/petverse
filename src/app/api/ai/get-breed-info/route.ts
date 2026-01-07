import { NextResponse } from 'next/server';
import { initialPetCategories } from '@/lib/initial-pet-data'; // Import initial data
import { db } from '@/firebase/server'; // Import server-side Firestore instance
import { PetBreed } from '@/lib/data'; // Import PetBreed interface

// A simple representation of an AI model call
async function generateBreedInfo(breed: string, species: string, category: string): Promise<PetBreed> {
    // In a real app, this would be a call to a powerful AI model (e.g., Google's Gemini)
    // For this example, we'll create plausible, structured data.
    console.log(`AI: Generating info for ${breed} (${species}) in category ${category}...`);

    // Simulate network delay for AI generation
    await new Promise(res => setTimeout(res, 1500));

    // Basic validation
    if (!breed || !species || !category) {
        throw new Error("Breed, species, and category names are required.");
    }

    // This is a simplified placeholder for a real AI's structured output.
    const newBreedData: PetBreed = {
        name: breed,
        description: `A wonderful ${species} known for its unique traits.`,
        imageId: `know-${species.toLowerCase().split(' ')[0]}`, // Simple imageId logic
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

  // Find the correct category for the species from initial data
  let categoryName = '';
  let foundSpecies = false;

  for (const cat of initialPetCategories) {
      const speciesInCat = cat.species.find(sp => sp.name.toLowerCase() === species.toLowerCase());
      if (speciesInCat) {
          categoryName = cat.category;
          foundSpecies = true;
          break;
      }
  }

  if (!foundSpecies) {
      return NextResponse.json({ error: `Species "${species}" not found in initial data.` }, { status: 404 });
  }

  try {
    // Check if breed already exists in Firestore to avoid duplicates
    const aiBreedsRef = db.collection('aiBreeds');
    const existingBreedSnapshot = await aiBreedsRef
      .where('speciesName', '==', species)
      .where('name', '==', breed)
      .get();

    if (!existingBreedSnapshot.empty) {
      return NextResponse.json({ error: `Breed "${breed}" already exists in our database.` }, { status: 409 });
    }

    // 1. Generate new breed data using our AI placeholder
    const newBreed = await generateBreedInfo(breed, species, categoryName);

    // 2. Add the new breed to Firestore
    const docRef = await aiBreedsRef.add({
        ...newBreed,
        speciesName: species, // Store species name for querying
        categoryName: categoryName, // Store category name for querying
        createdAt: new Date().toISOString(), // Add a timestamp
    });

    // 3. Return the newly created breed info to the client, including its Firestore ID
    return NextResponse.json({ id: docRef.id, ...newBreed }, { status: 201 });

  } catch (error: any) {
    console.error("Error in AI breed info generation/saving:", error);
    return NextResponse.json({ error: error.message || 'Failed to generate or save breed information.' }, { status: 500 });
  }
}
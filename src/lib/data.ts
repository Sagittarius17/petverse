import { type AnalyzePetImageForMatchingOutput } from "@/ai/flows/analyze-pet-image-for-matching";
import { PetCategory, PetSpecies, PetBreed, BreedCareDetail, initialPetCategories } from './initial-pet-data';
import { z } from 'zod';

export const BreedCareDetailSchema = z.object({
  title: z.string().describe('The title of the care detail (e.g., "Temperament", "Lifespan").'),
  content: z.string().describe('The detailed content for this care topic.'),
});

export const PetBreedSchema = z.object({
  name: z.string(),
  description: z.string(),
  imageId: z.string(),
  careDetails: z.array(BreedCareDetailSchema),
});


export interface Pet {
  id: string;
  name: string;
  species: 'Dog' | 'Cat' | 'Bird' | 'Other';
  breed: string;
  age: string;
  gender: 'Male' | 'Female';
  imageId: string;
  description: string;
}

export interface CareGuide {
  id: string;
  title: string;
  petType: 'Dogs' | 'Cats' | 'Birds' | 'Fish' | 'All Pets';
  summary: string;
  imageId: string;
  content: string;
}

export interface LostPetReport {
  id:string;
  ownerName: string;
  contactEmail: string;
  petName: string;
  reportType: 'Lost' | 'Found';
  lastSeenLocation: string;
  petImage: string; // URL of the uploaded image
  analysis: AnalyzePetImageForMatchingOutput;
}

// Re-export interfaces from initial-pet-data to maintain external access
export type { PetCategory, PetSpecies, PetBreed, BreedCareDetail };
export const petCategories = initialPetCategories;


export const allPets: Pet[] = [
  { id: 'p1', name: 'Buddy', species: 'Dog', breed: 'Golden Retriever', age: '2 years', gender: 'Male', imageId: 'dog-1', description: 'A very good boy who loves to play fetch.' },
  { id: 'p2', name: 'Lucy', species: 'Dog', breed: 'German Shepherd', age: '3 years', gender: 'Female', imageId: 'dog-2', description: 'Loyal and intelligent, great with families.' },
  { id: 'p3', name: 'Mochi', species: 'Cat', breed: 'Siamese', age: '1 year', gender: 'Female', imageId: 'cat-1', description: 'A curious and vocal cat who loves attention.' },
  { id: 'p4', name: 'Oliver', species: 'Cat', breed: 'Persian', age: '6 months', gender: 'Male', imageId: 'cat-2', description: 'A fluffy kitten who loves to cuddle.' },
  { id: 'p5', name: 'Charlie', species: 'Dog', breed: 'Poodle', age: '5 years', gender: 'Male', imageId: 'dog-3', description: 'Hypoallergenic and very smart.' },
  { id: 'p6', name: 'Max', species: 'Dog', breed: 'Beagle', age: '4 years', gender: 'Male', imageId: 'dog-4', description: 'A happy-go-lucky dog with a great sense of smell.' },
  { id: 'p7', name: 'Luna', species: 'Cat', breed: 'Domestic Shorthair', age: '2 years', gender: 'Female', imageId: 'cat-3', description: 'A sleek black cat, independent but affectionate.' },
  { id: 'p8', name: 'Simba', species: 'Cat', breed: 'Tabby', age: '1.5 years', gender: 'Male', imageId: 'cat-4', description: 'Loves to sunbathe and watch the world go by.' },
  { id: 'p9', name: 'Kiwi', species: 'Bird', breed: 'Parrot', age: '10 years', gender: 'Male', imageId: 'bird-1', description: 'A colorful parrot that can mimic some words.' },
  { id: 'p10', name: 'Sunny', species: 'Bird', breed: 'Canary', age: '1 year', gender: 'Female', imageId: 'bird-2', description: 'A beautiful singer who will brighten your day.' },
];

export const featuredPets = allPets.slice(0, 4);

export const allCareGuides: CareGuide[] = [
    {
      id: 'cg1',
      title: 'Beginner\'s Guide to Dog Care',
      petType: 'Dogs',
      summary: 'Learn the basics of feeding, grooming, and training your new dog.',
      imageId: 'guide-dog',
      content: `
### Welcome to Dog Ownership!

Bringing a new dog into your home is an exciting experience. To ensure your friend has a happy and healthy life, it\'s important to understand the basics of their care.

#### Nutrition
A balanced diet is crucial for your dog\'s health. Choose a high-quality dog food that is appropriate for their age, size, and activity level.

#### Grooming
Regular grooming keeps your dog\'s coat and skin healthy. The frequency of grooming depends on the breed and coat type.

#### Training and Socialization
Training is essential for a well-behaved dog. Start with basic commands like "sit", "stay", and "come.\"`
    },
];

export const featuredCareGuides = allCareGuides.slice(0, 3);

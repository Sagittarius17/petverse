import { type AnalyzePetImageForMatchingOutput } from "@/ai/flows/analyze-pet-image-for-matching";
import { PetCategory, PetSpecies, BreedCareDetail, initialPetCategories } from './initial-pet-data';
import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

export const BreedCareDetailSchema = z.object({
  title: z.string().describe('The title of the care detail (e.g., "Temperament", "Lifespan").'),
  content: z.string().describe('The detailed content for this care topic.'),
});

export const PetBreedSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string(),
  imageIds: z.array(z.string()),
  careDetails: z.array(BreedCareDetailSchema),
});
export type PetBreed = z.infer<typeof PetBreedSchema>;

export const FetchBreedInfoOutputSchema = z.object({
  isReal: z.boolean().describe("Whether or not the breed is a real, recognized breed."),
  name: z.string().describe('The official name of the breed.').optional(),
  description: z.string().describe('A brief, one-sentence description of the breed.').optional(),
  careDetails: z.array(BreedCareDetailSchema).describe('An array of detailed care topics for the breed.').optional(),
});

export const PetBreedWithImagesSchema = FetchBreedInfoOutputSchema.extend({
    imageIds: z.array(z.string()).describe("An array of generated image data URIs."),
    speciesName: z.string().optional(),
    categoryName: z.string().optional(),
});

export interface Pet {
  id: string;
  name: string;
  species: 'Dog' | 'Cat' | 'Bird' | 'Other' | 'Rabbit' | 'Hamster' | 'Lizard' | 'Fish';
  breed: string;
  age: string;
  gender: 'Male' | 'Female';
  location?: string;
  imageId: string;
  description: string;
  isAdoptable?: boolean;
  viewCount?: number;
  userId?: string;
  createdAt?: Timestamp;
  adoptedAt?: Timestamp;
}

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    displayName?: string;
    profilePicture?: string;
    firstName?: string;
    lastName?: string;
    createdAt?: Timestamp;
    role?: 'User' | 'Admin' | 'Superuser' | 'Superadmin';
    status?: 'Active' | 'Inactive';
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
  reportDate?: Timestamp;
  userId?: string;
}

export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    subtotal: number;
    paymentMethod: string;
    razorpayPaymentId: string;
    status: 'Placed' | 'Shipped' | 'Delivered' | 'Cancelled';
    orderDate: Timestamp;
}


// Re-export interfaces from initial-pet-data to maintain external access
export type { PetCategory, PetSpecies, BreedCareDetail };
export const petCategories = initialPetCategories;


export const allPets: Pet[] = [
  { id: 'p1', name: 'Buddy', species: 'Dog', breed: 'Golden Retriever', age: '2 years', gender: 'Male', imageId: 'dog-golden-retriever-1', description: 'A very good boy who loves to play fetch.', isAdoptable: true },
  { id: 'p2', name: 'Lucy', species: 'Dog', breed: 'German Shepherd', age: '3 years', gender: 'Female', imageId: 'dog-german-shepherd-1', description: 'Loyal and intelligent, great with families.', isAdoptable: true },
  { id: 'p3', name: 'Mochi', species: 'Cat', breed: 'Siamese', age: '1 year', gender: 'Female', imageId: 'cat-siamese-1', description: 'A curious and vocal cat who loves attention.', isAdoptable: true },
  { id: 'p4', name: 'Oliver', species: 'Cat', breed: 'Persian', age: '6 months', gender: 'Male', imageId: 'cat-persian-2', description: 'A fluffy kitten who loves to cuddle.', isAdoptable: false },
  { id: 'p5', name: 'Charlie', species: 'Dog', breed: 'Poodle', age: '5 years', gender: 'Male', imageId: 'dog-poodle-1', description: 'Hypoallergenic and very smart.', isAdoptable: true },
  { id: 'p6', name: 'Max', species: 'Dog', breed: 'Beagle', age: '4 years', gender: 'Male', imageId: 'dog-beagle-1', description: 'A happy-go-lucky dog with a great sense of smell.', isAdoptable: true },
  { id: 'p7', name: 'Luna', species: 'Cat', breed: 'Domestic Shorthair', age: '2 years', gender: 'Female', imageId: 'cat-3', description: 'A sleek black cat, independent but affectionate.', isAdoptable: false },
  { id: 'p8', name: 'Simba', species: 'Cat', breed: 'Tabby', age: '1.5 years', gender: 'Male', imageId: 'cat-4', description: 'Loves to sunbathe and watch the world go by.', isAdoptable: true },
  { id: 'p9', name: 'Kiwi', species: 'Bird', breed: 'Parrot', age: '10 years', gender: 'Male', imageId: 'bird-1', description: 'A colorful parrot that can mimic some words.', isAdoptable: true },
  { id: 'p10', name: 'Sunny', species: 'Bird', breed: 'Canary', age: '1 year', gender: 'Female', imageId: 'bird-2', description: 'A beautiful singer who will brighten your day.', isAdoptable: true },
];

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
Training is essential for a well-behaved dog. Start with basic commands like "sit", "stay", and "come."`
    },
    {
      id: 'cg2',
      title: 'Caring for Your New Kitten',
      petType: 'Cats',
      summary: 'Essential tips for a happy and healthy kitten, from diet to playtime.',
      imageId: 'guide-cat',
      content: `
### Kitten Care 101

Kittens are playful and curious, and they require special care to grow into healthy adult cats.

#### Nutrition
Kittens need a diet rich in protein and fat. Look for food specifically formulated for kittens.

#### Litter Box Training
Most kittens learn to use the litter box quickly. Show them the box, and they will usually get the hang of it.

#### Socialization
Expose your kitten to different people, sights, and sounds to help them become a well-adjusted adult cat.`
    },
    {
      id: 'cg3',
      title: 'Bird Keeping for Beginners',
      petType: 'Birds',
      summary: 'Discover the joys of bird ownership with our guide to basic care.',
      imageId: 'guide-bird',
      content: `
### Getting Started with Birds

Birds can be wonderful companions. Here are a few tips for new bird owners.

#### Housing
Provide a cage that is large enough for your bird to stretch its wings and fly short distances.

#### Diet
A balanced diet for a bird includes pellets, fresh vegetables, and a small amount of seeds.

#### Enrichment
Birds are intelligent and need mental stimulation. Provide toys and opportunities for interaction to keep them happy.`
    }
];

export const featuredCareGuides: CareGuide[] = [
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
Training is essential for a well-behaved dog. Start with basic commands like "sit", "stay", and "come."`
    },
    {
      id: 'cg2',
      title: 'Caring for Your New Kitten',
      petType: 'Cats',
      summary: 'Essential tips for a happy and healthy kitten, from diet to playtime.',
      imageId: 'guide-cat',
      content: `
### Kitten Care 101

Kittens are playful and curious, and they require special care to grow into healthy adult cats.

#### Nutrition
Kittens need a diet rich in protein and fat. Look for food specifically formulated for kittens.

#### Litter Box Training
Most kittens learn to use the litter box quickly. Show them the box, and they will usually get the hang of it.

#### Socialization
Expose your kitten to different people, sights, and sounds to help them become a well-adjusted adult cat.`
    },
    {
      id: 'cg3',
      title: 'Bird Keeping for Beginners',
      petType: 'Birds',
      summary: 'Discover the joys of bird ownership with our guide to basic care.',
      imageId: 'guide-bird',
      content: `
### Getting Started with Birds

Birds can be wonderful companions. Here are a few tips for new bird owners.

#### Housing
Provide a cage that is large enough for your bird to stretch its wings and fly short distances.

#### Diet
A balanced diet for a bird includes pellets, fresh vegetables, and a small amount of seeds.

#### Enrichment
Birds are intelligent and need mental stimulation. Provide toys and opportunities for interaction to keep them happy.`
    }
];

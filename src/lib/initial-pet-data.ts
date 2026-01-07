import { z } from 'zod';

export const BreedCareDetailSchema = z.object({
  title: z.string().describe('The title of the care detail (e.g., "Temperament", "Lifespan").'),
  content: z.string().describe('The detailed content for this care topic.'),
});
export type BreedCareDetail = z.infer<typeof BreedCareDetailSchema>;

export const PetBreedSchema = z.object({
  name: z.string(),
  description: z.string(),
  imageIds: z.array(z.string()),
  careDetails: z.array(BreedCareDetailSchema),
});
export type PetBreed = z.infer<typeof PetBreedSchema>;


export interface PetSpecies {
  name: string;
  description: string;
  imageId: string;
  breeds?: PetBreed[];
  careDetails: {
    title: string;
    content: string;
  }[];
}

export interface PetCategory {
  category: string;
  description: string;
  species: PetSpecies[];
}

export const initialPetCategories: PetCategory[] = [
  {
    category: 'Mammals',
    description: 'Warm-blooded animals that are popular as household pets.',
    species: [
      { 
        name: 'Dogs', 
        description: 'Known for their loyalty and diverse breeds.', 
        imageId: 'dog-golden-retriever-1',
        breeds: [
          {
            name: 'Golden Retriever',
            description: 'Friendly, reliable, and trustworthy dogs.',
            imageIds: ['dog-golden-retriever-1'],
            careDetails: [
              { title: 'Overview', content: 'The Golden Retriever is one of the most popular dog breeds, known for its friendly and tolerant attitude.' },
              { title: 'Temperament', content: 'Intelligent, kind, and trustworthy.' },
              { title: 'Lifespan', content: '10-12 years.' },
              { title: 'Size', content: '55-75 lbs (25-34 kg).' },
              { title: 'Diet', content: 'Balanced diet with high-quality protein.' },
              { title: 'Exercise Needs', content: 'High; at least 1 hour of active exercise daily.' },
              { title: 'Grooming', content: 'Regular brushing to manage shedding.' },
              { title: 'Health Issues', content: 'Prone to hip dysplasia and certain heart conditions.' },
              { title: 'Training Difficulty', content: 'Low; highly motivated by praise and treats.' },
              { title: 'Suitability for Families', content: 'Exceptional; famous for being great with kids.' },
              { title: 'Climate Adaptability', content: 'High; handles both cold and warm weather well.' },
              { title: 'Living Space Requirements', content: 'Prefer houses with yards but can adapt to apartments with active owners.' },
              { title: 'Fun Facts', content: 'They are excellent swimmers and have a "soft mouth" originally for retrieving waterfowl.' }
            ]
          },
          {
            name: 'German Shepherd',
            description: 'Confident, courageous, and smart.',
            imageIds: ['dog-german-shepherd-1'],
            careDetails: [
              { title: 'Overview', content: 'A versatile and highly capable working dog, known for its intelligence and loyalty.' },
              { title: 'Temperament', content: 'Confident, courageous, and smart.' },
              { title: 'Lifespan', content: '7-10 years.' },
              { title: 'Size', content: '50-90 lbs (23-41 kg).' },
              { title: 'Diet', content: 'High-quality diet appropriate for large working breeds.' },
              { title: 'Exercise Needs', content: 'Very High; requires significant physical and mental stimulation.' },
              { title: 'Grooming', content: 'Double coat requires frequent brushing; "German Shedders".' },
              { title: 'Health Issues', content: 'Hip and elbow dysplasia are common concerns.' },
              { title: 'Training Difficulty', content: 'Low; they learn quickly and love having a job.' },
              { title: 'Suitability for Families', content: 'Good; protective and loyal, but needs early socialization.' },
              { title: 'Climate Adaptability', content: 'High; double coat protects from various weather conditions.' },
              { title: 'Living Space Requirements', content: 'Needs space; a house with a secure yard is ideal.' },
              { title: 'Fun Facts', content: 'They were the first breed used as service dogs for the blind.' }
            ]
          },
          {
            name: 'Poodle',
            description: 'Proud, active and very smart.',
            imageIds: ['dog-poodle-1'],
            careDetails: [
              { title: 'Overview', content: 'Highly intelligent and elegant, Poodles come in three sizes but all share the same sharp mind.' },
              { title: 'Temperament', content: 'Proud, active, and very smart.' },
              { title: 'Lifespan', content: '10-18 years (depending on size).' },
              { title: 'Size', content: 'Toy, Miniature, or Standard (6-70 lbs).' },
              { title: 'Diet', content: 'High-quality food; be mindful of portions to avoid bloating.' },
              { title: 'Exercise Needs', content: 'Moderate to High; they enjoy swimming and fetching.' },
              { title: 'Grooming', content: 'High; hypoallergenic coat requires regular professional grooming.' },
              { title: 'Health Issues', content: 'Eye disorders and joint problems.' },
              { title: 'Training Difficulty', content: 'Very Low; one of the easiest breeds to train.' },
              { title: 'Suitability for Families', content: 'Very Good; they are playful and get along well with others.' },
              { title: 'Climate Adaptability', content: 'Moderate; need protection in extreme cold.' },
              { title: 'Living Space Requirements', content: 'Very adaptable; suitable for apartments or houses.' },
              { title: 'Fun Facts', content: 'Despite the fancy haircuts, they were originally bred as water retrievers.' }
            ]
          },
          {
            name: 'Labrador Retriever',
            description: 'Friendly, outgoing, and high-spirited companion.',
            imageIds: ['dog-labrador-retriever-1'],
            careDetails: [
              { title: 'Overview', content: 'The Labrador Retriever has long held the top spot as America\'s most popular dog breed.' },
              { title: 'Temperament', content: 'Kind, pleasant, and outgoing.' },
              { title: 'Lifespan', content: '10-12 years.' },
              { title: 'Size', content: '55-80 lbs.' },
              { title: 'Diet', content: 'High-quality diet; be careful with calories as they love to eat!' },
              { title: 'Exercise Needs', content: 'High; they are high-energy dogs that need daily vigorous exercise.' },
              { title: 'Grooming', content: 'Moderate; they have a thick water-repellent double coat that sheds.' },
              { title: 'Training Difficulty', content: 'Very Low; they are eager to please and very intelligent.' },
              { title: 'Suitability for Families', content: 'Excellent; they are famously good with children.' },
              { title: 'Living Space Requirements', content: 'Best in a home with a yard for play.' },
              { title: 'Fun Facts', content: 'They have webbed toes which makes them fantastic swimmers!' }
            ]
          },
          {
            name: 'Beagle',
            description: 'Merry, friendly, and curious small hound.',
            imageIds: ['dog-beagle-1'],
            careDetails: [
              { title: 'Overview', content: 'Beagles are small, hardy, and energetic dogs with an amazing sense of smell.' },
              { title: 'Temperament', content: 'Merry, friendly, and curious.' },
              { title: 'Lifespan', content: '12-15 years.' },
              { title: 'Size', content: '20-30 lbs.' },
              { title: 'Exercise Needs', content: 'Moderate; need plenty of long walks and scent games.' },
              { title: 'Grooming', content: 'Low; short coat is easy to maintain.' },
              { title: 'Health Issues', content: 'Can be prone to obesity and ear infections.' },
              { title: 'Training Difficulty', content: 'Moderate; can be stubborn when they catch a scent.' },
              { title: 'Suitability for Families', content: 'Very Good; they are great companions for active families.' },
              { title: 'Fun Facts', content: 'A Beagle named Snoopy is the most famous Beagle in the world!' }
            ]
          },
          {
            name: 'Bulldog',
            description: 'Kind but courageous, friendly but dignified.',
            imageIds: ['dog-bulldog-1'],
            careDetails: [
              { title: 'Overview', content: 'Thick-set, low-slung, well-muscled bruiser whose "sourmug" face is the universal symbol of courage.' },
              { title: 'Temperament', content: 'Calm, courageous, and friendly.' },
              { title: 'Lifespan', content: '8-10 years.' },
              { title: 'Diet', content: 'Moderate calories to avoid weight gain, which can worsen breathing issues.' },
              { title: 'Exercise Needs', content: 'Low; brisk walks are enough.' },
              { title: 'Health Issues', content: 'Prone to overheating and respiratory issues due to flat face.' }
            ]
          },
          {
            name: 'Pug',
            description: 'The Pug is a charming, playful, and affectionate toy dog breed known for its distinctive wrinkled face, short snouts, and curly tails.',
            imageIds: ['dog-pug-1'],
            careDetails: [
                { title: 'Overview', content: 'The Pug is a small, sturdy, and playful breed with a lot of personality packed into a small body. They are known for their loving nature and being great companions.' },
                { title: 'Temperament', content: 'Charming, mischievous, and loving.' },
                { title: 'Lifespan', content: '13-15 years.' },
                { title: 'Size', content: '14-18 lbs.' },
                { title: 'Grooming', content: 'Regular brushing and cleaning of facial wrinkles is necessary.' },
                { title: 'Health Issues', content: 'Prone to eye problems and respiratory issues due to their short snout.' }
            ]
          }
        ],
        careDetails: [] 
      },
      { 
        name: 'Cats', 
        description: 'Independent yet affectionate companions.', 
        imageId: 'cat-1',
        breeds: [
          {
            name: 'Siamese',
            description: 'Vocal, social, and intelligent.',
            imageIds: ['cat-1'],
            careDetails: [
              { title: 'Overview', content: 'Distinguished by their striking blue eyes and pointed coats, Siamese are highly social cats.' },
              { title: 'Temperament', content: 'Vocal, social, and intelligent.' },
              { title: 'Lifespan', content: '15-20 years.' },
              { title: 'Size', content: '8-12 lbs.' },
              { title: 'Grooming', content: 'Low; short coat requires minimal brushing.' },
              { title: 'Social Needs', content: 'Very High; they don\'t like being left alone for long.' },
              { title: 'Fun Facts', content: 'They are one of the oldest breeds of domesticated cats.' }
            ]
          },
          {
            name: 'Persian',
            description: 'Quiet, sweet, and docile.',
            imageIds: ['cat-2'],
            careDetails: [
              { title: 'Overview', content: 'Known for their long, luxurious coats and flat faces, Persians are the epitome of a lap cat.' },
              { title: 'Temperament', content: 'Quiet, sweet, and docile.' },
              { title: 'Lifespan', content: '12-17 years.' },
              { title: 'Grooming', content: 'Very High; daily brushing is essential to prevent mats.' },
              { title: 'Suitability for Families', content: 'Good for quiet households.' },
              { title: 'Fun Facts', content: 'They have been popular among royalty for centuries.' }
            ]
          },
          {
            name: 'Maine Coon',
            description: 'Large, gentle giants with a friendly nature.',
            imageIds: ['cat-3'],
            careDetails: [
              { title: 'Overview', content: 'One of the largest domestic cat breeds, known for their rugged appearance.' },
              { title: 'Temperament', content: 'Friendly, gentle, and playful.' },
              { title: 'Lifespan', content: '12-15 years.' },
              { title: 'Size', content: '10-25 lbs.' },
              { title: 'Grooming', content: 'High; long, thick coat requires regular brushing.' },
              { title: 'Fun Facts', content: 'They are often called the "dogs of the cat world" because of their loyalty.' }
            ]
          },
          {
            name: 'Bengal',
            description: 'Active, intelligent, and wild-looking.',
            imageIds: ['cat-1'],
            careDetails: [
              { title: 'Overview', content: 'Known for their beautiful spotted or marbled coats, reminiscent of wild leopards.' },
              { title: 'Temperament', content: 'High energy, playful, and very curious.' },
              { title: 'Lifespan', content: '12-16 years.' },
              { title: 'Social Needs', content: 'High; they enjoy interactive play and climbing.' }
            ]
          }
        ],
        careDetails: []
      }
    ],
  },
  {
    category: 'Birds',
    description: 'Intelligent and social creatures.',
    species: [
      { 
        name: 'Parrots', 
        description: 'Highly intelligent birds.', 
        imageId: 'bird-1',
        breeds: [
            {
                name: 'African Grey',
                description: 'Famous for their incredible talking ability and intelligence.',
                imageIds: ['bird-1'],
                careDetails: [
                    { title: 'Overview', content: 'Regarded as one of the most intelligent bird species in the world.' },
                    { title: 'Lifespan', content: '40-60 years.' },
                    { title: 'Diet', content: 'Pellets, fresh fruits, vegetables, and seeds.' },
                    { title: 'Social Needs', content: 'Requires several hours of daily interaction.' },
                    { title: 'Fun Facts', content: 'They can understand and use human language in context.' }
                ]
            },
            {
                name: 'Cockatiel',
                description: 'Affectionate and musical small parrots.',
                imageIds: ['bird-1'],
                careDetails: [
                    { title: 'Overview', content: 'Small, friendly birds that are easy to tame and often whistle tunes.' },
                    { title: 'Lifespan', content: '15-20 years.' },
                    { title: 'Diet', content: 'Seed mixes, pellets, and fresh veggies.' }
                ]
            }
        ],
        careDetails: [] 
      }
    ],
  },
  {
    category: 'Reptiles',
    description: 'Fascinating and unique pets.',
    species: [
      { 
        name: 'Lizards', 
        description: 'Fascinating pets with specific habitat needs.', 
        imageId: 'know-lizard',
        breeds: [
            {
                name: 'Bearded Dragon',
                description: 'Friendly and docile lizard, great for beginners.',
                imageIds: ['know-lizard'],
                careDetails: [
                    { title: 'Overview', content: 'Popular reptile pets known for their calm nature.' },
                    { title: 'Lifespan', content: '10-15 years.' },
                    { title: 'Diet', content: 'Omnivores; eat insects and leafy greens.' },
                    { title: 'Habitat', content: 'Requires a heat lamp and UVB lighting.' },
                    { title: 'Fun Facts', content: 'They "wave" to show submission or recognition.' }
                ]
            },
            {
                name: 'Leopard Gecko',
                description: 'Easy-to-care-for crepuscular lizards.',
                imageIds: ['know-lizard'],
                careDetails: [
                    { title: 'Overview', content: 'Known for their beautiful patterns and unique ability to blink.' },
                    { title: 'Lifespan', content: '15-20 years.' },
                    { title: 'Diet', content: 'Strictly insectivores.' }
                ]
            }
        ],
        careDetails: [] 
      }
    ],
  },
  {
    category: 'Fish',
    description: 'Beautiful aquatic pets.',
    species: [
      {
        name: 'Freshwater Fish',
        description: 'Diverse species for your home aquarium.',
        imageId: 'guide-fish',
        breeds: [
          {
            name: 'Betta Fish',
            description: 'Vibrant and intelligent freshwater fish.',
            imageIds: ['guide-fish'],
            careDetails: [
              { title: 'Overview', content: 'Known for their long, flowing fins and bright colors.' },
              { title: 'Lifespan', content: '3-5 years.' },
              { title: 'Habitat', content: 'Need a filtered and heated tank of at least 5 gallons.' },
              { title: 'Fun Facts', content: 'They can breathe air from the surface!' }
            ]
          },
          {
            name: 'Goldfish',
            description: 'Classic and hardy aquarium favorite.',
            imageIds: ['guide-fish'],
            careDetails: [
              { title: 'Overview', content: 'One of the most commonly kept aquarium fish, available in many varieties.' },
              { title: 'Lifespan', content: '10-20 years (can live much longer in ponds).' },
              { title: 'Diet', content: 'Goldfish pellets and flakes.' }
            ]
          }
        ],
        careDetails: []
      }
    ]
  }
];

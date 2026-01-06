import { AnalyzePetImageForMatchingOutput } from "@/ai/flows/analyze-pet-image-for-matching";

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
  id: string;
  ownerName: string;
  contactEmail: string;
  petName: string;
  reportType: 'Lost' | 'Found';
  lastSeenLocation: string;
  petImage: string; // URL of the uploaded image
  analysis: AnalyzePetImageForMatchingOutput;
}

export interface PetSpecies {
  name: string;
  description: string;
  imageId: string;
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

Bringing a new dog into your home is an exciting experience. To ensure your new friend has a happy and healthy life, it's important to understand the basics of their care.

#### Nutrition
A balanced diet is crucial for your dog's health. Choose a high-quality dog food that is appropriate for their age, size, and activity level. Puppies, adults, and senior dogs have different nutritional needs. Always provide fresh, clean water.

- **Puppies:** Need more calories and protein for growth.
- **Adults:** Require a maintenance diet to stay healthy.
- **Seniors:** May need fewer calories and more fiber.

#### Grooming
Regular grooming keeps your dog's coat and skin healthy. The frequency of grooming depends on the breed and coat type.

- **Brushing:** Prevents matting and reduces shedding. Long-haired breeds need daily brushing.
- **Bathing:** Bathe your dog as needed, but not too often, as it can strip natural oils from their skin.
- **Nail Trimming:** Trim nails regularly to prevent discomfort and walking problems.

#### Training and Socialization
Training is essential for a well-behaved dog. Start with basic commands like "sit," "stay," and "come." Use positive reinforcement techniques, such as treats and praise.

Socialization is equally important. Expose your puppy to various people, places, and other animals from a young age to help them become a well-adjusted adult.
      `
    },
    {
      id: 'cg2',
      title: 'Keeping Your Cat Happy Indoors',
      petType: 'Cats',
      summary: 'Tips and tricks for enriching your indoor cat\'s life.',
      imageId: 'guide-cat',
      content: `
### A Fulfilling Life Indoors

Indoor cats live longer, safer lives, but they need environmental enrichment to stay happy and healthy. Here's how you can create a stimulating world for your feline friend.

#### Create a "Cat-ified" Environment
Your home is your cat's jungle. Provide opportunities for them to express their natural behaviors.

- **Vertical Space:** Cats love to climb. Install cat trees, shelves, or perches to give them a view from above.
- **Scratching Posts:** Provide sturdy scratching posts to satisfy their natural urge to scratch, saving your furniture in the process. Offer different materials like sisal, cardboard, and carpet.
- **Hiding Spots:** Boxes, tunnels, and cozy beds provide a sense of security.

#### Playtime is Essential
Interactive play mimics hunting and is a great way for your cat to burn off energy.

- **Wand Toys:** Feather wands or toys on a string are great for interactive sessions.
- **Puzzle Feeders:** Make your cat work for their food. This engages their mind and prevents boredom.
- **Solo Play:** Rotate a variety of toys like fuzzy mice, crinkle balls, and springs.

#### Window to the World
Set up a comfortable perch near a window. A bird feeder outside can provide hours of entertainment (what cat owners affectionately call "kitty TV").
      `
    },
    {
      id: 'cg3',
      title: 'Choosing the Right Cage for Your Bird',
      petType: 'Birds',
      summary: 'Size, material, and placement are key for your bird\'s home.',
      imageId: 'guide-bird',
      content: `
### A Safe and Comfortable Home

A cage is your bird's home base, so it's vital to choose one that is safe, comfortable, and appropriately sized.

#### Size Matters
The cage should be large enough for your bird to stretch its wings fully and fly short distances between perches. For larger birds, the cage should be as big as you can afford and accommodate. Bar spacing is also critical; it should be narrow enough that your bird cannot get its head stuck.

- **Small Birds (Finches, Canaries):** Wider cages are better than taller ones to allow for flight.
- **Medium Birds (Cockatiels, Conures):** Need plenty of room for toys and climbing.
- **Large Birds (Macaws, Cockatoos):** Require very large, durable cages.

#### Material and Safety
Stainless steel is the safest and most durable cage material, though it can be expensive. Powder-coated metal cages are a good alternative, but inspect them regularly for chipping, which could be ingested. Avoid cages made of zinc or lead, which are toxic to birds.

#### Cage Setup
- **Perches:** Provide a variety of perches of different diameters and textures to exercise your bird's feet. Natural wood branches are an excellent choice.
- **Food and Water Bowls:** Should be placed away from perches to avoid contamination.
- **Toys:** A variety of toys for shredding, chewing, and foraging will keep your bird mentally stimulated.
      `
    },
    {
      id: 'cg4',
      title: 'Aquarium 101: Setting Up Your First Tank',
      petType: 'Fish',
      summary: 'A step-by-step guide to creating a healthy environment for your fish.',
      imageId: 'guide-fish',
      content: `
### Diving into the World of Fishkeeping

Setting up your first aquarium can be a rewarding experience. A proper setup from the start is key to the health and happiness of your aquatic pets.

#### Choosing Your Tank
For beginners, a larger tank (20 gallons or more) is actually easier to manage than a small one. Water parameters are more stable in larger volumes of water. Decide whether you want a freshwater or saltwater tank; freshwater is generally recommended for beginners.

#### Essential Equipment
- **Filter:** Crucial for removing waste and keeping water clean. Choose a filter rated for your tank size.
- **Heater:** Most tropical fish require a consistent water temperature, typically between 75-80°F (24-27°C).
- **Substrate:** Gravel or sand for the bottom of the tank.
- **Lighting:** An aquarium hood with a light will help you see your fish and is necessary if you plan to have live plants.
- **Water Conditioner:** To remove chlorine and other harmful chemicals from tap water.

#### The Nitrogen Cycle
This is the most important concept for new aquarists. You must "cycle" your tank before adding fish. This process establishes a colony of beneficial bacteria that converts toxic fish waste (ammonia) into less harmful substances (nitrates). This can take 2-6 weeks.
      `
    },
    {
      id: 'cg5',
      title: 'Nutrition for a Healthy Dog Coat',
      petType: 'Dogs',
      summary: 'Discover the best foods for a shiny, healthy coat.',
      imageId: 'dog-1',
      content: `
### The Secret to a Shiny Coat

A dog's coat is often a reflection of their overall health. A dull, dry coat can be a sign of nutritional deficiencies. Feeding the right diet is the first step towards a lustrous shine.

#### Key Nutrients for Skin and Coat
- **Omega-3 and Omega-6 Fatty Acids:** These are essential fatty acids that your dog cannot produce on their own. They help maintain skin hydration and reduce inflammation. Look for foods with fish oil (like salmon oil), flaxseed, and sunflower oil.
- **High-Quality Protein:** Hair is primarily made of protein. A diet with a named meat source (e.g., chicken, lamb, beef) as the first ingredient provides the necessary building blocks.
- **Vitamins and Minerals:** Vitamin E, zinc, and biotin are particularly important for skin health and hair growth.

#### Food Choices
Choose a well-balanced commercial dog food from a reputable brand. If you suspect a food allergy is causing skin issues (symptoms include itching, redness, and hair loss), consult your vet. They may recommend a limited ingredient diet or a food trial.

#### Supplements
In some cases, your vet might recommend supplements like fish oil capsules or a skin and coat supplement. Always consult your veterinarian before adding any supplements to your dog's diet.
      `
    },
    {
      id: 'cg6',
      title: 'Understanding Cat Behavior',
      petType: 'Cats',
      summary: 'Decode your cat\'s body language and vocalizations.',
      imageId: 'cat-1',
      content: `
### Cracking the Feline Code

Cats communicate in subtle ways. Understanding their body language and vocalizations can strengthen your bond and help you meet their needs more effectively.

#### Body Language
- **Tail:** A high, upright tail signals a happy, confident cat. A twitching tail can mean excitement or agitation. A tucked tail indicates fear. A puffy, "bottlebrush" tail means they are terrified or extremely angry.
- **Ears:** Forward-facing ears show interest and alertness. Ears flattened to the side ("airplane ears") are a sign of irritation or fear.
- **Eyes:** Slow blinks are the feline equivalent of a kiss, showing trust and affection. Dilated pupils can mean excitement, fear, or arousal.

#### Vocalizations
- **Meow:** The classic "meow" is primarily used to communicate with humans, not other cats. It can mean anything from "hello" to "feed me."
- **Purr:** Usually a sign of contentment, but cats also purr when they are in pain or distressed as a self-soothing mechanism.
- **Hiss/Growl:** A clear warning to back off. Your cat feels threatened.
- **Chirping/Chattering:** Often observed when a cat is watching birds or squirrels. It's thought to be a sign of excitement or frustration.
      `
    },
];

export const featuredCareGuides = allCareGuides.slice(0, 3);

export const petCategories: PetCategory[] = [
  {
    category: 'Mammals',
    description: 'Warm-blooded animals that are popular as household pets.',
    species: [
      { 
        name: 'Dogs', 
        description: 'Known for their loyalty and diverse breeds, from tiny Chihuahuas to giant Great Danes.', 
        imageId: 'dog-1',
        careDetails: [
          {
            title: 'How to Pet Them',
            content: 'Most dogs enjoy being pet on their chest, shoulders, and the base of their tail. Avoid patting the top of their head, which can be seen as threatening. Watch for cues like a wagging tail and leaning in, which indicate they are enjoying the affection.'
          },
          {
            title: 'Care When Sick',
            content: 'Common signs of illness include lethargy, loss of appetite, and changes in behavior. Provide a quiet, comfortable space and ensure they have water. Always consult a veterinarian for diagnosis and treatment. Never give a dog human medication without professional advice.'
          },
          {
            title: 'Understanding Their Emotions',
            content: 'A wagging tail can mean happiness, but a stiff, high tail can signal aggression. A relaxed body and soft eyes show contentment, while cowering or tucking the tail indicates fear. Baring teeth is a clear warning sign. Play bows are an invitation to have fun!'
          }
        ] 
      },
      { 
        name: 'Cats', 
        description: 'Independent yet affectionate companions, available in many breeds with distinct personalities.', 
        imageId: 'cat-1',
        careDetails: [
          {
            title: 'How to Pet Them',
            content: 'Cats prefer to be pet on their own terms. Focus on their cheeks, the base of their ears, and under their chin. Most cats dislike having their belly or tail touched. A purr and leaning into your hand are good signs; a twitching tail or flattened ears mean "stop".'
          },
          {
            title: 'Care When Sick',
            content: 'Cats are masters at hiding illness. Look for changes like hiding, poor grooming, or avoiding the litter box. If you suspect illness, contact a vet. Provide a safe, warm hiding spot and ensure food and water are easily accessible.'
          },
          {
            title: 'Understanding Their Emotions',
            content: 'A slow blink is a sign of trust and affection (a "kitty kiss"). A tail held high is a sign of a confident, happy cat. Hissing or growling means they feel threatened. Purring often means contentment, but can also be a self-soothing mechanism when in pain.'
          }
        ]
      },
      { name: 'Rabbits', description: 'Quiet and gentle, rabbits can be litter-trained and form strong bonds with their owners.', imageId: 'know-rabbit', careDetails: [] },
      { name: 'Hamsters', description: 'Small, nocturnal rodents that are easy to care for and entertaining to watch.', imageId: 'know-hamster', careDetails: [] },
    ],
  },
  {
    category: 'Birds',
    description: 'Intelligent and social creatures that can bring song and color into your home.',
    species: [
      { name: 'Parrots', description: 'Highly intelligent birds, some of which can mimic human speech. They require significant attention.', imageId: 'bird-1', careDetails: [] },
      { name: 'Finches & Canaries', description: 'Small, cheerful birds that are best enjoyed for their songs and beauty rather than handling.', imageId: 'bird-2', careDetails: [] },
      { name: 'Cockatiels', description: 'Smaller than most parrots, cockatiels are known for being gentle and can learn to whistle tunes.', imageId: 'know-cockatiel', careDetails: [] },
    ],
  },
  {
    category: 'Reptiles',
    description: 'Fascinating and unique, these pets require specific environments to thrive.',
    species: [
      { name: 'Lizards', description: 'From geckos to bearded dragons, lizards are fascinating pets with specific habitat needs.', imageId: 'know-lizard', careDetails: [] },
      { name: 'Snakes', description: 'Quiet and low-maintenance, many snake species make great pets for those who appreciate them.', imageId: 'know-snake', careDetails: [] },
      { name: 'Turtles', description: 'Aquatic or land-based, turtles are long-lived pets that require dedicated care.', imageId: 'know-turtle', careDetails: [] },
    ],
  },
];

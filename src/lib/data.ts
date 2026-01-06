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
  lastSeenLocation: string;
  petImage: string; // URL of the uploaded image
  analysis: AnalyzePetImageForMatchingOutput;
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

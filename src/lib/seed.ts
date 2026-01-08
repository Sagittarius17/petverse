
import { initialPetCategories } from './initial-pet-data';
import { db } from '../firebase/server';
import dotenv from 'dotenv';
import { allPets } from './data';

dotenv.config({ path: './.env.local' });

export async function seedDatabase() {
  console.log('Seeding database...');

  // Seed animal breeds
  console.log('Seeding animal breeds...');
  for (const category of initialPetCategories) {
    for (const species of category.species) {
      if (species.breeds) {
        for (const breed of species.breeds) {
          const breedRef = db.collection('animalBreeds').doc(`${species.name.toLowerCase()}-${breed.name.replace(/ /g, '-').toLowerCase()}`);
          await breedRef.set({
            ...breed,
            speciesName: species.name,
            categoryName: category.category,
          });
        }
      }
    }
  }
  console.log('Animal breeds seeded.');

  // Seed public pets collection for adoption
  console.log('Seeding public pets collection...');
  for (const pet of allPets) {
    const petRef = db.collection('pets').doc(pet.id);
    await petRef.set({
      ...pet,
      viewCount: 0 // Initialize view count
    });
  }
  console.log('Public pets collection seeded.');

  console.log('Database seeded successfully!');
}

seedDatabase();

    
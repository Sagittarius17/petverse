import { initialPetCategories } from './initial-pet-data';
import { db } from '../firebase/server';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

export async function seedDatabase() {
  console.log('Seeding database...');

  for (const category of initialPetCategories) {
    for (const species of category.species) {
      if (species.breeds) {
        for (const breed of species.breeds) {
          // Changed from aiBreeds to animalBreeds
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

  console.log('Database seeded successfully!');
}

seedDatabase();
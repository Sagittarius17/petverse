'use client';

import { useState, useCallback } from 'react';
import type { Pet, UserProfile } from '@/lib/data';
import PetCard from './pet-card';
import { PawPrint } from 'lucide-react';
import PetDetailDialog from './pet-detail-dialog';

interface AdoptionListProps {
  pets: Pet[];
  userProfiles: Map<string, UserProfile>;
}

export default function AdoptionList({ pets, userProfiles }: AdoptionListProps) {
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  const handlePetSelect = useCallback((pet: Pet) => {
    setSelectedPet(pet);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setSelectedPet(null);
  }, []);

  return (
    <>
      {pets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {pets.map(pet => (
            <PetCard
              key={pet.id}
              pet={pet}
              onPetSelect={handlePetSelect}
              owner={pet.userId ? userProfiles.get(pet.userId) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 col-span-full">
          <PawPrint className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 text-xl font-semibold">No Pets Found</h3>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search filters to find more friends.
          </p>
        </div>
      )}

      {selectedPet && (
        <PetDetailDialog
          pet={selectedPet}
          isOpen={!!selectedPet}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
}

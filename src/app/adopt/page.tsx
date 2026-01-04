import { allPets } from '@/lib/data';
import AdoptionList from '@/components/adoption-list';

export const metadata = {
  title: 'Adopt a Pet - PetVerse',
  description: 'Browse our listings of lovable pets waiting for a forever home.',
};

export default function AdoptPage() {
  // In a real app, you would fetch this data from your database.
  const pets = allPets;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Find Your New Best Friend</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Browse our listings of lovable pets waiting for a forever home.
        </p>
      </div>
      <AdoptionList allPets={pets} />
    </div>
  );
}

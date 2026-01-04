import { allCareGuides } from '@/lib/data';
import CareGuideCard from '@/components/care-guide-card';

export const metadata = {
  title: 'Pet Care Guides - PetVerse',
  description: 'Find expert advice on caring for your pets. We have guides for dogs, cats, birds, and more.',
};

export default function CareGuidesPage() {
  const guides = allCareGuides;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Expert Pet Care Guides</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Everything you need to know to be the best pet parent.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map(guide => (
          <CareGuideCard key={guide.id} guide={guide} />
        ))}
      </div>
    </div>
  );
}

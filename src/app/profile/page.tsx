import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import PetCard from '@/components/pet-card';
import { allPets } from '@/lib/data';

export const metadata = {
  title: 'My Profile - PetVerse',
};

export default function ProfilePage() {
  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-1');
  const favoritedPets = allPets.slice(2, 4);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <Avatar className="h-32 w-32 border-4 border-primary">
          {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" />}
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left flex-grow">
          <h1 className="text-4xl font-bold font-headline">Jane Doe</h1>
          <p className="text-muted-foreground mt-1">jane.doe@example.com</p>
          <p className="mt-4 max-w-prose">
            A passionate animal lover and advocate for pet adoption. In my free time, I volunteer at the local shelter and enjoy long walks with my two rescue dogs.
          </p>
        </div>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" /> Edit Profile
        </Button>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold font-headline mb-4">My Favorited Pets</h2>
          {favoritedPets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoritedPets.map(pet => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">You haven&apos;t favorited any pets yet.</p>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold font-headline mb-4">My Submitted Pets</h2>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">You haven&apos;t submitted any pets for adoption yet.</p>
              <Button asChild variant="link">
                  <a href="/submit-pet">Submit a Pet for Adoption</a>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

'use client';

import Image from 'next/image';
import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, LogOut } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import PetCard from '@/components/pet-card';
import { allPets } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-1');
  const favoritedPets = allPets.slice(2, 4);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  if (isUserLoading || !user) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
          <Skeleton className="h-32 w-32 rounded-full border-4 border-primary" />
          <div className="text-center md:text-left flex-grow space-y-2">
            <Skeleton className="h-10 w-48 mx-auto md:mx-0" />
            <Skeleton className="h-5 w-64 mx-auto md:mx-0" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <Avatar className="h-32 w-32 border-4 border-primary">
          {user.photoURL && <AvatarImage src={user.photoURL} alt="User Avatar" />}
          <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left flex-grow">
          <h1 className="text-4xl font-bold font-headline">{user.displayName || 'Anonymous User'}</h1>
          <p className="text-muted-foreground mt-1">{user.email}</p>
          <p className="mt-4 max-w-prose">
            A passionate animal lover and advocate for pet adoption. In my free time, I volunteer at the local shelter and enjoy long walks with my two rescue dogs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
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

'use client';

import Image from 'next/image';
import { useUser, useAuth, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, LogOut } from 'lucide-react';
import PetCard from '@/components/pet-card';
import { type Pet } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const userPetsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'pets'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: submittedPets, isLoading: isPetsLoading } = useCollection<Pet>(userPetsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // TODO: Fetch user's actual favorited pets
  const favoritedPets: Pet[] = [];

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/');
    }
  };

  const isLoading = isUserLoading || isPetsLoading;

  if (isLoading || !user) {
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

      <Tabs defaultValue="submitted">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="submitted">My Submitted Pets</TabsTrigger>
          <TabsTrigger value="favorites">My Favorite Pets</TabsTrigger>
        </TabsList>
        <TabsContent value="submitted" className="mt-6">
           {submittedPets && submittedPets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {submittedPets.map(pet => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">You haven't submitted any pets for adoption yet.</p>
                <Button asChild variant="link">
                    <Link href="/submit-pet">Submit a Pet for Adoption</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="favorites" className="mt-6">
            {favoritedPets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoritedPets.map(pet => (
                    <PetCard key={pet.id} pet={pet} />
                ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-muted-foreground">You haven't favorited any pets yet.</p>
                         <Button asChild variant="link">
                            <Link href="/adopt">Find a pet to favorite</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

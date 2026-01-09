
'use client';

import Image from 'next/image';
import { useUser, useAuth, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, LogOut, Trash2, Eye, PlusCircle, Heart } from 'lucide-react';
import PetCard from '@/components/pet-card';
import { type Pet, type PetBreed } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, query, where, doc, deleteDoc, DocumentData, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PetDetailDialog from '@/components/pet-detail-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { PetFormDialog } from './pet-form-dialog';
import { ProfileFormDialog } from './profile-form-dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import PetInfoDialog from '@/components/pet-info-dialog';


interface UserProfile extends DocumentData {
    displayName: string;
    username: string;
    email: string;
    bio?: string;
}

interface FavoriteBreedDoc {
    id: string;
    breedId: string;
}


function FavoriteBreedCard({ breed, onSelect }: { breed: PetBreed, onSelect: (breed: PetBreed) => void }) {
  const imageId = breed.imageIds && breed.imageIds.length > 0 ? breed.imageIds[0] : 'dog-1';
  const image = PlaceHolderImages.find((p) => p.id === imageId) || { imageUrl: imageId.startsWith('data:') ? imageId : '', imageHint: breed.name };

  return (
    <Card
      className="flex flex-col overflow-hidden transition-all hover:shadow-lg cursor-pointer"
      onClick={() => onSelect(breed)}
    >
      <CardHeader className="relative h-40 w-full p-0">
        {image.imageUrl ? (
          <Image
            src={image.imageUrl}
            alt={breed.name}
            fill
            style={{ objectFit: 'cover' }}
            data-ai-hint={image.imageHint}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary">
              <p className="text-xs text-muted-foreground">No Image</p>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-headline mb-2">{breed.name}</CardTitle>
        <CardDescription className="text-sm line-clamp-3">{breed.description}</CardDescription>
      </CardContent>
    </Card>
  );
}


export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);
  const [petToEdit, setPetToEdit] = useState<Pet | null>(null);
  const [isPetFormOpen, setIsPetFormOpen] = useState(false);
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [favoritedBreeds, setFavoritedBreeds] = useState<PetBreed[]>([]);
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(true);
  const [selectedBreed, setSelectedBreed] = useState<PetBreed | null>(null);
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);


  const userPetsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'pets'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: submittedPets, isLoading: isPetsLoading } = useCollection<Pet>(userPetsQuery);

  const favoriteBreedsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'favoriteBreeds');
  }, [firestore, user]);

  const { data: favoriteBreedDocs } = useCollection<FavoriteBreedDoc>(favoriteBreedsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    const fetchFavoritedBreeds = async () => {
      setIsFavoritesLoading(true);
      if (!firestore || !favoriteBreedDocs) {
        setFavoritedBreeds([]);
        setIsFavoritesLoading(false);
        return;
      }

      // Use the document ID from the favorites subcollection, which IS the breedId.
      const breedIds = favoriteBreedDocs.map(fav => fav.id);

      if (breedIds.length === 0) {
        setFavoritedBreeds([]);
        setIsFavoritesLoading(false);
        return;
      }

      try {
        const breedsQuery = query(collection(firestore, 'animalBreeds'), where('__name__', 'in', breedIds));
        const breedSnapshots = await getDocs(breedsQuery);
        const breeds = breedSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as PetBreed));
        setFavoritedBreeds(breeds);
      } catch (e) {
        console.error("Error fetching favorited breeds:", e);
        toast({
          variant: 'destructive',
          title: 'Error Fetching Favorites',
          description: 'Could not load your favorite breeds. Please try again later.'
        });
        setFavoritedBreeds([]);
      } finally {
        setIsFavoritesLoading(false);
      }
    };

    fetchFavoritedBreeds();
  }, [favoriteBreedDocs, firestore, toast]);

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/');
    }
  };

  const handleDeletePet = async () => {
    if (!petToDelete || !firestore) return;
    const petDocRef = doc(firestore, 'pets', petToDelete.id);
    try {
      await deleteDoc(petDocRef);
      toast({
        title: 'Pet Deleted',
        description: `${petToDelete.name} has been removed from the adoption listings.`,
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to delete ${petToDelete.name}. Please try again.`,
      });
      console.error("Error deleting pet:", error);
    } finally {
      setPetToDelete(null);
    }
  };
  
  const handleEditPet = (pet: Pet) => {
    setPetToEdit(pet);
    setIsPetFormOpen(true);
  };
  
  const handleNewPet = () => {
    setPetToEdit(null); // Ensure we're in "create" mode
    setIsPetFormOpen(true);
  };

  const handlePetFormSuccess = (mode: 'created' | 'updated') => {
    toast({
        title: mode === 'created' ? 'Pet Submitted!' : 'Pet Updated!',
        description: mode === 'created' 
            ? 'Your pet is now listed for adoption.'
            : "The pet's information has been successfully updated.",
    });
    setIsPetFormOpen(false);
    setPetToEdit(null);
  }

  const handleProfileFormSuccess = () => {
    toast({
        title: 'Profile Updated!',
        description: 'Your profile information has been successfully saved.',
    });
    setIsProfileFormOpen(false);
  }


  const isLoading = isUserLoading || isPetsLoading || isProfileLoading || isFavoritesLoading;

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
    <>
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <Avatar className="h-32 w-32 border-4 border-primary">
          {user.photoURL && <AvatarImage src={user.photoURL} alt="User Avatar" />}
          <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left flex-grow">
          <h1 className="text-4xl font-bold font-headline">{userProfile?.displayName || user.displayName || 'Anonymous User'}</h1>
          <p className="text-muted-foreground mt-1">@{userProfile?.username || user.email?.split('@')[0]}</p>
          <p className="mt-4 max-w-prose">
            {userProfile?.bio || 'A passionate animal lover and advocate for pet adoption. In my free time, I volunteer at the local shelter and enjoy long walks with my two rescue dogs.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsProfileFormOpen(true)}>
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
          <TabsTrigger value="favorites">My Favorite Breeds</TabsTrigger>
        </TabsList>
        <TabsContent value="submitted" className="mt-6">
            <div className="flex justify-end mb-4">
                <Button onClick={handleNewPet}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Submit a New Pet
                </Button>
            </div>
           {submittedPets && submittedPets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {submittedPets.map(pet => (
                <PetCard 
                  key={pet.id} 
                  pet={pet} 
                  onPetSelect={() => setSelectedPet(pet)}
                  actions={
                    <div className="flex justify-between items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedPet(pet)}>
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleEditPet(pet)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setPetToDelete(pet)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  }
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">You haven't submitted any pets for adoption yet.</p>
                <Button variant="link" onClick={handleNewPet}>
                  Submit a Pet for Adoption
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="favorites" className="mt-6">
            {isFavoritesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="relative h-40 w-full p-0">
                      <Skeleton className="h-full w-full" />
                    </CardHeader>
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full mt-1" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : favoritedBreeds.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoritedBreeds.map(breed => (
                    <FavoriteBreedCard key={breed.name} breed={breed} onSelect={setSelectedBreed} />
                ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        <p>You haven't favorited any breeds yet.</p>
                         <Button asChild variant="link">
                            <Link href="/know-your-pet">Find a breed to favorite</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </TabsContent>
      </Tabs>
    </div>
    
    {selectedPet && (
        <PetDetailDialog pet={selectedPet} isOpen={!!selectedPet} onClose={() => setSelectedPet(null)} />
    )}

    <PetInfoDialog pet={selectedBreed} isOpen={!!selectedBreed} onClose={() => setSelectedBreed(null)} />

    <PetFormDialog
        isOpen={isPetFormOpen}
        onClose={() => setIsPetFormOpen(false)}
        pet={petToEdit}
        onSuccess={handlePetFormSuccess}
    />
    
    <ProfileFormDialog
        isOpen={isProfileFormOpen}
        onClose={() => setIsProfileFormOpen(false)}
        onSuccess={handleProfileFormSuccess}
        user={user}
        userProfile={userProfile}
    />

    {petToDelete && (
      <AlertDialog open={!!petToDelete} onOpenChange={(open) => !open && setPetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the adoption listing for <span className="font-bold">{petToDelete.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePet} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )}
    </>
  );
}

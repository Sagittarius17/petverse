'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint, Loader2 } from 'lucide-react';

const petSchema = z.object({
  name: z.string().min(2, 'Pet name must be at least 2 characters.'),
  species: z.enum(['Dog', 'Cat', 'Bird', 'Other']),
  breed: z.string().min(2, 'Breed must be at least 2 characters.'),
  age: z.string().min(1, 'Age is required.'),
  gender: z.enum(['Male', 'Female']),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  // For simplicity, we'll make image upload optional client-side
  // and handle placeholder logic on submission.
  petImage: z.any().optional(),
});

type PetFormData = z.infer<typeof petSchema>;

export default function SubmitPetPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      species: 'Dog',
      gender: 'Male',
    },
  });

  const onSubmit = async (data: PetFormData) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to submit a pet.',
      });
      return;
    }

    try {
      const petsCollection = collection(firestore, 'pets');
      await addDoc(petsCollection, {
        ...data,
        userId: user.uid, // Link pet to the current user
        imageId: `${data.species.toLowerCase()}-1`, // Assign a generic placeholder image
        viewCount: 0,
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Pet Submitted!',
        description: `${data.name} is now listed for adoption.`,
      });

      router.push('/profile');
    } catch (error) {
      console.error('Error submitting pet:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'There was an error submitting your pet. Please try again.',
      });
    }
  };

  if (isUserLoading) {
      return (
          <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
      )
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
             <PawPrint className="h-8 w-8 text-primary" />
             <div>
                <CardTitle className="text-3xl font-bold font-headline">Submit a Pet for Adoption</CardTitle>
                <CardDescription>Fill out the form below to list a pet for adoption.</CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Pet's Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
               <div className="space-y-2">
                <Label htmlFor="breed">Breed</Label>
                <Input id="breed" {...register('breed')} placeholder="e.g., Golden Retriever" />
                {errors.breed && <p className="text-sm text-destructive">{errors.breed.message}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
               <div className="space-y-2">
                <Label>Species</Label>
                <Controller
                  name="species"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dog">Dog</SelectItem>
                        <SelectItem value="Cat">Cat</SelectItem>
                        <SelectItem value="Bird">Bird</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" {...register('age')} placeholder="e.g., 2 years" />
                {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
              </div>
               <div className="space-y-2">
                <Label>Gender</Label>
                 <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register('description')} className="min-h-[120px]" />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

             <div className="space-y-2">
                <Label htmlFor="petImage">Pet's Photo</Label>
                <Input id="petImage" type="file" {...register('petImage')} accept="image/*" />
                <p className="text-xs text-muted-foreground">For now, a placeholder image will be used. Photo uploads coming soon!</p>
              </div>

            <Button type="submit" disabled={isSubmitting} className="w-full text-lg" size="lg">
              {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</> : 'Submit Pet'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

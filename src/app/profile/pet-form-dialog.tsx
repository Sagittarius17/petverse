'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useUser } from '@/firebase';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Pet } from '@/lib/data';

const petSchema = z.object({
  name: z.string().min(2, 'Pet name must be at least 2 characters.'),
  species: z.enum(['Dog', 'Cat', 'Bird', 'Other']),
  breed: z.string().min(2, 'Breed must be at least 2 characters.'),
  age: z.string().min(1, 'Age is required.'),
  gender: z.enum(['Male', 'Female']),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  petImage: z.any().optional(),
});

type PetFormData = z.infer<typeof petSchema>;

interface PetFormDialogProps {
  pet: Pet | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (mode: 'created' | 'updated') => void;
}

export function PetFormDialog({ pet, isOpen, onClose, onSuccess }: PetFormDialogProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: '',
      species: 'Dog',
      breed: '',
      age: '',
      gender: 'Male',
      description: '',
    },
  });

  const isEditMode = !!pet;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        reset({
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          age: pet.age,
          gender: pet.gender,
          description: pet.description,
        });
      } else {
        reset({
          name: '',
          species: 'Dog',
          breed: '',
          age: '',
          gender: 'Male',
          description: '',
        });
      }
    }
  }, [pet, isOpen, isEditMode, reset]);

  const onSubmit = async (data: PetFormData) => {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to perform this action.',
      });
      return;
    }

    try {
      const { petImage, ...restOfData } = data;
      if (isEditMode) {
        // Update existing pet
        const petDocRef = doc(firestore, 'pets', pet.id);
        await updateDoc(petDocRef, restOfData);
        onSuccess('updated');
      } else {
        // Create new pet
        const petsCollection = collection(firestore, 'pets');
        await addDoc(petsCollection, {
          ...restOfData,
          userId: user.uid,
          imageId: `${data.species.toLowerCase()}-1`, // Generic placeholder
          viewCount: 0,
          createdAt: serverTimestamp(),
          isAdoptable: true,
        });
        onSuccess('created');
      }
    } catch (error) {
      console.error("Error saving pet:", error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'There was an error saving the pet information.',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Pet Information' : 'Submit a Pet for Adoption'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? `Make changes to the profile for ${pet?.name}. Click save when you're done.`
                : 'Fill out the form below to list a pet for adoption.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
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
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Save Changes' : 'Submit Pet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


'use client';

import { useEffect, useMemo } from 'react';
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
import { Loader2, MapPin } from 'lucide-react';
import type { Pet } from '@/lib/data';
import { initialPetCategories } from '@/lib/initial-pet-data';
import { LocationInput } from '@/components/ui/location-input';

const petSchema = z.object({
  name: z.string().min(2, 'Pet name must be at least 2 characters.'),
  species: z.enum(['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Lizard', 'Fish', 'Other']),
  breed: z.string().min(1, 'Please select a breed.'),
  ageYears: z.number().min(0).optional(),
  ageMonths: z.number().min(0).max(11).optional(),
  gender: z.enum(['Male', 'Female']),
  location: z.string().min(2, 'Location is required.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  petImage: z.any().optional(),
}).refine(data => data.ageYears !== undefined || data.ageMonths !== undefined, {
  message: "At least one age field (years or months) must be filled.",
  path: ["ageYears"], // assign error to one of the fields
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
  const { control, register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: '',
      species: 'Dog',
      breed: '',
      gender: 'Male',
      location: '',
      description: '',
    },
  });

  const isEditMode = !!pet;
  const watchedSpecies = watch('species');

  const availableBreeds = useMemo(() => {
    if (!watchedSpecies) return [];
    
    // Map form species value to the name used in the data structure
    const speciesNameToDataName: Record<string, string> = {
        'Dog': 'Dogs',
        'Cat': 'Cats',
        'Bird': 'Parrots',
        'Lizard': 'Lizards',
        'Fish': 'Freshwater Fish',
    };
    const dataSpeciesName = speciesNameToDataName[watchedSpecies] || watchedSpecies;

    const speciesData = initialPetCategories
      .flatMap(category => category.species)
      .find(s => s.name === dataSpeciesName); // Use the mapped name
    return speciesData?.breeds?.map(b => b.name) || [];
  }, [watchedSpecies]);

  useEffect(() => {
    if (pet?.species !== watchedSpecies) {
        setValue('breed', '');
    }
  }, [watchedSpecies, setValue, pet]);


  useEffect(() => {
    if (isOpen) {
        if (isEditMode && pet) {
            const ageParts = (pet.age || '').split(' ');
            const years = ageParts.includes('years') ? parseInt(ageParts[ageParts.indexOf('years') - 1] || '0') : (ageParts.includes('year') ? parseInt(ageParts[ageParts.indexOf('year') - 1] || '0') : 0);
            const months = ageParts.includes('months') ? parseInt(ageParts[ageParts.indexOf('months') - 1] || '0') : (ageParts.includes('month') ? parseInt(ageParts[ageParts.indexOf('month') - 1] || '0') : 0);

            reset({
                name: pet.name,
                species: pet.species,
                breed: pet.breed,
                ageYears: years,
                ageMonths: months,
                gender: pet.gender,
                location: pet.location || '',
                description: pet.description,
            });
        } else {
            reset({
                name: '',
                species: 'Dog',
                breed: '',
                ageYears: 0,
                ageMonths: 0,
                gender: 'Male',
                location: '',
                description: '',
                petImage: undefined,
            });
        }
    }
  }, [pet, isOpen, isEditMode, reset]);

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.village;
            const state = data.address.state;

            if (city && state) {
              const locationString = `${city}, ${state}`;
              setValue('location', locationString, { shouldValidate: true });
              toast({
                title: "Location Set!",
                description: `Location set to ${locationString}.`,
              });
            } else {
               throw new Error("Could not determine city and state from your location.");
            }
          } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Geocoding Error',
                description: "Could not convert your location to a city. Please enter it manually."
            });
          }
        },
        (error) => {
          let description = 'Could not get your location.';
          if (error.code === 1) {
            description = 'Please allow location access in your browser settings.';
          }
          toast({
            variant: 'destructive',
            title: 'Location Error',
            description: description
          });
        }
      );
    } else {
      toast({
        variant: 'destructive',
        title: 'Location Not Supported',
        description: 'Your browser does not support geolocation.'
      });
    }
  };


  const onSubmit = async (data: PetFormData) => {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to perform this action.',
      });
      return;
    }

    let lat: number | undefined;
    let lon: number | undefined;
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(data.location)}&format=json&limit=1`);
        const geocodeData = await response.json();
        if (geocodeData && geocodeData.length > 0) {
            lat = parseFloat(geocodeData[0].lat);
            lon = parseFloat(geocodeData[0].lon);
        }
    } catch (e) {
        console.error("Geocoding failed during pet submission:", e);
        // Silently fail, the pet can still be submitted without coordinates.
    }

    let ageString = '';
    if (data.ageYears) ageString += `${data.ageYears} year${data.ageYears > 1 ? 's' : ''} `;
    if (data.ageMonths) ageString += `${data.ageMonths} month${data.ageMonths > 1 ? 's' : ''}`;
    ageString = ageString.trim();

    // New image handling logic
    let imageToStore: string | undefined = pet?.imageId; // Default to existing image if in edit mode
    
    if (data.petImage && data.petImage.length > 0) {
      const file = data.petImage[0];
      try {
        const dataUri = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
        imageToStore = dataUri;
      } catch (error) {
        toast({ variant: "destructive", title: "Image Upload Failed", description: "Could not process image file." });
        return;
      }
    } else if (!isEditMode) {
      // If creating a new pet and no image is provided, use a default placeholder.
      imageToStore = `${data.species.toLowerCase()}-1`;
    }

    try {
      const { petImage, ageYears, ageMonths, ...restOfData } = data;
      const petData = { 
        ...restOfData, 
        age: ageString, 
        imageId: imageToStore,
        lat: lat,
        lon: lon,
      };

      if (isEditMode) {
        // Update existing pet
        const petDocRef = doc(firestore, 'pets', pet.id);
        await updateDoc(petDocRef, petData);
        onSuccess('updated');
      } else {
        // Create new pet
        const petsCollection = collection(firestore, 'pets');
        await addDoc(petsCollection, {
          ...petData,
          userId: user.uid,
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Pet's Name</Label>
                    <Input id="name" {...register('name')} />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                     <div className="relative">
                       <Controller
                          name="location"
                          control={control}
                          render={({ field }) => (
                            <LocationInput
                              {...field}
                              placeholder="e.g. Mumbai, Maharashtra"
                            />
                          )}
                        />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full" onClick={handleUseLocation} title="Use my current location">
                            <MapPin className="h-4 w-4 text-muted-foreground hover:text-primary" />
                            <span className="sr-only">Use my location</span>
                        </Button>
                    </div>
                    {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
                </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                 <div className="space-y-2">
                    <Label>Species</Label>
                    <Controller
                        name="species"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Dog">Dog</SelectItem>
                                <SelectItem value="Cat">Cat</SelectItem>
                                <SelectItem value="Bird">Bird</SelectItem>
                                <SelectItem value="Rabbit">Rabbit</SelectItem>
                                <SelectItem value="Hamster">Hamster</SelectItem>
                                <SelectItem value="Lizard">Lizard</SelectItem>
                                <SelectItem value="Fish">Fish</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Breed</Label>
                    <Controller
                      name="breed"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a breed" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableBreeds.length > 0 ? (
                              availableBreeds.map(breedName => (
                                <SelectItem key={breedName} value={breedName}>
                                  {breedName}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="Unknown" disabled>No breeds listed</SelectItem>
                            )}
                             <SelectItem value="Mixed Breed">Mixed Breed</SelectItem>
                             <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.breed && <p className="text-sm text-destructive">{errors.breed.message}</p>}
                </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="ageYears">Age (Years)</Label>
                        <Input id="ageYears" type="number" {...register('ageYears', { valueAsNumber: true })} placeholder="YY" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ageMonths">Age (Months)</Label>
                        <Input id="ageMonths" type="number" {...register('ageMonths', { valueAsNumber: true })} placeholder="MM" />
                    </div>
                    {errors.ageYears && <p className="col-span-2 text-sm text-destructive">{errors.ageYears.message}</p>}
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
                 {errors.petImage && <p className="text-sm text-destructive">{(errors.petImage as any).message}</p>}
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


"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from "@/hooks/use-toast";
import { handleLostPetReport } from '@/app/lost-and-found/actions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, MapPin, Send } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';

const formSchema = z.object({
  reportType: z.enum(['Lost', 'Found'], {
    required_error: "You need to select a report type.",
  }),
  ownerName: z.string().min(2, { message: 'Your name must be at least 2 characters.' }),
  contactEmail: z.string().email({ message: 'Please enter a valid email address.' }),
  petName: z.string().min(1, { message: 'Pet name is required.' }),
  lastSeenLocation: z.string().min(5, { message: 'Please provide a more detailed location.' }),
  petImage: z.any().refine(files => files?.length > 0, 'A photo of the pet is required.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function LostPetForm() {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportType: "Lost",
    }
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      form.setValue('petImage', Array.from(files));
      const newPreviews = Array.from(files).map(file => URL.createObjectURL(file));
      setImagePreviews(newPreviews);
    }
  };

  const handleUseLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // In a real app, you'd use a geocoding service to convert coords to a city
                form.setValue('lastSeenLocation', "San Francisco, CA", { shouldValidate: true });
                toast({
                    title: "Location Set (Demo)",
                    description: "Set to San Francisco, CA as an example."
                });
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

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    const firstFile = data.petImage[0];
    const reader = new FileReader();
    reader.readAsDataURL(firstFile);

    reader.onloadend = async () => {
      const base64data = reader.result as string;
      try {
        const result = await handleLostPetReport({
          reportType: data.reportType,
          ownerName: data.ownerName,
          contactEmail: data.contactEmail,
          petName: data.petName,
          lastSeenLocation: data.lastSeenLocation,
          petImageDataUri: base64data,
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to submit report.');
        }

        toast({
          title: "Report Submitted!",
          description: `Your ${data.reportType.toLowerCase()} report for ${data.petName} has been posted. It includes an AI-generated description.`,
        });

        form.reset();
        setImagePreviews([]);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: error instanceof Error ? error.message : "An unknown error occurred.",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "File Read Error",
        description: "Could not read the selected image file.",
      });
      setIsSubmitting(false);
    };
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="reportType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>What are you reporting?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Lost" />
                      </FormControl>
                      <FormLabel className="font-normal">I lost my pet</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Found" />
                      </FormControl>
                      <FormLabel className="font-normal">I found a pet</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ownerName">Your Name</Label>
              <Input id="ownerName" {...form.register('ownerName')} />
              {form.formState.errors.ownerName && <p className="text-destructive text-sm mt-1">{form.formState.errors.ownerName.message}</p>}
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input id="contactEmail" type="email" {...form.register('contactEmail')} />
              {form.formState.errors.contactEmail && <p className="text-destructive text-sm mt-1">{form.formState.errors.contactEmail.message}</p>}
            </div>
            <div>
              <Label htmlFor="petName">Pet's Name (or 'Unknown')</Label>
              <Input id="petName" {...form.register('petName')} />
              {form.formState.errors.petName && <p className="text-destructive text-sm mt-1">{form.formState.errors.petName.message}</p>}
            </div>
            <div>
              <Label htmlFor="lastSeenLocation">Location (Lost or Found)</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="lastSeenLocation" {...form.register('lastSeenLocation')} className="pl-10" />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full" onClick={handleUseLocation} title="Use my current location">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="sr-only">Use my location</span>
                </Button>
              </div>
              {form.formState.errors.lastSeenLocation && <p className="text-destructive text-sm mt-1">{form.formState.errors.lastSeenLocation.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="petImage">Pet's Photo</Label>
            <div className="mt-2">
              <Input id="petImage" type="file" accept="image/*" onChange={handleImageChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
            </div>
            {form.formState.errors.petImage && <p className="text-destructive text-sm mt-1">A photo of the pet is required.</p>}
            {imagePreviews.length > 0 && (
              <div className="mt-4 flex gap-4 flex-wrap">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="w-24 h-24 rounded-md bg-secondary flex items-center justify-center overflow-hidden border">
                    <Image src={src} alt={`Pet preview ${index + 1}`} width={96} height={96} className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
          {isSubmitting ? (
             <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...</>
          ) : (
             <><Send className="mr-2 h-4 w-4" /> Post Report</>
          )}
        </Button>
      </form>
    </Form>
  );
}

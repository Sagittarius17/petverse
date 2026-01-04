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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, Wand2, Lightbulb, Loader2 } from 'lucide-react';
import type { AnalyzePetImageForMatchingOutput } from '@/ai/flows/analyze-pet-image-for-matching';

const formSchema = z.object({
  ownerName: z.string().min(2, { message: 'Owner name must be at least 2 characters.' }),
  contactEmail: z.string().email({ message: 'Please enter a valid email address.' }),
  petName: z.string().min(1, { message: 'Pet name is required.' }),
  lastSeenLocation: z.string().min(5, { message: 'Please provide a more detailed location.' }),
  petImage: z.any().refine(file => file instanceof File, 'Image is required.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function LostPetForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzePetImageForMatchingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('petImage', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setAnalysisResult(null); // Clear previous analysis
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.readAsDataURL(data.petImage);
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      
      try {
        const result = await handleLostPetReport({ petImageDataUri: base64data });
        if (result.error) {
            throw new Error(result.error);
        }
        setAnalysisResult(result.data);
      } catch (error) {
        console.error("Analysis failed:", error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with the AI analysis. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          <Label htmlFor="petName">Pet&apos;s Name</Label>
          <Input id="petName" {...form.register('petName')} />
          {form.formState.errors.petName && <p className="text-destructive text-sm mt-1">{form.formState.errors.petName.message}</p>}
        </div>
        <div>
          <Label htmlFor="lastSeenLocation">Last Seen Location</Label>
          <Input id="lastSeenLocation" {...form.register('lastSeenLocation')} />
           {form.formState.errors.lastSeenLocation && <p className="text-destructive text-sm mt-1">{form.formState.errors.lastSeenLocation.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="petImage">Pet&apos;s Photo</Label>
        <div className="mt-2 flex items-center gap-4">
          <div className="w-24 h-24 rounded-md bg-secondary flex items-center justify-center overflow-hidden">
            {imagePreview ? (
              <Image src={imagePreview} alt="Pet preview" width={96} height={96} className="object-cover" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <Input id="petImage" type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
        </div>
        {form.formState.errors.petImage && <p className="text-destructive text-sm mt-1">A photo of your pet is required.</p>}
      </div>
      
      <Button type="submit" disabled={isLoading || !imagePreview} className="w-full md:w-auto">
        {isLoading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
        ) : (
          <><Wand2 className="mr-2 h-4 w-4" /> Analyze Photo & Submit Report</>
        )}
      </Button>

      {analysisResult && (
        <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>AI Analysis Complete</AlertTitle>
            <AlertDescription>
            <p className="font-semibold mt-2">Identified Attributes:</p>
            <p>{analysisResult.attributeSummary}</p>
            {analysisResult.isAnalysisHelpful ? (
                <p className="mt-2 text-green-700 dark:text-green-400">This summary should be helpful for finding a match.</p>
            ) : (
                <p className="mt-2 text-amber-700 dark:text-amber-400">Analysis may be limited. A clearer photo might provide better results.</p>
            )}
            </AlertDescription>
        </Alert>
      )}
    </form>
  );
}

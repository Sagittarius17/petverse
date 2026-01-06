
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from "@/hooks/use-toast";
import { handleLostPetReport } from '@/app/lost-and-found/actions';
import type { LostPetReport } from '@/lib/data';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wand2, Lightbulb, Loader2, Send } from 'lucide-react';
import type { AnalyzePetImageForMatchingOutput } from '@/ai/flows/analyze-pet-image-for-matching';
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
  petImages: z.any().refine(files => files?.length > 0, 'At least one image is required.'),
});

type FormValues = z.infer<typeof formSchema>;

interface LostPetFormProps {
  onReportSubmit: (report: Omit<LostPetReport, 'id'>) => void;
}

export default function LostPetForm({ onReportSubmit }: LostPetFormProps) {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalyzePetImageForMatchingOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
      form.setValue('petImages', Array.from(files));
      const newPreviews = Array.from(files).map(file => URL.createObjectURL(file));
      setImagePreviews(newPreviews);
      setAnalysisResult(null); // Clear previous analysis
    }
  };

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    const files = form.getValues('petImages');
    if (!files || files.length === 0) {
      toast({
        variant: "destructive",
        title: "No Image Selected",
        description: "Please upload at least one photo of your pet to analyze.",
      });
      setIsAnalyzing(false);
      return;
    }

    const firstFile = files[0];
    const reader = new FileReader();
    reader.readAsDataURL(firstFile);
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      
      try {
        const result = await handleLostPetReport({ petImageDataUri: base64data });
        if (result.error) {
            throw new Error(result.error);
        }
        setAnalysisResult(result.data);
         toast({
          title: "Analysis Complete",
          description: "The AI has analyzed your pet's photo. Review the details below.",
        });
      } catch (error) {
        console.error("Analysis failed:", error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with the AI analysis. Please try again.",
        });
      } finally {
        setIsAnalyzing(false);
      }
    };
     reader.onerror = () => {
      console.error("Failed to read file.");
      toast({
        variant: "destructive",
        title: "File Read Error",
        description: "Could not read the selected image file.",
      });
      setIsAnalyzing(false);
    };
  };

  const onFinalSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    // We require analysis to be done before submitting.
    if (!analysisResult) {
      toast({
        variant: 'destructive',
        title: 'Analysis Required',
        description: 'Please analyze the pet\'s photo before submitting the report.',
      });
      setIsSubmitting(false);
      return;
    }

    const newReport: Omit<LostPetReport, 'id'> = {
        ownerName: data.ownerName,
        contactEmail: data.contactEmail,
        petName: data.petName,
        reportType: data.reportType,
        lastSeenLocation: data.lastSeenLocation,
        petImage: imagePreviews[0], // Using the first previewed image
        analysis: analysisResult,
    };
    
    // Pass the new report up to the parent component
    onReportSubmit(newReport);

    toast({
      title: "Report Submitted!",
      description: `Your ${data.reportType.toLowerCase()} pet report for ${data.petName} has been posted.`,
    });
    
    // Reset form state after successful submission
    form.reset();
    setImagePreviews([]);
    setAnalysisResult(null);
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFinalSubmit)} className="space-y-8">
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
              <Label htmlFor="petName">Pet&apos;s Name</Label>
              <Input id="petName" {...form.register('petName')} />
              {form.formState.errors.petName && <p className="text-destructive text-sm mt-1">{form.formState.errors.petName.message}</p>}
            </div>
            <div>
              <Label htmlFor="lastSeenLocation">Location (Lost or Found)</Label>
              <Input id="lastSeenLocation" {...form.register('lastSeenLocation')} />
              {form.formState.errors.lastSeenLocation && <p className="text-destructive text-sm mt-1">{form.formState.errors.lastSeenLocation.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="petImages">Pet&apos;s Photos</Label>
            <div className="mt-2">
              <Input id="petImages" type="file" accept="image/*" multiple onChange={handleImageChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
            </div>
            {form.formState.errors.petImages && <p className="text-destructive text-sm mt-1">A photo of your pet is required.</p>}
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
        
        <div className="flex flex-col gap-4 items-start">
          <Button type="button" onClick={handleAnalysis} disabled={isAnalyzing || imagePreviews.length === 0} className="w-full md:w-auto">
            {isAnalyzing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Wand2 className="mr-2 h-4 w-4" /> Analyze Photo</>
            )}
          </Button>

          {analysisResult && (
            <div className="w-full space-y-4">
              <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertTitle>AI Analysis Complete</AlertTitle>
                  <AlertDescription>
                  <p className="font-semibold mt-2">Identified Attributes (from first image):</p>
                  <p>{analysisResult.attributeSummary}</p>
                  {analysisResult.isAnalysisHelpful ? (
                      <p className="mt-2 text-green-700 dark:text-green-400">This summary should be helpful for finding a match.</p>
                  ) : (
                      <p className="mt-2 text-amber-700 dark:text-amber-400">Analysis may be limited. A clearer photo might provide better results.</p>
                  )}
                  </AlertDescription>
              </Alert>
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                {isSubmitting ? (
                   <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...</>
                ) : (
                   <><Send className="mr-2 h-4 w-4" /> Post Report</>
                )}
              </Button>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}

'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Heart, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const oneTimeTiers = [
  { amount: 10, description: 'Provides a bag of food for a shelter pet.', id: 'one-time-10' },
  { amount: 25, description: 'Covers the cost of a vaccination.', id: 'one-time-25' },
  { amount: 50, description: 'Sponsors one spay/neuter surgery.', id: 'one-time-50' },
  { amount: 100, description: 'Helps rescue a pet from a high-kill shelter.', id: 'one-time-100' },
];

const monthlyTiers = [
    { amount: 5, description: 'Provides monthly flea/tick prevention.', id: 'monthly-5' },
    { amount: 15, description: 'Feeds one cat for a month.', id: 'monthly-15' },
    { amount: 30, description: 'Feeds one dog for a month.', id: 'monthly-30' },
    { amount: 75, description: 'Supports our emergency medical fund.', id: 'monthly-75' },
];

export default function DonatePage() {
  const donateImage = PlaceHolderImages.find(p => p.id === 'donate-hero');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <Heart className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-4xl md:text-5xl font-bold font-headline tracking-tight">Support Our Mission</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          Every donation, no matter the size, helps us rescue, care for, and find loving homes for pets in need. Your generosity saves lives.
        </p>
      </div>

      <div className="grid md:grid-cols-2 items-center gap-12 max-w-6xl mx-auto mb-16">
        <div className="relative h-80 w-full overflow-hidden rounded-2xl shadow-xl">
          {donateImage && (
            <Image
              src={donateImage.imageUrl}
              alt={donateImage.description}
              fill
              style={{ objectFit: 'cover' }}
              data-ai-hint={donateImage.imageHint}
            />
          )}
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold font-headline">How Your Donation Helps</h2>
          <ul className="space-y-3 text-muted-foreground list-disc pl-5">
            <li className="pl-2">
              <span className="font-semibold text-foreground">Rescue Operations:</span> Covering transportation and intake costs for animals from overcrowded shelters.
            </li>
            <li className="pl-2">
              <span className="font-semibold text-foreground">Medical Care:</span> Funding essential vaccinations, spay/neuter surgeries, and emergency treatments.
            </li>
            <li className="pl-2">
              <span className="font-semibold text-foreground">Daily Necessities:</span> Providing nutritious food, warm bedding, and enrichment toys for every animal in our care.
            </li>
            <li className="pl-2">
              <span className="font-semibold text-foreground">Adoption Events:</span> Helping us host events to connect our amazing pets with their future families.
            </li>
          </ul>
        </div>
      </div>
      
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Make a Difference Today</CardTitle>
            <CardDescription>Choose how you'd like to contribute.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="one-time" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="one-time">Give Once</TabsTrigger>
                    <TabsTrigger value="monthly">Give Monthly</TabsTrigger>
                </TabsList>
                <TabsContent value="one-time" className="pt-6">
                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {oneTimeTiers.map(tier => (
                            <Card key={tier.id} className="text-center p-4 flex flex-col items-center justify-between">
                                <p className="text-4xl font-bold text-primary">${tier.amount}</p>
                                <p className="text-sm text-muted-foreground my-4 flex-grow">{tier.description}</p>
                                <Button className="w-full">Donate ${tier.amount}</Button>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="monthly" className="pt-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {monthlyTiers.map(tier => (
                            <Card key={tier.id} className="text-center p-4 flex flex-col items-center justify-between">
                                <p className="text-4xl font-bold text-accent">${tier.amount}<span className="text-base font-normal text-muted-foreground">/mo</span></p>
                                <p className="text-sm text-muted-foreground my-4 flex-grow">{tier.description}</p>
                                <Button variant="secondary" className="w-full">Sponsor</Button>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

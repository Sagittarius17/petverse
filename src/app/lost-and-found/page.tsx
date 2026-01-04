import LostPetForm from "@/components/lost-pet-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata = {
    title: 'Lost & Found Pets - PetVerse',
    description: 'Report a lost pet or search for found pets in your area. Help us reunite pets with their families.',
};

export default function LostAndFoundPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Lost & Found Pets</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Let&apos;s help bring them home.
        </p>
      </div>

      <Tabs defaultValue="report" className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="report">
            <PawPrint className="mr-2 h-4 w-4"/> Report a Lost Pet
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="mr-2 h-4 w-4"/> Search Found Pets
          </TabsTrigger>
        </TabsList>
        <TabsContent value="report">
          <Card>
            <CardHeader>
              <CardTitle>Report Your Lost Pet</CardTitle>
              <CardDescription>
                Fill out the form below. Our AI can help analyze your pet&apos;s photo to create a helpful description for matching.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LostPetForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Search for a Found Pet</CardTitle>
              <CardDescription>
                Look through pets that have been found and reported. More features coming soon!
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center py-16">
              <div className="space-y-4">
                 <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                 <h3 className="text-xl font-semibold">Search Coming Soon</h3>
                 <p className="text-muted-foreground">We are working on a powerful search to help you find pets.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

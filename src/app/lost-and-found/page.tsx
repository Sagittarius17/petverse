'use client';

import { useState } from 'react';
import LostPetForm from "@/components/lost-pet-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint, Search } from "lucide-react";
import type { LostPetReport } from '@/lib/data';
import LostPetReportCard from '@/components/lost-pet-report-card';
import { Button } from '@/components/ui/button';

// Sample initial data. In a real app, this would come from a database.
const initialReports: LostPetReport[] = [
    {
        id: 'report-1',
        ownerName: 'Jane Doe',
        contactEmail: 'jane@example.com',
        petName: 'Buddy',
        lastSeenLocation: 'Central Park, near the fountain',
        petImage: 'https://images.unsplash.com/photo-1642581684512-52947badee8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxkb2clMjBwdXBweXxlbnwwfHx8fDE3Njc1MjkyMDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
        reportType: 'Lost',
        analysis: {
            attributeSummary: 'Golden Retriever puppy, light golden fur, appears to be young. No distinguishing collar or tags visible.',
            isAnalysisHelpful: true,
        }
    },
    {
        id: 'report-2',
        ownerName: 'John Smith',
        contactEmail: 'john@example.com',
        petName: 'Mochi',
        lastSeenLocation: 'Downtown, 4th and Main St.',
        petImage: 'https://images.unsplash.com/photo-1615901372949-296704779939?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxjYXQlMjBhZHVsdHxlbnwwfHx8fDE3Njc1MjkyMDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
        reportType: 'Found',
        analysis: {
            attributeSummary: 'Siamese cat with classic color points, blue eyes, and a slender build.',
            isAnalysisHelpful: true,
        }
    }
];

export default function LostAndFoundPage() {
  const [reports, setReports] = useState<LostPetReport[]>(initialReports);

  const handleReportSubmit = (newReport: Omit<LostPetReport, 'id'>) => {
    const reportWithId = { ...newReport, id: `report-${Date.now()}` };
    setReports(prevReports => [reportWithId, ...prevReports]);
    
    // In a real app, you would also save this to your database here.
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Lost &amp; Found Pets</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Let&apos;s help bring them home.
        </p>
      </div>

      <Tabs defaultValue="search" className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="report">
            <PawPrint className="mr-2 h-4 w-4"/> Report a Pet
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="mr-2 h-4 w-4"/> Search Reports
          </TabsTrigger>
        </TabsList>
        <TabsContent value="report">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Report</CardTitle>
              <CardDescription>
                Fill out the form below to report a lost or found pet. Our AI can help analyze the pet&apos;s photo to create a helpful description for matching.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LostPetForm onReportSubmit={handleReportSubmit} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Recently Reported Pets</CardTitle>
              <CardDescription>
                Browse pets that have been reported as lost or found. Contact the owner if you have any information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {reports.length > 0 ? (
                reports.map(report => (
                  <LostPetReportCard key={report.id} report={report} />
                ))
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <p>No pets have been reported yet.</p>
                  <p>Be the first to file a report!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

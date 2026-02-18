'use client';

import { useState, useMemo, useEffect } from 'react';
import LostPetForm from "@/components/lost-pet-form";
import { ClientTabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/client-tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint, Search } from "lucide-react";
import type { LostPetReport } from '@/lib/data';
import LostPetReportCard from '@/components/lost-pet-report-card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function LostAndFoundPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const reportsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'lost_found_reports'), orderBy('reportDate', 'desc')) : null,
    [firestore]
  );
  const { data: allReports, isLoading } = useCollection<LostPetReport>(reportsQuery);

  const [activeReports, setActiveReports] = useState<LostPetReport[] | null>(null);
  const [isFilteringUsers, setIsFilteringUsers] = useState(true);

  useEffect(() => {
    const filterReportsByActiveUsers = async () => {
      // If there are no reports, or the user is not authenticated, don't try to query user statuses.
      if (!allReports || !firestore || !user) {
        setActiveReports(allReports || []);
        setIsFilteringUsers(false);
        return;
      }

      setIsFilteringUsers(true);
      const userIds = [...new Set(allReports.map(report => report.userId).filter((id): id is string => !!id))];
      
      if (userIds.length === 0) {
        setActiveReports(allReports.filter(r => !r.userId)); // Only show reports with no user if no userIds found
        setIsFilteringUsers(false);
        return;
      }

      // Firestore 'in' query can take up to 30 elements per query. We need to batch them.
      const userChunks: string[][] = [];
      for (let i = 0; i < userIds.length; i += 30) {
          userChunks.push(userIds.slice(i, i + 30));
      }

      const activeUserIds = new Set<string>();

      try {
        await Promise.all(userChunks.map(async (chunk) => {
            const usersQuery = query(collection(firestore, 'users'), where('__name__', 'in', chunk), where('status', '==', 'Active'));
            const usersSnapshot = await getDocs(usersQuery);
            usersSnapshot.forEach(doc => activeUserIds.add(doc.id));
        }));
        
        const filtered = allReports.filter(report => !report.userId || activeUserIds.has(report.userId));
        setActiveReports(filtered);

      } catch (e) {
          console.error("Error filtering reports by user status:", e);
          setActiveReports(allReports); // Fallback to showing all reports on error
      } finally {
        setIsFilteringUsers(false);
      }
    };

    if (!isLoading) {
        filterReportsByActiveUsers();
    }
  }, [allReports, firestore, isLoading, user]);

  const finalIsLoading = isLoading || isFilteringUsers;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Lost &amp; Found Pets</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Let&apos;s help bring them home.
        </p>
      </div>

      <ClientTabs defaultValue="search" className="w-full max-w-4xl mx-auto">
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
                Fill out the form below to report a lost or found pet. Our AI will analyze the pet's photo to create a helpful description for matching.
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
              <CardTitle>Recently Reported Pets</CardTitle>
              <CardDescription>
                Browse pets that have been reported as lost or found. Contact the owner if you have any information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {finalIsLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3">
                      <Skeleton className="h-60 md:h-full" />
                      <div className="md:col-span-2 p-6 space-y-4">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  </Card>
                ))
              ) : activeReports && activeReports.length > 0 ? (
                activeReports.map(report => (
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
      </ClientTabs>
    </div>
  );
}

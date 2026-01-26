
'use client';
import { memo } from 'react';
import { MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import type { Pet, LostPetReport } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

const formatDate = (timestamp?: Timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString('en-GB');
};

const PetRow = memo(function PetRow({ pet }: { pet: Pet }) {
    return (
        <TableRow>
            <TableCell className="font-medium">{pet.name}</TableCell>
            <TableCell>{pet.species}</TableCell>
            <TableCell>{pet.breed}</TableCell>
            <TableCell>{pet.age}</TableCell>
            <TableCell>
            <Badge variant={pet.isAdoptable !== false ? 'default' : 'secondary'}>
                {pet.isAdoptable !== false ? 'Adoptable' : 'Adopted'}
            </Badge>
            </TableCell>
            <TableCell>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </TableCell>
        </TableRow>
    );
});

const ReportRow = memo(function ReportRow({ report }: { report: LostPetReport }) {
    return (
        <TableRow>
            <TableCell>
                <Image
                    alt={report.petName}
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={report.petImage}
                    width="64"
                />
            </TableCell>
            <TableCell className="font-medium">{report.petName}</TableCell>
            <TableCell>
                <Badge variant={report.reportType === 'Lost' ? 'destructive' : 'default'}>
                    {report.reportType}
                </Badge>
            </TableCell>
            <TableCell>{report.lastSeenLocation}</TableCell>
            <TableCell>{formatDate(report.reportDate)}</TableCell>
            <TableCell>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>View Report</DropdownMenuItem>
                <DropdownMenuItem>Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </TableCell>
        </TableRow>
    );
});


export default function AdminPetsPage() {
  const firestore = useFirestore();

  const petsCollection = useMemoFirebase(() => collection(firestore, 'pets'), [firestore]);
  const { data: pets, isLoading: isLoadingPets } = useCollection<Pet>(petsCollection);

  const lostFoundReportsCollection = useMemoFirebase(() => collection(firestore, 'lost_found_reports'), [firestore]);
  const { data: reports, isLoading: isLoadingReports } = useCollection<LostPetReport>(lostFoundReportsCollection);

  return (
    <Card className="h-[calc(100vh_-_8rem)] flex flex-col">
      <CardHeader>
        <CardTitle>Pet Management</CardTitle>
        <CardDescription>
          Manage all pets for adoption and lost & found reports from one place.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <Tabs defaultValue="adoption" className="flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="adoption">Adoption Pets</TabsTrigger>
            <TabsTrigger value="lost-and-found">Lost & Found Reports</TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="adoption" className="m-0">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Species</TableHead>
                  <TableHead>Breed</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingPets ? (
                    Array.from({ length: 15 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      </TableRow>
                    ))
                ) : pets && pets.length > 0 ? (
                  pets.map((pet) => (
                    <PetRow key={pet.id} pet={pet} />
                  ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                            No pets found for adoption.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="lost-and-found" className="m-0">
             <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Pet Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingReports ? (
                  Array.from({ length: 15 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : reports && reports.length > 0 ? (
                  reports.map((report) => (
                    <ReportRow key={report.id} report={report} />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No lost or found reports found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

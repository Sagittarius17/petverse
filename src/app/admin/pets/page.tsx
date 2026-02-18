
'use client';
import { useState, useMemo, memo } from 'react';
import { MoreHorizontal, Search, Copy, Check } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import type { Pet, LostPetReport } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

const formatDate = (timestamp?: Timestamp) => {
  if (!timestamp) return 'N/A';
  return timestamp.toDate().toLocaleDateString('en-GB');
};

const CopyableId = ({ id }: { id: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      <span className="truncate max-w-[100px]" title={id}>{id}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  );
};

const PetRow = memo(function PetRow({ pet }: { pet: Pet }) {
  return (
    <TableRow>
      <TableCell>
        <CopyableId id={pet.id || ''} />
      </TableCell>
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
        <CopyableId id={report.id || ''} />
      </TableCell>
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
  const [searchTerm, setSearchTerm] = useState('');

  const petsCollection = useMemoFirebase(() => collection(firestore, 'pets'), [firestore]);
  const { data: pets, isLoading: isLoadingPets } = useCollection<Pet>(petsCollection);

  const lostFoundReportsCollection = useMemoFirebase(() => collection(firestore, 'lost_found_reports'), [firestore]);
  const { data: reports, isLoading: isLoadingReports } = useCollection<LostPetReport>(lostFoundReportsCollection);

  const filteredPets = useMemo(() => {
    if (!pets) return [];
    if (!searchTerm) return pets;
    const lowerSearch = searchTerm.toLowerCase();
    return pets.filter(pet =>
      pet.name?.toLowerCase().includes(lowerSearch) ||
      pet.id?.toLowerCase().includes(lowerSearch) ||
      pet.species?.toLowerCase().includes(lowerSearch)
    );
  }, [pets, searchTerm]);

  const filteredReports = useMemo(() => {
    if (!reports) return [];
    if (!searchTerm) return reports;
    const lowerSearch = searchTerm.toLowerCase();
    return reports.filter(report =>
      report.petName?.toLowerCase().includes(lowerSearch) ||
      report.id?.toLowerCase().includes(lowerSearch) ||
      report.reportType?.toLowerCase().includes(lowerSearch) ||
      report.analysis?.attributeSummary?.toLowerCase().includes(lowerSearch)
    );
  }, [reports, searchTerm]);

  return (
    <Card className="h-[calc(100vh_-_8rem)] flex flex-col">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Pet Management</CardTitle>
            <CardDescription>
              Manage all pets for adoption and lost & found reports from one place.
            </CardDescription>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by Name, ID, or Species..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
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
                    <TableHead className="w-[150px]">Post ID</TableHead>
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
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredPets && filteredPets.length > 0 ? (
                    filteredPets.map((pet) => (
                      <PetRow key={pet.id} pet={pet} />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        {searchTerm ? `No pets found matching "${searchTerm}"` : "No pets found for adoption."}
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
                    <TableHead className="w-[150px]">Post ID</TableHead>
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
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredReports && filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <ReportRow key={report.id} report={report} />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        {searchTerm ? `No matches found for "${searchTerm}"` : "No lost or found reports found."}
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

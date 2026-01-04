'use client';

import { MoreHorizontal } from 'lucide-react';
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

const pets = [
  {
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: '2 years',
    status: 'Adoptable',
  },
  {
    name: 'Lucy',
    species: 'Dog',
    breed: 'German Shepherd',
    age: '3 years',
    status: 'Adopted',
  },
  {
    name: 'Mochi',
    species: 'Cat',
    breed: 'Siamese',
    age: '1 year',
    status: 'Adoptable',
  },
    {
    name: 'Oliver',
    species: 'Cat',
    breed: 'Persian',
    age: '6 months',
    status: 'Adoptable',
  },
];

export default function AdminPetsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pets</CardTitle>
        <CardDescription>
          A list of all the pets in your application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
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
            {pets.map((pet) => (
              <TableRow key={pet.name}>
                <TableCell className="font-medium">{pet.name}</TableCell>
                <TableCell>{pet.species}</TableCell>
                <TableCell>{pet.breed}</TableCell>
                <TableCell>{pet.age}</TableCell>
                <TableCell>
                  <Badge variant={pet.status === 'Adoptable' ? 'default' : 'secondary'}>
                    {pet.status}
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

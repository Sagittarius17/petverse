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

const posts = [
  {
    title: "Beginner's Guide to Dog Care",
    author: 'Jane Doe',
    category: 'Dogs',
    status: 'Published',
    createdAt: '2023-10-26',
  },
  {
    title: 'Keeping Your Cat Happy Indoors',
    author: 'John Smith',
    category: 'Cats',
    status: 'Published',
    createdAt: '2023-10-24',
  },
  {
    title: 'Choosing the Right Cage for Your Bird',
    author: 'Alice Johnson',
    category: 'Birds',
    status: 'Draft',
    createdAt: '2023-10-22',
  },
  {
    title: 'Nutrition for a Healthy Dog Coat',
    author: 'Jane Doe',
    category: 'Dogs',
    status: 'Published',
    createdAt: '2023-10-20',
  },
];

export default function AdminBlogsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Blog Posts</CardTitle>
        <CardDescription>
          Manage all the blog posts in your application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.title}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>{post.author}</TableCell>
                <TableCell>{post.category}</TableCell>
                <TableCell>
                  <Badge variant={post.status === 'Published' ? 'default' : 'outline'}>
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell>{post.createdAt}</TableCell>
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

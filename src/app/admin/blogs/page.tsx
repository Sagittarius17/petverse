'use client';
import { useState } from 'react';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, Timestamp, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { BlogForm } from './blog-form';
import { cn } from '@/lib/utils';
import { logActivity } from '@/lib/activity-log';

export interface Blog {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  categoryName: string;
  status: 'Draft' | 'Published';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export default function AdminBlogsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const { toast } = useToast();

  const blogsCollection = useMemoFirebase(() => collection(firestore, 'blogs'), [firestore]);
  const { data: blogs, isLoading: isBlogsLoading } = useCollection<Blog>(blogsCollection);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  const isLoading = isAuthLoading || isBlogsLoading;

  const handleNewPost = () => {
    setSelectedBlog(null);
    setIsFormOpen(true);
  };

  const handleEdit = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedBlog || !firestore || !user) return;
    try {
      await deleteDoc(doc(firestore, 'blogs', selectedBlog.id));
      
      logActivity(firestore, user, {
        action: 'Deleted Blog Post',
        target: selectedBlog.title,
        targetType: 'Blog',
        details: `Deleted blog post: "${selectedBlog.title}"`,
        badgeVariant: 'destructive',
        iconName: 'Trash2'
      });

      toast({
        title: 'Blog Post Deleted',
        description: `"${selectedBlog.title}" has been successfully deleted.`,
      });
    } catch (error) {
      console.error("Error deleting blog post: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete blog post.',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedBlog(null);
    }
  };

  const formatDate = (timestamp?: Timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString();
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Blog Posts</CardTitle>
                <CardDescription>
                Manage all the blog posts in your application.
                </CardDescription>
            </div>
            <Button onClick={handleNewPost}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Post
            </Button>
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
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : blogs && blogs.length > 0 ? (
                blogs.map((post) => (
                  <TableRow key={post.id} className={cn(post.status === 'Draft' && 'bg-muted/50 text-muted-foreground')}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>{post.authorName}</TableCell>
                    <TableCell>{post.categoryName}</TableCell>
                    <TableCell>
                      <Badge variant={post.status === 'Published' ? 'default' : 'outline'}>
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(post.createdAt)}</TableCell>
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
                          <DropdownMenuItem onSelect={() => handleEdit(post)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleDeleteConfirm(post)} className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No blog posts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BlogForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        blog={selectedBlog}
        user={user}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog post
              &quot;{selectedBlog?.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

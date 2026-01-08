'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import type { Blog } from './page';
import type { User } from 'firebase/auth';
import { logActivity } from '@/lib/activity-log';

const blogSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  content: z.string().min(10, 'Content must be at least 10 characters long'),
  categoryName: z.string().min(1, 'Category is required'),
  status: z.enum(['Draft', 'Published']),
});

type BlogFormData = z.infer<typeof blogSchema>;

interface BlogFormProps {
  isOpen: boolean;
  onClose: () => void;
  blog: Blog | null;
  user: User | null;
}

export function BlogForm({ isOpen, onClose, blog, user }: BlogFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      status: 'Draft',
    },
  });

  useEffect(() => {
    if (blog) {
      reset({
        title: blog.title,
        content: blog.content,
        categoryName: blog.categoryName,
        status: blog.status,
      });
    } else {
      reset({
        title: '',
        content: '',
        categoryName: '',
        status: 'Draft',
      });
    }
  }, [blog, reset]);

  const onSubmit = async (data: BlogFormData) => {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to perform this action.',
      });
      return;
    }

    try {
      if (blog) {
        // Update existing blog
        const blogRef = doc(firestore, 'blogs', blog.id);
        await updateDoc(blogRef, {
          ...data,
          updatedAt: serverTimestamp(),
        });
        logActivity(firestore, user, {
          action: 'Edited Blog Post',
          target: data.title,
          targetType: 'Blog',
          details: `Updated blog post: "${data.title}"`,
          badgeVariant: 'default',
          iconName: 'Edit'
        });
        toast({
          title: 'Success',
          description: 'Blog post updated successfully.',
        });
      } else {
        // Create new blog
        const blogsCollection = collection(firestore, 'blogs');
        await addDoc(blogsCollection, {
          ...data,
          authorId: user.uid,
          authorName: user.displayName || user.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
         logActivity(firestore, user, {
            action: 'Created Blog Post',
            target: data.title,
            targetType: 'Blog',
            details: `Created a new blog post: "${data.title}"`,
            badgeVariant: 'default',
            iconName: 'PlusCircle'
        });
        toast({
          title: 'Success',
          description: 'New blog post created.',
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save blog post. Please try again.',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{blog ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
            <DialogDescription>
              {blog ? 'Make changes to your existing post.' : 'Fill out the form below to create a new post.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" {...register('content')} className="min-h-[150px]" />
              {errors.content && <p className="text-destructive text-sm">{errors.content.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="categoryName">Category</Label>
                    <Input id="categoryName" {...register('categoryName')} placeholder="e.g., Dogs, Cats" />
                    {errors.categoryName && <p className="text-destructive text-sm">{errors.categoryName.message}</p>}
                </div>
                <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={(value) => reset({ ...control._formValues, status: value as 'Draft' | 'Published' })} defaultValue={blog?.status || 'Draft'}>
                    <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Post'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

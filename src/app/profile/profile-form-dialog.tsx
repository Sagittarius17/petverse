
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useAuth } from '@/firebase';
import { doc, updateDoc, DocumentData } from 'firebase/firestore';
import { updateProfile, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters.'),
  username: z.string().min(2, 'Username must be at least 2 characters.'),
  bio: z.string().max(280, 'Bio cannot exceed 280 characters.').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfile extends DocumentData {
    username: string;
    email: string;
    bio?: string;
}

interface ProfileFormDialogProps {
  user: User | null;
  userProfile: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProfileFormDialog({ user, userProfile, isOpen, onClose, onSuccess }: ProfileFormDialogProps) {
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (isOpen && user) {
      reset({
        displayName: user.displayName || '',
        username: userProfile?.username || '',
        bio: userProfile?.bio || '',
      });
    }
  }, [user, userProfile, isOpen, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!firestore || !auth.currentUser) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to perform this action.',
      });
      return;
    }

    try {
      const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
      
      // Update Firestore document
      await updateDoc(userDocRef, {
        username: data.username,
        bio: data.bio,
        // Also update name parts if your schema uses them
        displayName: data.displayName,
        firstName: data.displayName.split(' ')[0] || '',
        lastName: data.displayName.split(' ').slice(1).join(' ') || '',
      });

      // Update Firebase Auth profile
      if (auth.currentUser.displayName !== data.displayName) {
          await updateProfile(auth.currentUser, { displayName: data.displayName });
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'There was an error updating your profile.',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input id="displayName" {...register('displayName')} />
                    {errors.displayName && <p className="text-sm text-destructive">{errors.displayName.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" {...register('username')} />
                    {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" {...register('bio')} className="min-h-[120px]" placeholder="Tell us a little about yourself..."/>
              {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

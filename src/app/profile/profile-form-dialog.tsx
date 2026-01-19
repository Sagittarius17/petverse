
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useAuth } from '@/firebase';
import { doc, updateDoc, DocumentData, getDoc, writeBatch } from 'firebase/firestore';
import { updateProfile, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters.').max(50),
  username: z.string().min(3, "Must be 3-20 characters").max(20).regex(/^[a-z0-9_.]+$/, "Only lowercase letters, numbers, '.', and '_' allowed."),
  bio: z.string().max(280, 'Bio cannot exceed 280 characters.').optional(),
  pfp: z.any().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfile extends DocumentData {
    username: string;
    displayName: string;
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
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });
  
  const [preview, setPreview] = useState<string | null>(null);
  const pfpFile = watch('pfp');

  useEffect(() => {
    if (pfpFile && pfpFile.length > 0) {
      const file = pfpFile[0];
      const newPreview = URL.createObjectURL(file);
      setPreview(newPreview);
      return () => URL.revokeObjectURL(newPreview);
    }
  }, [pfpFile]);

  useEffect(() => {
    if (isOpen && user) {
      reset({
        displayName: userProfile?.displayName || user.displayName || '',
        username: userProfile?.username || '',
        bio: userProfile?.bio || '',
        pfp: undefined,
      });
      setPreview(user.photoURL || null);
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

    const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
    let photoURL: string | null = null;
    
    // Handle new profile picture
    if (data.pfp && data.pfp.length > 0) {
        const file = data.pfp[0];
        try {
            photoURL = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = (error) => reject(error);
            });
        } catch (error) {
            toast({ variant: "destructive", title: "Image Upload Failed", description: "Could not process the image file." });
            return;
        }
    }


    try {
      // Update Firebase Auth profile
      if (photoURL || auth.currentUser.displayName !== data.displayName) {
          await updateProfile(auth.currentUser, { 
              displayName: data.displayName,
              ...(photoURL && { photoURL: photoURL }),
           });
      }
      
      const firestoreUpdateData: any = {
          displayName: data.displayName,
          bio: data.bio,
      };
      if (photoURL) {
          firestoreUpdateData.profilePicture = photoURL;
      }


      // If username has changed, handle uniqueness and update flow
      if (data.username !== userProfile?.username) {
        const newUsernameRef = doc(firestore, 'usernames', data.username);
        const newUsernameSnap = await getDoc(newUsernameRef);

        if (newUsernameSnap.exists()) {
            toast({ variant: "destructive", title: "Username already taken" });
            return;
        }
        
        const batch = writeBatch(firestore);

        // Delete old username document
        if (userProfile?.username) {
            const oldUsernameRef = doc(firestore, 'usernames', userProfile.username);
            batch.delete(oldUsernameRef);
        }

        // Create new username document
        batch.set(newUsernameRef, { uid: auth.currentUser.uid });

        // Update user document with all new data
        batch.update(userDocRef, {
            username: data.username,
            ...firestoreUpdateData
        });

        await batch.commit();

      } else {
        // Username has not changed, just update the other fields
        await updateDoc(userDocRef, firestoreUpdateData);
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
             <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={preview || undefined} />
                <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="pfp">Update Picture</Label>
                <Input id="pfp" type="file" accept="image/*" {...register('pfp')} />
                {errors.pfp && <p className="text-sm text-destructive">{(errors.pfp as any).message}</p>}
              </div>
            </div>
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

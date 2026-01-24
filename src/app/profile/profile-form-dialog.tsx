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
import { Loader2, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
    profilePicture?: string;
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
  const [wantsToRemovePfp, setWantsToRemovePfp] = useState(false);
  const pfpFile = watch('pfp');
  const defaultAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-1');

  const handleRemovePfp = () => {
    setPreview(null);
    reset({ ...watch(), pfp: undefined });
    setWantsToRemovePfp(true);
  };

  useEffect(() => {
    if (pfpFile && pfpFile.length > 0) {
      const file = pfpFile[0];
      const newPreview = URL.createObjectURL(file);
      setPreview(newPreview);
      setWantsToRemovePfp(false); // New file cancels removal
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
      setPreview(userProfile?.profilePicture || user.photoURL || defaultAvatar?.imageUrl || null);
      setWantsToRemovePfp(false); // Reset on open
    }
  }, [user, userProfile, isOpen, reset, defaultAvatar?.imageUrl]);

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
    
    let newPhotoUrl: string | null = null;
    let photoUpdateType: 'upload' | 'remove' | 'none' = 'none';

    if (wantsToRemovePfp) {
        photoUpdateType = 'remove';
        newPhotoUrl = null;
    } else if (data.pfp && data.pfp.length > 0) {
        const file = data.pfp[0];
        try {
            newPhotoUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = (error) => reject(error);
            });
            photoUpdateType = 'upload';
        } catch (error) {
            toast({ variant: "destructive", title: "Image Upload Failed", description: "Could not process the image file." });
            return;
        }
    }

    try {
      const authProfileUpdates: { displayName?: string, photoURL?: string | null } = {};
      if (auth.currentUser.displayName !== data.displayName) {
          authProfileUpdates.displayName = data.displayName;
      }
      if (photoUpdateType !== 'none') {
          authProfileUpdates.photoURL = newPhotoUrl;
      }

      if (Object.keys(authProfileUpdates).length > 0) {
          await updateProfile(auth.currentUser, authProfileUpdates);
      }
      
      const firestoreUpdateData: any = {
          displayName: data.displayName,
          bio: data.bio,
      };

      if (photoUpdateType === 'upload') {
          firestoreUpdateData.profilePicture = newPhotoUrl;
      } else if (photoUpdateType === 'remove') {
          firestoreUpdateData.profilePicture = '';
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
                 <div className="flex items-center gap-2">
                    <Input id="pfp" type="file" accept="image/*" {...register('pfp')} />
                    {preview && (
                        <Button type="button" variant="ghost" size="icon" onClick={handleRemovePfp} aria-label="Remove picture">
                            <Trash2 className="h-5 w-5 text-destructive" />
                        </Button>
                    )}
                </div>
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

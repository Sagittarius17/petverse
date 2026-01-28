'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required.'),
  streetAddress: z.string().min(5, 'Street address is required.'),
  city: z.string().min(2, 'City is required.'),
  state: z.string().min(2, 'State is required.'),
  zip: z.string().min(5, 'A valid ZIP code is required.'),
  phone: z.string().min(10, 'A valid phone number is required.'),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface Address {
    fullName: string;
    streetAddress: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
}

interface AddressFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingAddress?: Address | null;
}

export function AddressFormDialog({ isOpen, onClose, onSuccess, existingAddress }: AddressFormDialogProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    if (isOpen) {
        reset(existingAddress || {
            fullName: '',
            streetAddress: '',
            city: '',
            state: '',
            zip: '',
            phone: '',
        });
    }
  }, [isOpen, existingAddress, reset]);

  const onSubmit = async (data: AddressFormData) => {
    if (!user) return;
    const userDocRef = doc(firestore, 'users', user.uid);
    try {
        await updateDoc(userDocRef, { address: data });
        onSuccess();
    } catch (error) {
        console.error("Error saving address:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{existingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
            <DialogDescription>
              Enter your shipping information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" {...register('fullName')} />
                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="streetAddress">Street Address</Label>
                <Input id="streetAddress" {...register('streetAddress')} />
                {errors.streetAddress && <p className="text-sm text-destructive">{errors.streetAddress.message}</p>}
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...register('city')} />
                    {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="state">State / Province</Label>
                    <Input id="state" {...register('state')}/>
                    {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="zip">ZIP / Postal Code</Label>
                    <Input id="zip" {...register('zip')}/>
                    {errors.zip && <p className="text-sm text-destructive">{errors.zip.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" {...register('phone')}/>
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Address
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

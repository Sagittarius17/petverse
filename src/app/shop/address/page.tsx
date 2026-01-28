'use client';

import { useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, DocumentData } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Home, Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AddressFormDialog } from './address-form-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface Address {
    fullName: string;
    streetAddress: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
}

interface UserProfile extends DocumentData {
    address?: Address;
}

function AddressCard({ address, onEdit, onDelete }: { address: Address; onEdit: () => void; onDelete: () => void; }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Home className="h-5 w-5" /> Shipping Address
                    </CardTitle>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={onEdit}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={onDelete}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-1 text-muted-foreground">
                <p className="font-semibold text-foreground">{address.fullName}</p>
                <p>{address.streetAddress}</p>
                <p>{address.city}, {address.state} {address.zip}</p>
                <p>Phone: {address.phone}</p>
            </CardContent>
        </Card>
    )
}

export default function AddressPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const userDocRef = useMemoFirebase(() => 
        user ? doc(firestore, 'users', user.uid) : null
    , [user, firestore]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

    const isLoading = isUserLoading || isProfileLoading;

    const handleSaveSuccess = () => {
        setIsFormOpen(false);
        toast({
            title: 'Address Saved',
            description: 'Your shipping address has been updated.',
        });
    };
    
    const handleDeleteAddress = async () => {
        if (!userDocRef) return;
        try {
            await updateDoc(userDocRef, { address: null });
            toast({
                title: 'Address Removed',
                description: 'Your shipping address has been deleted.',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to remove address.',
            });
        } finally {
            setIsDeleteDialogOpen(false);
        }
    };

    return (
        <>
            <div className="container mx-auto px-4 py-8 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold font-headline">My Addresses</h1>
                        <p className="text-muted-foreground mt-2">Manage your saved shipping addresses.</p>
                    </div>
                    {!userProfile?.address && !isLoading && (
                        <Button onClick={() => setIsFormOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New Address
                        </Button>
                    )}
                </div>

                {isLoading ? (
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-1/3" />
                        </CardContent>
                    </Card>
                ) : userProfile?.address ? (
                    <AddressCard 
                        address={userProfile.address}
                        onEdit={() => setIsFormOpen(true)}
                        onDelete={() => setIsDeleteDialogOpen(true)}
                    />
                ) : (
                    <Card className="flex flex-col items-center justify-center py-16 text-center">
                        <CardHeader>
                            <Home className="mx-auto h-12 w-12 text-muted-foreground" />
                            <CardTitle className="mt-4">No Saved Address</CardTitle>
                            <CardDescription>You haven't added a shipping address yet.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => setIsFormOpen(true)}>Add an Address</Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            <AddressFormDialog 
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={handleSaveSuccess}
                existingAddress={userProfile?.address}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This will permanently delete your saved shipping address. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAddress} className="bg-destructive hover:bg-destructive/90">
                    Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

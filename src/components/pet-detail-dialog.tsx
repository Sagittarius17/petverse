'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useFirestore, useMemoFirebase, updateDocumentNonBlocking, useDoc, useUser } from '@/firebase';
import { doc, increment, DocumentData, collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Pet } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { useChatStore } from '@/lib/chat-store';
import { useToast } from '@/hooks/use-toast';


const viewedPets = new Set<string>();

interface PetDetailDialogProps {
  pet: Pet | null;
  isOpen: boolean;
  onClose: () => void;
}

interface UserProfile extends DocumentData {
    id: string;
    displayName: string;
    username: string;
    profilePicture?: string;
}

export default function PetDetailDialog({ pet, isOpen, onClose }: PetDetailDialogProps) {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { openChat, setActiveConversationId } = useChatStore();
  const { toast } = useToast();

  const petDocRef = useMemoFirebase(
    () => (firestore && pet ? doc(firestore, 'pets', pet.id) : null),
    [firestore, pet]
  );
  
  const ownerDocRef = useMemoFirebase(
    () => (firestore && pet?.userId ? doc(firestore, 'users', pet.userId) : null),
    [firestore, pet]
  );
  
  const { data: owner, isLoading: isOwnerLoading } = useDoc<UserProfile>(ownerDocRef);


  useEffect(() => {
    if (isOpen && petDocRef) {
      if (!viewedPets.has(petDocRef.id)) {
        updateDocumentNonBlocking(petDocRef, {
          viewCount: increment(1)
        });
        viewedPets.add(petDocRef.id);
      }
    }
  }, [isOpen, petDocRef]);

  const handleStartChat = async (initialMessage?: string) => {
    if (!currentUser || !owner || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Please log in',
        description: 'You need to be logged in to chat with the owner.',
      });
      return;
    }

    if (currentUser.uid === owner.id) {
        toast({
            variant: 'destructive',
            title: 'This is your pet!',
            description: "You can't start a chat with yourself.",
        });
        return;
    }

    const conversationId = [currentUser.uid, owner.id].sort().join('_');
    const conversationsRef = collection(firestore, 'conversations');
    const q = query(conversationsRef, where('__name__', '==', conversationId));

    try {
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        const conversationDocRef = doc(conversationsRef, conversationId);
        await addDoc(collection(conversationDocRef, 'messages'), {
          senderId: currentUser.uid,
          text: initialMessage || `Hi, I'm interested in ${pet?.name}!`,
          timestamp: serverTimestamp(),
        });
      } else if (initialMessage) {
        // If convo exists and there's a specific initial message
        const conversationDocRef = doc(conversationsRef, conversationId);
         await addDoc(collection(conversationDocRef, 'messages'), {
          senderId: currentUser.uid,
          text: initialMessage,
          timestamp: serverTimestamp(),
        });
      }

      setActiveConversationId(conversationId);
      openChat();
      onClose(); // Close the pet detail dialog

    } catch (error) {
      console.error("Error starting chat:", error);
      toast({
        variant: 'destructive',
        title: 'Error starting chat',
        description: 'Could not initiate the conversation. Please try again.',
      });
    }
  };


  if (!pet) {
    return null;
  }

  const image = PlaceHolderImages.find(p => p.id === pet.imageId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Section */}
            <div className="relative h-96 w-full md:h-full min-h-[300px]">
                {image && (
                <Image
                    src={image.imageUrl}
                    alt={`Photo of ${pet.name}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    data-ai-hint={image.imageHint}
                    priority
                />
                )}
            </div>

            {/* Details Section */}
            <div className="flex flex-col space-y-6 p-6 overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-4xl font-bold font-headline tracking-tight">{pet.name}</DialogTitle>
                     <DialogDescription className="sr-only">Detailed information about {pet.name}, a {pet.breed} available for adoption.</DialogDescription>
                    <div className="pt-4 flex flex-wrap gap-2">
                        <Badge variant="default" className="text-md">{pet.breed}</Badge>
                        <Badge variant="secondary" className="text-md">{pet.age}</Badge>
                        <Badge variant="secondary" className="text-md">{pet.gender}</Badge>
                    </div>
                </DialogHeader>

                <div>
                    <h2 className="text-xl font-bold font-headline">About {pet.name}</h2>
                    <p className="mt-2 text-muted-foreground leading-relaxed">{pet.description}</p>
                </div>

                <Card className="bg-background">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Contact Owner</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {isOwnerLoading ? (
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[150px]" />
                                <Skeleton className="h-4 w-[100px]" />
                            </div>
                        </div>
                       ) : owner ? (
                        <div className="flex items-center space-x-4 mb-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={owner.profilePicture} />
                                <AvatarFallback>{owner.displayName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{owner.displayName}</p>
                                <p className="text-sm text-muted-foreground">@{owner.username}</p>
                            </div>
                        </div>
                       ) : null}

                        <p className="mb-4 text-sm text-muted-foreground">
                            Ready to take the next step? Get in touch with the owner to ask questions or arrange a meet-and-greet.
                        </p>
                        <div className="space-y-3">
                            <Button variant="outline" className="w-full justify-start" onClick={() => handleStartChat(`Hi! I'd like to inquire about getting your email for ${pet.name}.`)}>
                                <Mail className="mr-2 h-4 w-4" /> Ask for email
                            </Button>
                             <Button variant="outline" className="w-full justify-start" onClick={() => handleStartChat(`Hi! Could I get your phone number to discuss ${pet.name}?`)}>
                                <Phone className="mr-2 h-4 w-4" /> Ask for phone number
                            </Button>
                        </div>
                        <Button className="mt-6 w-full text-lg" size="lg" onClick={() => handleStartChat()}>
                            <MessageSquare className="mr-2" /> Chat With The Owner
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

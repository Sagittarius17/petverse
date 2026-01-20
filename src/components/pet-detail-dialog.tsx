'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useFirestore, useMemoFirebase, updateDocumentNonBlocking, useUser, useDoc } from '@/firebase';
import { doc, increment, DocumentData, collection, getDoc, query, where, addDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import type { Pet } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MessageSquare, Eye, AtSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { useChatStore } from '@/lib/chat-store';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';


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

function PetOwnerInfo({ ownerId }: { ownerId: string }) {
    const firestore = useFirestore();
    const ownerDocRef = useMemoFirebase(
        () => (firestore && ownerId ? doc(firestore, 'users', ownerId) : null),
        [firestore, ownerId]
    );
    const { data: ownerProfile, isLoading } = useDoc<UserProfile>(ownerDocRef);

    if (isLoading) {
        return (
            <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[100px]" />
                </div>
            </div>
        );
    }
    
    if (!ownerProfile) {
        return (
             <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                    <AvatarFallback>?</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">Unknown Owner</p>
                    <p className="text-sm text-muted-foreground">This pet is looking for a home!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
                <AvatarImage src={ownerProfile.profilePicture} alt={ownerProfile.displayName} />
                <AvatarFallback>{ownerProfile.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-semibold">{ownerProfile.displayName}</p>
                <p className="text-sm text-muted-foreground">@{ownerProfile.username}</p>
            </div>
        </div>
    );
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
  
  const ownerId = pet?.userId;
  const ownerDocRef = useMemoFirebase(
    () => (firestore && ownerId ? doc(firestore, 'users', ownerId) : null),
    [firestore, ownerId]
  );
  const { data: ownerProfile } = useDoc<UserProfile>(ownerDocRef);


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
    if (!currentUser || !ownerId || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Please log in',
        description: 'You need to be logged in to chat with the owner.',
      });
      return;
    }

    if (currentUser.uid === ownerId) {
        toast({
            variant: 'destructive',
            title: 'This is your pet!',
            description: "You can't start a chat with yourself.",
        });
        return;
    }

    const conversationId = [currentUser.uid, ownerId].sort().join('_');
    const conversationDocRef = doc(firestore, 'conversations', conversationId);
    const messageText = initialMessage || `Hi, I'm interested in ${pet?.name}!`;
    
    try {
      const conversationSnap = await getDoc(conversationDocRef);
      const otherParticipantId = ownerId;

      if (!conversationSnap.exists()) {
        await setDoc(conversationDocRef, {
            participants: [currentUser.uid, otherParticipantId],
            unreadCount: { [otherParticipantId]: 1 },
            lastMessage: {
              text: messageText,
              timestamp: serverTimestamp(),
              senderId: currentUser.uid,
            }
        });
      } else {
         await updateDoc(conversationDocRef, {
            [`unreadCount.${otherParticipantId}`]: increment(1),
            lastMessage: {
              text: messageText,
              timestamp: serverTimestamp(),
              senderId: currentUser.uid,
            }
        });
      }


      await addDoc(collection(conversationDocRef, 'messages'), {
          senderId: currentUser.uid,
          text: messageText,
          timestamp: serverTimestamp(),
      });

      setActiveConversationId(conversationId);
      openChat();
      onClose();

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
  
  const isOwner = currentUser?.uid === pet.userId;
  const isAvailable = pet.isAdoptable !== false;

  const image = useMemo(() => {
    if (pet.imageId?.startsWith('data:image')) {
        return {
            imageUrl: pet.imageId,
            description: pet.name,
            imageHint: pet.breed.toLowerCase(),
        };
    }
    return PlaceHolderImages.find(p => p.id === pet.imageId);
  }, [pet.imageId, pet.name, pet.breed]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
            <div className="md:grid md:grid-cols-2">
                <div className="relative h-80 w-full md:h-full md:min-h-[500px]">
                    {image ? (
                    <Image
                        src={image.imageUrl}
                        alt={`Photo of ${pet.name}`}
                        fill
                        style={{ objectFit: 'cover' }}
                        data-ai-hint={image.imageHint}
                        priority
                    />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-secondary">
                            <p className="text-muted-foreground">No Image Available</p>
                        </div>
                    )}
                    {ownerProfile?.username && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                            <AtSign className="h-3 w-3" />
                            <span className="font-semibold">{ownerProfile.username}</span>
                        </div>
                    )}
                    <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                        <Eye className="h-3 w-3" />
                        <span className="font-semibold">{pet.viewCount || 0}</span>
                    </div>
                </div>

                <div className="flex flex-col space-y-6 p-6">
                    <DialogHeader>
                        <div className="flex items-center gap-4">
                            <DialogTitle className="text-4xl font-bold font-headline tracking-tight">{pet.name}</DialogTitle>
                            <Badge className={cn(!isAvailable ? "bg-green-600 hover:bg-green-700" : "bg-secondary text-secondary-foreground")}>
                                {isAvailable ? 'Available' : 'Adopted'}
                            </Badge>
                        </div>
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
                           {ownerId ? <PetOwnerInfo ownerId={ownerId} /> : <Skeleton className="h-12 w-full" />}
                            <p className="my-4 text-sm text-muted-foreground">
                                {isOwner ? "This is your pet's listing." : isAvailable ? "Ready to take the next step? Get in touch with the owner to ask questions or arrange a meet-and-greet." : "This pet has already found a loving home."}
                            </p>
                            <div className="space-y-3">
                                <Button variant="outline" className="w-full justify-start" onClick={() => handleStartChat(`Hi! I'd like to inquire about getting your email for ${pet.name}.`)} disabled={isOwner || !isAvailable}>
                                    <Mail className="mr-2 h-4 w-4" /> Ask for email
                                </Button>
                                 <Button variant="outline" className="w-full justify-start" onClick={() => handleStartChat(`Hi! Could I get your phone number to discuss ${pet.name}?`)} disabled={isOwner || !isAvailable}>
                                    <Phone className="mr-2 h-4 w-4" /> Ask for phone number
                                </Button>
                            </div>
                            <Button className="mt-6 w-full text-lg" size="lg" onClick={() => handleStartChat()} disabled={isOwner || !isAvailable}>
                                <MessageSquare className="mr-2" /> {isAvailable ? 'Chat With The Owner' : 'Already Adopted'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

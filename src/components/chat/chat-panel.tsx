
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc, addDoc, serverTimestamp, updateDoc, Timestamp, orderBy, DocumentData } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { User } from 'firebase/auth';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import MessageBubble from './message-bubble';
import { useChatStore } from '@/lib/chat-store';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';

interface Conversation {
  id: string;
  participants: string[];
  otherParticipant: {
    id: string;
    displayName: string;
    photoURL?: string;
    isOnline?: boolean;
  } | null;
  lastMessage?: {
    text: string;
    timestamp: Timestamp;
  };
  typing?: {
    [key: string]: boolean;
  };
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
}

interface UserProfile extends DocumentData {
    id: string;
    displayName: string;
    photoURL?: string;
    isOnline?: boolean;
    lastSeen?: Timestamp;
}


interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

function formatRelativeTime(timestamp?: Timestamp): string {
    if (!timestamp) return '';
    return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
}

function formatMessageTimestamp(timestamp?: Timestamp): string {
  if (!timestamp) return '';
  return format(timestamp.toDate(), 'h:mm a');
}

function formatDateSeparator(timestamp: Timestamp): string {
  const date = timestamp.toDate();
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
}


function OtherParticipantStatus({ otherParticipantId, typingStatus }: { otherParticipantId: string, typingStatus?: boolean }) {
  const firestore = useFirestore();
  const userDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'users', otherParticipantId) : null),
    [firestore, otherParticipantId]
  );
  const { data: userProfile, isLoading } = useDoc<UserProfile>(userDocRef);

  if (isLoading) {
    return <Skeleton className="h-4 w-20" />;
  }

  if (typingStatus) {
    return <p className="text-sm text-green-400 animate-pulse">typing...</p>;
  }

  if (userProfile?.isOnline) {
    return <p className="text-sm text-green-400">Online</p>;
  }

  if (userProfile?.lastSeen) {
    return <p className="text-sm text-muted-foreground">last seen {formatRelativeTime(userProfile.lastSeen)}</p>;
  }

  return <p className="text-sm text-muted-foreground">Offline</p>;
}


export default function ChatPanel({ isOpen, onClose, currentUser }: ChatPanelProps) {
  const firestore = useFirestore();
  const { activeConversationId, setActiveConversationId } = useChatStore();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingConvos, setIsLoadingConvos] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Fetch conversations where the current user is a participant
  useEffect(() => {
    if (!firestore || !currentUser) return;

    setIsLoadingConvos(true);
    const q = query(collection(firestore, 'conversations'), where('participants', 'array-contains', currentUser.uid));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const convosPromises = querySnapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const otherParticipantId = data.participants.find((p: string) => p !== currentUser.uid);
        
        let otherParticipant: Conversation['otherParticipant'] = null;
        
        if (otherParticipantId) {
          const userDoc = await getDoc(doc(firestore, 'users', otherParticipantId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            otherParticipant = {
              id: userDoc.id,
              displayName: userData.displayName || userData.username || 'User',
              photoURL: userData.profilePicture || '',
              isOnline: userData.isOnline || false, // Get initial status
            };
          }
        }
        
        return {
          id: docSnap.id,
          participants: data.participants,
          lastMessage: data.lastMessage,
          typing: data.typing || {},
          otherParticipant,
        } as Conversation;
      });

      let resolvedConvos = await Promise.all(convosPromises);
      
      resolvedConvos.sort((a, b) => {
        const timeA = a.lastMessage?.timestamp?.toMillis() || 0;
        const timeB = b.lastMessage?.timestamp?.toMillis() || 0;
        return timeB - timeA;
      });

      setConversations(resolvedConvos);
      setIsLoadingConvos(false);
    });

    return () => unsubscribe();
  }, [firestore, currentUser]);

  // Real-time listener for participant online status
  useEffect(() => {
      if (!firestore || conversations.length === 0) return;

      const unsubscribers = conversations.map(convo => {
          if (convo.otherParticipant) {
              const userDocRef = doc(firestore, 'users', convo.otherParticipant.id);
              return onSnapshot(userDocRef, (userDoc) => {
                  if (userDoc.exists()) {
                      const userData = userDoc.data() as UserProfile;
                      setConversations(prevConvos => 
                          prevConvos.map(p => {
                              if (p.otherParticipant && p.otherParticipant.id === userData.id) {
                                  return {
                                      ...p,
                                      otherParticipant: {
                                          ...p.otherParticipant,
                                          isOnline: userData.isOnline,
                                      }
                                  };
                              }
                              return p;
                          })
                      );
                  }
              });
          }
          return () => {}; // Return a no-op function for convos without other participants
      });

      return () => {
          unsubscribers.forEach(unsub => unsub());
      };

  }, [firestore, conversations.length]); // Rerun when the number of conversations changes.
  
  // Fetch messages for the active conversation
  useEffect(() => {
    if (!firestore || !activeConversationId) {
      setMessages([]);
      return;
    }

    setIsLoadingMessages(true);
    const messagesQuery = query(
      collection(firestore, `conversations/${activeConversationId}/messages`),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      setIsLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [firestore, activeConversationId]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const updateTypingStatus = (isTyping: boolean) => {
    if (!firestore || !activeConversationId || !currentUser) return;
    const convoDocRef = doc(firestore, 'conversations', activeConversationId);
    updateDoc(convoDocRef, {
        [`typing.${currentUser.uid}`]: isTyping
    });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
    } else {
        updateTypingStatus(true);
    }

    typingTimeoutRef.current = setTimeout(() => {
        updateTypingStatus(false);
        typingTimeoutRef.current = null;
    }, 3000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !firestore || !activeConversationId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    updateTypingStatus(false);

    const convoDocRef = doc(firestore, 'conversations', activeConversationId);
    
    await addDoc(collection(convoDocRef, 'messages'), {
      senderId: currentUser.uid,
      text: newMessage,
      timestamp: serverTimestamp(),
    });
    
    await updateDoc(convoDocRef, {
        lastMessage: {
            text: newMessage,
            timestamp: serverTimestamp(),
            senderId: currentUser.uid,
        }
    });

    setNewMessage('');
  };

  const selectedConversation = conversations.find(c => c.id === activeConversationId);

  const renderConversationList = () => (
    <div className="flex flex-col h-full">
      <SheetHeader className="p-4 border-b">
        <SheetTitle>Messages</SheetTitle>
      </SheetHeader>
      <ScrollArea className="flex-1">
        {isLoadingConvos ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))
        ) : conversations.length > 0 ? (
          conversations.map(convo => (
            <div
              key={convo.id}
              className="flex items-start gap-4 p-4 cursor-pointer hover:bg-muted"
              onClick={() => setActiveConversationId(convo.id)}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={convo.otherParticipant?.photoURL} />
                  <AvatarFallback>{convo.otherParticipant?.displayName[0] || 'U'}</AvatarFallback>
                </Avatar>
                {convo.otherParticipant?.isOnline && (
                  <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold truncate">{convo.otherParticipant?.displayName || 'Unknown User'}</p>
                <p className="text-sm text-muted-foreground truncate">{convo.lastMessage?.text}</p>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {formatRelativeTime(convo.lastMessage?.timestamp)}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            <p>No conversations yet.</p>
            <p className="text-sm">Start a chat from a pet's page!</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );

  const renderMessageView = () => (
    <div className="flex flex-col h-full">
        {selectedConversation && selectedConversation.otherParticipant ? (
            <>
            <SheetHeader className="p-4 border-b flex-row items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setActiveConversationId(null)}>
                    <ArrowLeft />
                </Button>
                <Avatar>
                    <AvatarImage src={selectedConversation.otherParticipant.photoURL} />
                    <AvatarFallback>{selectedConversation.otherParticipant.displayName[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                    <SheetTitle className="truncate">{selectedConversation.otherParticipant.displayName || 'Chat'}</SheetTitle>
                    <SheetDescription asChild>
                         <OtherParticipantStatus 
                            otherParticipantId={selectedConversation.otherParticipant.id} 
                            typingStatus={selectedConversation.typing?.[selectedConversation.otherParticipant.id]}
                        />
                    </SheetDescription>
                </div>
            </SheetHeader>
            <ScrollArea className="flex-1 bg-secondary/50 p-4">
                {isLoadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-2">
                        {messages.map((msg, index) => {
                            const prevMsg = messages[index - 1];
                            const showDateSeparator = !prevMsg || !msg.timestamp || !prevMsg.timestamp || !isSameDay(msg.timestamp.toDate(), prevMsg.timestamp.toDate());
                            return (
                                <React.Fragment key={msg.id}>
                                    {showDateSeparator && msg.timestamp && (
                                        <div className="text-center text-xs text-muted-foreground my-4">
                                            {formatDateSeparator(msg.timestamp)}
                                        </div>
                                    )}
                                    <MessageBubble message={msg} isCurrentUser={msg.senderId === currentUser.uid} />
                                </React.Fragment>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </ScrollArea>
            <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-2">
                <Input
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    autoComplete="off"
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                    <Send className="h-5 w-5" />
                </Button>
            </form>
            </>
        ) : (
            <div className="h-full flex flex-col">
                 <SheetHeader className="p-4 border-b">
                    <SheetTitle>Error</SheetTitle>
                </SheetHeader>
                <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                    <p className="text-lg font-semibold">Conversation Not Found</p>
                    <p className="text-sm">Could not find the selected conversation.</p>
                    <Button variant="link" onClick={() => setActiveConversationId(null)}>Back to conversations</Button>
                </div>
            </div>
        )}
    </div>
  );


  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="p-0 w-full sm:max-w-md">
            {activeConversationId ? renderMessageView() : renderConversationList()}
        </SheetContent>
    </Sheet>
  );
}

function isSameDay(date1: Date, date2: Date) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

    

    
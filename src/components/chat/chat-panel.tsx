
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc, addDoc, serverTimestamp, updateDoc, Timestamp, orderBy, DocumentData, increment, writeBatch } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { User } from 'firebase/auth';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import MessageBubble from './message-bubble';
import { useChatStore } from '@/lib/chat-store';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { billuChatbot } from '@/ai/flows/billu-chatbot';
import { Badge } from '../ui/badge';

interface Conversation {
  id: string;
  participants: string[];
  otherParticipant: {
    id: string;
    displayName: string;
    photoURL?: string;
    isOnline?: boolean;
    status?: 'Active' | 'Inactive';
  } | null;
  lastMessage?: {
    text: string;
    timestamp: Timestamp;
    senderId?: string;
  };
  typing?: {
    [key: string]: boolean;
  };
  unreadCount?: {
      [key: string]: number;
  };
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
  isRead?: boolean;
}

interface UserProfile extends DocumentData {
    id: string;
    username: string;
    displayName: string;
    photoURL?: string;
    isOnline?: boolean;
    lastSeen?: Timestamp;
    status?: 'Active' | 'Inactive';
}


interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

const BILLU_CONVERSATION_ID = 'ai-chatbot-billu';
const billuAvatar = PlaceHolderImages.find(p => p.id === 'billu-avatar') || { imageUrl: '', imageHint: 'cat' };

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

// New component for the presence indicator dot
function PresenceIndicator({ userId }: { userId: string }) {
    const firestore = useFirestore();
    const userDocRef = useMemoFirebase(
      () => (firestore ? doc(firestore, 'users', userId) : null),
      [firestore, userId]
    );
    const { data: userProfile } = useDoc<UserProfile>(userDocRef);

    if (userProfile?.status === 'Inactive') return null;
  
    if (userProfile?.isOnline) {
      return <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />;
    }
  
    return null;
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

  if (userProfile?.status === 'Inactive') {
      return <p className="text-sm text-destructive">Suspended</p>;
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
  
  const [billuChatHistory, setBilluChatHistory] = useState<Message[]>([]);
  const [isBilluThinking, setIsBilluThinking] = useState(false);

  const handleConversationSelect = async (convoId: string) => {
    setActiveConversationId(convoId);
    if (convoId !== BILLU_CONVERSATION_ID && firestore && currentUser && !currentUser.isAnonymous) {
        const convoRef = doc(firestore, 'conversations', convoId);
        await updateDoc(convoRef, {
            [`unreadCount.${currentUser.uid}`]: 0
        });
    }
  };


  // Fetch conversations where the current user is a participant
  useEffect(() => {
    if (!firestore || !currentUser || currentUser.isAnonymous) {
        setConversations([]);
        setIsLoadingConvos(false);
        return;
    };

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
              displayName: userData.username || userData.displayName || 'User',
              photoURL: userData.profilePicture || '',
              isOnline: userData.isOnline || false,
              status: userData.status || 'Active',
            };
          }
        }
        
        return {
          id: docSnap.id,
          participants: data.participants,
          lastMessage: data.lastMessage,
          typing: data.typing || {},
          unreadCount: data.unreadCount || {},
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

  
  // Fetch messages for the active conversation and mark as read
  useEffect(() => {
    if (!firestore || !activeConversationId || activeConversationId === BILLU_CONVERSATION_ID || !currentUser) {
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

      // Mark received messages as read
      const batch = writeBatch(firestore);
      let hasUnread = false;
      querySnapshot.docs.forEach(docSnap => {
        const msgData = docSnap.data();
        if (msgData.senderId !== currentUser.uid && !msgData.isRead) {
          batch.update(docSnap.ref, { isRead: true });
          hasUnread = true;
        }
      });

      if (hasUnread) {
        batch.commit().catch(e => console.error("Failed to mark messages as read", e));
      }
    });

    return () => unsubscribe();
  }, [firestore, activeConversationId, currentUser]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, billuChatHistory, isBilluThinking]);

  const updateTypingStatus = (isTyping: boolean) => {
    if (!firestore || !activeConversationId || !currentUser) return;
    const convoDocRef = doc(firestore, 'conversations', activeConversationId);
    updateDoc(convoDocRef, {
        [`typing.${currentUser.uid}`]: isTyping
    });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (activeConversationId === BILLU_CONVERSATION_ID || currentUser.isAnonymous) return;

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
  
  const handleBilluSubmit = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      senderId: currentUser.uid,
      text: newMessage,
      timestamp: Timestamp.now(),
    };
    
    setBilluChatHistory(prev => [...prev, userMessage]);
    setIsBilluThinking(true);
    const currentMessage = newMessage;
    setNewMessage('');
    
    try {
      const { response } = await billuChatbot({ message: currentMessage });
      const billuMessage: Message = {
        id: `billu-${Date.now()}`,
        senderId: BILLU_CONVERSATION_ID,
        text: response,
        timestamp: Timestamp.now(),
      };
      setBilluChatHistory(prev => [...prev, billuMessage]);
    } catch (e) {
      console.error("Billu chatbot failed:", e);
      const errorMessage: Message = {
        id: `billu-error-${Date.now()}`,
        senderId: BILLU_CONVERSATION_ID,
        text: "Meow! I'm having a little trouble thinking right now. Please try again later. 😿",
        timestamp: Timestamp.now(),
      };
      setBilluChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsBilluThinking(false);
    }
  }


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeConversationId === BILLU_CONVERSATION_ID) {
        handleBilluSubmit();
        return;
    }
    
    if (!newMessage.trim() || !firestore || !activeConversationId || !currentUser || currentUser.isAnonymous) return;

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
      isRead: false,
    });
    
    const otherParticipantId = selectedConversation?.otherParticipant?.id;
    if (otherParticipantId) {
        const unreadCountUpdate = {
            [`unreadCount.${otherParticipantId}`]: increment(1),
            lastMessage: {
                text: newMessage,
                timestamp: serverTimestamp(),
                senderId: currentUser.uid,
            }
        };
        await updateDoc(convoDocRef, unreadCountUpdate);
    }

    setNewMessage('');
  };

  const selectedConversation = conversations.find(c => c.id === activeConversationId);
  const pinnedBilluConversation: Conversation = {
    id: BILLU_CONVERSATION_ID,
    participants: [currentUser.uid, BILLU_CONVERSATION_ID],
    otherParticipant: {
      id: BILLU_CONVERSATION_ID,
      displayName: 'Ask Billu!',
      photoURL: billuAvatar.imageUrl,
      isOnline: true,
      status: 'Active',
    },
    lastMessage: {
      text: "Your AI companion for anything pet-related!",
      timestamp: Timestamp.now(),
    },
  };

  const allConversations = currentUser.isAnonymous ? [pinnedBilluConversation] : [pinnedBilluConversation, ...conversations];


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
        ) : allConversations.length > 0 ? (
          <div className="p-2">
            {allConversations.map(convo => {
              const unread = convo.unreadCount?.[currentUser.uid] || 0;
              const isActive = activeConversationId === convo.id;
              const isSuspended = convo.otherParticipant?.status === 'Inactive';
              return (
                <div
                  key={convo.id}
                  className={cn(
                    "flex items-start gap-4 p-3 cursor-pointer rounded-lg border transition-colors",
                    isActive
                      ? "bg-muted border-primary"
                      : "border-transparent hover:bg-muted"
                  )}
                  onClick={() => handleConversationSelect(convo.id)}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={isSuspended ? undefined : convo.otherParticipant?.photoURL} />
                      <AvatarFallback>{isSuspended ? '?' : convo.otherParticipant?.displayName[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    {convo.otherParticipant && convo.id !== BILLU_CONVERSATION_ID && (
                       <PresenceIndicator userId={convo.otherParticipant.id} />
                    )}
                    {convo.id === BILLU_CONVERSATION_ID && (
                        <div className="absolute bottom-0 right-0 block p-0.5 rounded-full bg-primary ring-2 ring-background">
                            <Sparkles className="h-2 w-2 text-primary-foreground" />
                        </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden min-w-0">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{isSuspended ? '[User Deleted/Suspended]' : (convo.otherParticipant?.displayName || 'Unknown User')}</Badge>
                          {unread > 0 && (
                              <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center">{unread}</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap pl-2">
                            {formatRelativeTime(convo.lastMessage?.timestamp)}
                        </span>
                    </div>
                    <p className={cn("text-sm truncate", unread > 0 ? "font-bold text-foreground" : "text-muted-foreground")}>
                        {convo.lastMessage?.senderId === currentUser.uid && 'You: '}
                        {convo.lastMessage?.text}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            <p>No conversations yet.</p>
            <p className="text-sm">Start a chat from a pet's page!</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );

  const renderMessageView = () => {
    if (activeConversationId === BILLU_CONVERSATION_ID) return renderBilluChatView();
    
    const isSuspended = selectedConversation?.otherParticipant?.status === 'Inactive';

    return (
        <div className="flex flex-col h-full">
            {selectedConversation && selectedConversation.otherParticipant ? (
                <>
                <SheetHeader className="p-4 border-b flex-row items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setActiveConversationId(null)}>
                        <ArrowLeft />
                    </Button>
                    <Avatar>
                        <AvatarImage src={isSuspended ? undefined : selectedConversation.otherParticipant.photoURL} />
                        <AvatarFallback>{isSuspended ? '?' : selectedConversation.otherParticipant.displayName[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <SheetTitle className="truncate">{isSuspended ? '[User Deleted/Suspended]' : (selectedConversation.otherParticipant.displayName || 'Chat')}</SheetTitle>
                        <SheetDescription asChild>
                             <OtherParticipantStatus 
                                otherParticipantId={selectedConversation.otherParticipant.id} 
                                typingStatus={isSuspended ? false : selectedConversation.typing?.[selectedConversation.otherParticipant.id]}
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
  }

  const renderBilluChatView = () => (
    <div className="flex flex-col h-full">
        <SheetHeader className="p-4 border-b flex-row items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setActiveConversationId(null)}>
                <ArrowLeft />
            </Button>
            <Avatar>
                <AvatarImage src={billuAvatar.imageUrl} />
                <AvatarFallback>B</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
                <SheetTitle className="truncate">Ask Billu!</SheetTitle>
                 <SheetDescription>Your AI companion</SheetDescription>
            </div>
        </SheetHeader>
        <ScrollArea className="flex-1 bg-secondary/50 p-4">
            <div className="text-center my-8">
                <Avatar className="h-16 w-16 mx-auto mb-4">
                    <AvatarImage src={billuAvatar.imageUrl} />
                    <AvatarFallback>B</AvatarFallback>
                </Avatar>
                <p className="font-semibold">Ask Billu anything!</p>
                <p className="text-sm text-muted-foreground">Your purr-fect AI companion. 🐾</p>
            </div>
            <div className="space-y-2">
                {billuChatHistory.map((msg) => (
                     <MessageBubble key={msg.id} message={msg} isCurrentUser={msg.senderId === currentUser.uid} />
                ))}
                {isBilluThinking && (
                    <div className="flex items-end gap-2 justify-start">
                        <div className="max-w-xs md:max-w-md rounded-2xl px-3 py-2 relative bg-background border rounded-bl-none">
                            <p className="text-sm break-words animate-pulse">Billu is thinking...</p>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-2">
            <Input
                value={newMessage}
                onChange={handleTyping}
                placeholder="Ask Billu something..."
                autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim() || isBilluThinking}>
                <Send className="h-5 w-5" />
            </Button>
        </form>
    </div>
  );


  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="floating-right" className="p-0 w-full sm:max-w-md">
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

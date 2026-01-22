'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { collection, query, where, onSnapshot, doc, getDoc, addDoc, serverTimestamp, updateDoc, Timestamp, orderBy, DocumentData, increment, writeBatch } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { User } from 'firebase/auth';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Loader2, Sparkles, Paperclip, Mic, X, Square, CornerUpLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import MessageBubble from './message-bubble';
import { useChatStore } from '@/lib/chat-store';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { billuChatbot } from '@/ai/flows/billu-chatbot';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ReplyContext {
  messageId: string;
  senderId: string;
  text?: string;
  mediaType?: 'image' | 'audio';
}

interface Message {
  id: string;
  senderId: string;
  text?: string;
  timestamp: Timestamp;
  isRead?: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio';
  replyTo?: ReplyContext;
}

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
    return <Skeleton className="h-3 w-20" />;
  }

  if (userProfile?.status === 'Inactive') {
      return <p className="text-xs absolute left-18 top-7 text-destructive">Suspended</p>;
  }

  if (typingStatus) {
    return <p className="text-xs absolute left-18 top-7 text-green-400 animate-pulse">typing...</p>;
  }

  if (userProfile?.isOnline) {
    return <p className="text-xs absolute left-18 top-7 text-green-400">Online</p>;
  }

  if (userProfile?.lastSeen) {
    return <p className="text-xs absolute left-18 top-7 text-muted-foreground">last seen {formatRelativeTime(userProfile.lastSeen)}</p>;
  }

  return <p className="text-xs absolute left-18 top-7 text-muted-foreground">Offline</p>;
}


export default function ChatPanel({ isOpen, onClose, currentUser }: ChatPanelProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { activeConversationId, setActiveConversationId, replyingTo, setReplyingTo } = useChatStore();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingConvos, setIsLoadingConvos] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  
  const [billuChatHistory, setBilluChatHistory] = useState<Message[]>([]);
  const [isBilluThinking, setIsBilluThinking] = useState(false);
  
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const shouldSendOnStop = useRef(true);
  const recordingStartPos = useRef<{ x: number } | null>(null);


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
  }, [messages, billuChatHistory, isBilluThinking, mediaPreview]);

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
  
  const handleBilluSubmit = async (messageText: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      senderId: currentUser.uid,
      text: messageText,
      timestamp: Timestamp.now(),
      isRead: true,
    };
    
    setBilluChatHistory(prev => [...prev, userMessage]);
    setIsBilluThinking(true);
    
    try {
      const { response } = await billuChatbot({ message: messageText });
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
    if (!newMessage.trim() && !mediaFile) return;

    const messageText = newMessage.trim();
    
    if (activeConversationId === BILLU_CONVERSATION_ID) {
      handleBilluSubmit(messageText);
      setNewMessage('');
      return;
    }
    
    if (!firestore || !activeConversationId || !currentUser || currentUser.isAnonymous) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    updateTypingStatus(false);
    
    let messageData: Partial<Message> & { senderId: string, timestamp: any } = {
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        isRead: false,
    };

    if (messageText) {
        messageData.text = messageText;
    }

    if (mediaFile && mediaPreview) {
        messageData.mediaUrl = mediaPreview;
        messageData.mediaType = mediaFile.type.startsWith('image/') ? 'image' : 'audio'; // Simplified
    }

    if (replyingTo) {
      messageData.replyTo = {
        messageId: replyingTo.id,
        senderId: replyingTo.senderId,
        text: replyingTo.text ? replyingTo.text.substring(0, 70) + (replyingTo.text.length > 70 ? '...' : '') : undefined,
        mediaType: replyingTo.mediaType,
      }
    }
    
    const convoDocRef = doc(firestore, 'conversations', activeConversationId);
    await addDoc(collection(convoDocRef, 'messages'), messageData);
    
    const otherParticipantId = selectedConversation?.otherParticipant?.id;
    if (otherParticipantId) {
        const lastMessageText = messageText || (mediaFile?.type.startsWith('image/') ? 'Sent an image' : 'Sent a voice note');
        await updateDoc(convoDocRef, {
            [`unreadCount.${otherParticipantId}`]: increment(1),
            lastMessage: {
                text: lastMessageText,
                timestamp: serverTimestamp(),
                senderId: currentUser.uid,
            }
        });
    }

    setNewMessage('');
    setMediaFile(null);
    setMediaPreview(null);
    setReplyingTo(null);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Only image files are supported at this time.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string);
        setMediaFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearMediaPreview = () => {
    setMediaPreview(null);
    setMediaFile(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleMicButtonPress = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isRecording || activeConversationId === BILLU_CONVERSATION_ID) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      shouldSendOnStop.current = true;

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        stream.getTracks().forEach(track => track.stop());

        if (!shouldSendOnStop.current) {
          audioChunksRef.current = [];
          return;
        }
        if (!firestore || !activeConversationId || !currentUser) return;
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          const messageData = {
            senderId: currentUser.uid,
            timestamp: serverTimestamp(),
            isRead: false,
            mediaUrl: base64Audio,
            mediaType: 'audio' as const,
          };
          const convoDocRef = doc(firestore, 'conversations', activeConversationId);
          addDoc(collection(convoDocRef, 'messages'), messageData);
          const otherParticipantId = selectedConversation?.otherParticipant?.id;
          if (otherParticipantId) {
            updateDoc(convoDocRef, {
              [`unreadCount.${otherParticipantId}`]: increment(1),
              lastMessage: {
                text: 'Sent a voice note',
                timestamp: serverTimestamp(),
                senderId: currentUser.uid,
              }
            });
          }
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsCancelling(false);

      const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
      recordingStartPos.current = { x: clientX };

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({ variant: 'destructive', title: 'Microphone Error', description: 'Could not access your microphone. Please check permissions.' });
    }
  };

  useEffect(() => {
    if (!isRecording) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!recordingStartPos.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - recordingStartPos.current.x;
      const CANCEL_THRESHOLD = -50;

      if (deltaX < CANCEL_THRESHOLD) {
        setIsCancelling(true);
      } else {
        setIsCancelling(false);
      }
    };

    const handleRelease = () => {
      if (mediaRecorderRef.current?.state === 'recording') {
        shouldSendOnStop.current = !isCancelling;
        mediaRecorderRef.current.stop();
      }

      setIsRecording(false);
      setIsCancelling(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setRecordingTime(0);
      recordingStartPos.current = null;
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('mouseup', handleRelease);
    window.addEventListener('touchend', handleRelease);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleRelease);
      window.removeEventListener('touchend', handleRelease);
    };
  }, [isRecording, isCancelling]);

  const selectedConversation = conversations.find(c => c.id === activeConversationId);
  const otherParticipant = selectedConversation?.otherParticipant;

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
      <SheetHeader className="p-2 border-b">
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
                    <p className={cn("text-sm truncate", unread > 0 ? "font-bold absolute left-[12vh] text-foreground" : "text-xs absolute left-[12vh] text-muted-foreground")}>
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
    
    const isSuspended = otherParticipant?.status === 'Inactive';

    const getReplyDisplayName = (senderId: string) => {
      if (senderId === currentUser.uid) return 'You';
      if (senderId === otherParticipant?.id) return otherParticipant.displayName;
      return 'User';
    };

    return (
        <div className="flex flex-col h-full">
            {selectedConversation && otherParticipant ? (
                <>
                <SheetHeader className="pb-2 px-2 border-b flex-row items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full" onClick={() => setActiveConversationId(null)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={isSuspended ? undefined : otherParticipant.photoURL} />
                        <AvatarFallback>{isSuspended ? '?' : otherParticipant.displayName[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <SheetTitle className="text-sm absolute left-18 top-2 font-semibold truncate">{isSuspended ? '[User Deleted/Suspended]' : (otherParticipant.displayName || 'Chat')}</SheetTitle>
                        <SheetDescription asChild>
                             <OtherParticipantStatus 
                                otherParticipantId={otherParticipant.id} 
                                typingStatus={isSuspended ? false : selectedConversation.typing?.[otherParticipant.id]}
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
                                        <MessageBubble
                                            message={msg}
                                            isCurrentUser={msg.senderId === currentUser.uid}
                                            activeConversationId={activeConversationId!}
                                            currentUser={currentUser}
                                            otherParticipant={otherParticipant}
                                        />
                                    </React.Fragment>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </ScrollArea>
                <form onSubmit={handleSendMessage} className="p-2 border-t">
                    {replyingTo && (
                        <div className="p-2 border-b border-l border-r mx-2 rounded-t-md bg-secondary">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CornerUpLeft className="h-4 w-4 text-primary" />
                              <div>
                                <p className="text-sm font-semibold text-primary">Replying to {replyingTo.displayName}</p>
                                <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                  {replyingTo.text ? replyingTo.text : `A ${replyingTo.mediaType}`}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyingTo(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                    )}
                    {mediaPreview && (
                        <div className="relative p-2">
                            <Image src={mediaPreview} alt="Media preview" width={80} height={80} className="rounded-md" />
                            <Button variant="destructive" size="icon" className="absolute top-0 right-0 h-6 w-6 rounded-full" onClick={clearMediaPreview}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    <div className={cn("relative flex items-center bg-secondary rounded-full", replyingTo && "rounded-t-none")}>
                        <Button type="button" variant="ghost" size="icon" className="shrink-0 rounded-full" onClick={() => fileInputRef.current?.click()} disabled={isRecording}>
                            <Paperclip />
                        </Button>
                         <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" hidden />
                        {isRecording ? (
                             <div className="flex-1 flex items-center justify-between px-2 overflow-hidden h-10">
                                <div className={cn(
                                    "flex w-full items-center justify-between transition-transform duration-200 ease-out",
                                    isCancelling ? "-translate-x-16" : "translate-x-0"
                                )}>
                                    <div className="flex items-center gap-2 text-red-500">
                                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                                        <span className="font-mono text-sm tabular-nums">{new Date(recordingTime * 1000).toISOString().substr(14, 5)}</span>
                                    </div>
                                    <div className="flex items-center text-muted-foreground text-xs">
                                        <ArrowLeft className="h-4 w-4 mr-1" />
                                        <span>Slide to cancel</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Input
                                value={newMessage}
                                onChange={handleTyping}
                                placeholder="Type a message..."
                                autoComplete="off"
                                className="border-0 bg-secondary focus-visible:ring-0 focus-visible:ring-offset-0"
                                disabled={isSuspended}
                            />
                        )}
                        <div className="flex items-center">
                            {newMessage.trim() || mediaPreview ? (
                                <Button type="submit" variant="ghost" size="icon" className="shrink-0 rounded-full text-primary">
                                    <Send />
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className={cn("shrink-0 rounded-full z-10", isRecording && "bg-primary text-primary-foreground animate-pulse")}
                                    onMouseDown={handleMicButtonPress}
                                    onTouchStart={handleMicButtonPress}
                                    disabled={isSuspended}
                                >
                                    <Mic />
                                </Button>
                            )}
                        </div>
                    </div>
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
        <SheetHeader className="pb-2 px-2 border-b flex-row items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full" onClick={() => setActiveConversationId(null)}>
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-9 w-9">
                <AvatarImage src={billuAvatar.imageUrl} />
                <AvatarFallback>B</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
                <SheetTitle className="text-sm absolute left-18 top-2 font-semibold truncate">Ask Billu!</SheetTitle>
                 <SheetDescription className="text-xs absolute left-18 top-6">Your AI companion</SheetDescription>
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
                     <MessageBubble key={msg.id} message={msg} isCurrentUser={msg.senderId === currentUser.uid} activeConversationId={activeConversationId!} currentUser={currentUser} otherParticipant={null}/>
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
        <form onSubmit={handleSendMessage} className="p-2 border-t">
            <div className="relative flex items-center">
                <Input
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Ask Billu something..."
                    autoComplete="off"
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button type="submit" variant="ghost" size="icon" className="shrink-0 rounded-full text-primary" disabled={!newMessage.trim() || isBilluThinking}>
                    <Send />
                </Button>
            </div>
        </form>
    </div>
  );


  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="floating-right" className="p-0 flex flex-col">
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

'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { User } from 'firebase/auth';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import MessageBubble from './message-bubble';
import { useChatStore } from '@/lib/chat-store';
import { cn } from '@/lib/utils';


interface Conversation {
  id: string;
  participants: string[];
  otherParticipant: {
    id: string;
    displayName: string;
    photoURL?: string;
  } | null;
  lastMessage?: {
    text: string;
    timestamp: any;
  };
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: any;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

export default function ChatPanel({ isOpen, onClose, currentUser }: ChatPanelProps) {
  const firestore = useFirestore();
  const { activeConversationId, setActiveConversationId } = useChatStore();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingConvos, setIsLoadingConvos] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Fetch conversations where the current user is a participant
  useEffect(() => {
    if (!firestore || !currentUser) return;

    setIsLoadingConvos(true);
    const q = query(
        collection(firestore, 'conversations'), 
        where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const convosPromises = querySnapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const otherParticipantId = data.participants.find((p: string) => p !== currentUser.uid);
        let otherParticipant = null;

        if (otherParticipantId) {
            const userDoc = await getDoc(doc(firestore, 'users', otherParticipantId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                otherParticipant = {
                    id: userDoc.id,
                    displayName: userData.displayName || userData.username || 'User',
                    photoURL: userData.profilePicture || ''
                };
            }
        }
        
        return {
          id: docSnap.id,
          participants: data.participants,
          lastMessage: data.lastMessage,
          otherParticipant
        } as Conversation;
      });

      const resolvedConvos = await Promise.all(convosPromises);
      setConversations(resolvedConvos);
      setIsLoadingConvos(false);
    });

    return () => unsubscribe();
  }, [firestore, currentUser]);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !firestore || !activeConversationId) return;

    const convoDocRef = doc(firestore, 'conversations', activeConversationId);
    
    // Add new message to the subcollection
    await addDoc(collection(convoDocRef, 'messages'), {
      senderId: currentUser.uid,
      text: newMessage,
      timestamp: serverTimestamp(),
    });
    
    // Update the lastMessage on the conversation document
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
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted"
              onClick={() => setActiveConversationId(convo.id)}
            >
              <Avatar>
                <AvatarImage src={convo.otherParticipant?.photoURL} />
                <AvatarFallback>{convo.otherParticipant?.displayName[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold truncate">{convo.otherParticipant?.displayName || 'Unknown User'}</p>
                <p className="text-sm text-muted-foreground truncate">{convo.lastMessage?.text}</p>
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
        {selectedConversation ? (
            <>
            <SheetHeader className="p-4 border-b flex-row items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setActiveConversationId(null)}>
                    <ArrowLeft />
                </Button>
                <Avatar>
                <AvatarImage src={selectedConversation.otherParticipant?.photoURL} />
                <AvatarFallback>{selectedConversation.otherParticipant?.displayName[0] || 'U'}</AvatarFallback>
                </Avatar>
                <SheetTitle className="truncate">{selectedConversation.otherParticipant?.displayName || 'Chat'}</SheetTitle>
            </SheetHeader>
            <ScrollArea className="flex-1 bg-secondary/50 p-4">
                {isLoadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map(msg => (
                            <MessageBubble key={msg.id} message={msg} isCurrentUser={msg.senderId === currentUser.uid} />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </ScrollArea>
            <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    autoComplete="off"
                />
                <Button type="submit" size="icon">
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

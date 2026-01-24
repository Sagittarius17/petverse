

'use client';

import { useEffect, useState, useRef } from 'react';
import { useChatStore } from '@/lib/chat-store';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp, collection, query, where, onSnapshot } from 'firebase/firestore';
import ChatLauncher from './chat-launcher';
import ChatPanel from './chat-panel';

export default function Chat() {
  const { isOpen, closeChat } = useChatStore();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
  const [totalUnreadChats, setTotalUnreadChats] = useState(0);
  const lastUnreadCount = useRef(0);


  // Effect for online presence
  useEffect(() => {
    if (!user || !firestore) return;

    const userStatusRef = doc(firestore, 'users', user.uid);

    if (isOpen) {
      updateDoc(userStatusRef, { isOnline: true });
    } else {
      updateDoc(userStatusRef, {
        isOnline: false,
        lastSeen: serverTimestamp(),
      });
    }

    const handleBeforeUnload = () => {
        updateDoc(userStatusRef, {
            isOnline: false,
            lastSeen: serverTimestamp(),
        });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateDoc(userStatusRef, {
        isOnline: false,
        lastSeen: serverTimestamp(),
      });
    };
  }, [user, firestore, isOpen]);

  // Effect for calculating total unread count
  useEffect(() => {
    if (!firestore || !user) return;

    const q = query(collection(firestore, "conversations"), where("participants", "array-contains", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let messageTotal = 0;
      let chatTotal = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        const unreadForUser = data.unreadCount?.[user.uid] || 0;
        if (unreadForUser > 0) {
            messageTotal += unreadForUser;
            chatTotal += 1;
        }
      });
      
      if (!useChatStore.getState().isOpen && messageTotal > lastUnreadCount.current) {
        const audio = new Audio('/sounds/incoming_msg.mp3');
        audio.play().catch(e => console.error("Error playing incoming message sound:", e));
      }

      setTotalUnreadMessages(messageTotal);
      setTotalUnreadChats(chatTotal);
      lastUnreadCount.current = messageTotal;
    });

    return () => unsubscribe();
  }, [firestore, user]);


  if (isUserLoading || !user) {
    return null;
  }

  return (
    <>
      <ChatLauncher unreadMessages={totalUnreadMessages} unreadChats={totalUnreadChats} />
      <ChatPanel
        isOpen={isOpen}
        onClose={closeChat}
        currentUser={user}
      />
    </>
  );
}

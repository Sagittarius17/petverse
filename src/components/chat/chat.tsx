'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/lib/chat-store';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp, collection, query, where, onSnapshot } from 'firebase/firestore';
import ChatLauncher from './chat-launcher';
import ChatPanel from './chat-panel';

export default function Chat() {
  const { isOpen, closeChat } = useChatStore();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

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
      let total = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        const unreadForUser = data.unreadCount?.[user.uid] || 0;
        total += unreadForUser;
      });
      setTotalUnreadCount(total);
    });

    return () => unsubscribe();
  }, [firestore, user]);


  if (isUserLoading || !user) {
    return null;
  }

  return (
    <>
      <ChatLauncher unreadCount={totalUnreadCount} />
      <ChatPanel
        isOpen={isOpen}
        onClose={closeChat}
        currentUser={user}
      />
    </>
  );
}

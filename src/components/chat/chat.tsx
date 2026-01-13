'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/lib/chat-store';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import ChatLauncher from './chat-launcher';
import ChatPanel from './chat-panel';

export default function Chat() {
  const { isOpen, closeChat } = useChatStore();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!user || !firestore) return;

    const userStatusRef = doc(firestore, 'users', user.uid);

    if (isOpen) {
      updateDoc(userStatusRef, { isOnline: true });
    } else {
      // When chat is not open, ensure user is marked offline.
      // This will trigger when the component mounts with chat closed,
      // or when the isOpen state changes to false.
      updateDoc(userStatusRef, {
        isOnline: false,
        lastSeen: serverTimestamp(),
      });
    }

    // This handles the case where the user closes the browser tab/window
    const handleBeforeUnload = () => {
        updateDoc(userStatusRef, {
            isOnline: false,
            lastSeen: serverTimestamp(),
        });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      // This cleanup function runs when the component unmounts
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateDoc(userStatusRef, {
        isOnline: false,
        lastSeen: serverTimestamp(),
      });
    };
  }, [user, firestore, isOpen]); // Add isOpen to the dependency array

  // Don't render the chat components if the user is not logged in or still loading
  if (isUserLoading || !user) {
    return null;
  }

  return (
    <>
      <ChatLauncher />
      <ChatPanel
        isOpen={isOpen}
        onClose={closeChat}
        currentUser={user}
      />
    </>
  );
}

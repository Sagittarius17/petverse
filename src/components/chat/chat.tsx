
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

    // This effect runs when the component mounts and before it unmounts.
    // Set user online when they are on the site (and this component is mounted)
    updateDoc(userStatusRef, { isOnline: true });

    // Use onbeforeunload to catch browser tab closures
    const handleBeforeUnload = () => {
        // This is a synchronous operation
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
  }, [user, firestore]);

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

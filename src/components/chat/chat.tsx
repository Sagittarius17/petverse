
'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/lib/chat-store';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import ChatLauncher from './chat-launcher';
import ChatPanel from './chat-panel';

export default function Chat() {
  const { isOpen, closeChat, activeConversationId } = useChatStore();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!user || !firestore) return;

    const userStatusRef = doc(firestore, 'users', user.uid);

    if (isOpen) {
      updateDoc(userStatusRef, { isOnline: true });
    } else {
      // User has closed the chat panel, update their status to offline.
      updateDoc(userStatusRef, {
        isOnline: false,
        lastSeen: serverTimestamp(),
      });
    }

    // This effect should re-run whenever the user's panel state changes.
  }, [isOpen, user, firestore]);

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

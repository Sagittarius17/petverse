'use client';

import { useChatStore } from '@/lib/chat-store';
import { useUser } from '@/firebase';
import ChatLauncher from './chat-launcher';
import ChatPanel from './chat-panel';

export default function Chat() {
  const { isOpen, closeChat, activeConversationId } = useChatStore();
  const { user, isUserLoading } = useUser();

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
        activeConversationId={activeConversationId}
        currentUser={user}
      />
    </>
  );
}

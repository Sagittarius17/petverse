
'use client';

import { useChatStore } from '@/lib/chat-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import ChatPanel from './chat-panel';
import { useUser } from '@/firebase';

const BILLU_CONVERSATION_ID = 'ai-chatbot-billu';

export default function BilluChatLauncher() {
  const { isOpen, toggleChat, setActiveConversationId, closeChat } = useChatStore();
  const billuAvatar = PlaceHolderImages.find(p => p.id === 'billu-avatar') || { imageUrl: '', imageHint: 'cat' };
  const { user } = useUser();

  const handleBilluLaunch = () => {
    setActiveConversationId(BILLU_CONVERSATION_ID);
    toggleChat();
  };

  // The chat panel needs a user to function, even for the AI bot
  if (!user) return null;

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="ghost"
          className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90 shadow-lg p-0"
          onClick={handleBilluLaunch}
        >
          <Avatar className="w-full h-full">
            <AvatarImage src={billuAvatar.imageUrl} />
            <AvatarFallback>B</AvatarFallback>
          </Avatar>
        </Button>
      </div>
      <ChatPanel
        isOpen={isOpen}
        onClose={closeChat}
        currentUser={user}
      />
    </>
  );
}

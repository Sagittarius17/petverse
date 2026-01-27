'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider, useUser } from '@/firebase';
import { ThemeProvider } from '@/components/theme-provider';
import MainLayout from '@/components/main-layout';
import Chat from '@/components/chat/chat';
import BilluChatLauncher from '@/components/chat/billu-chat-launcher';
import ConditionalFirestoreObserver from '@/components/dev/ConditionalFirestoreObserver';
import NotificationManager from '@/components/NotificationManager';


function ChatController() {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const isShopPage = pathname.startsWith('/shop');

  if (isUserLoading) {
    return null; // Don't render anything until we know the auth state
  }

  // On any shop page, always show Billu
  if (isShopPage) {
    return <BilluChatLauncher />;
  }

  // If there is a signed-in, non-anonymous user, show the regular user-to-user chat.
  if (user && !user.isAnonymous) {
    return <Chat />;
  }
  
  // For all other cases (guests or anonymous users), show the Billu AI Chatbot.
  return <BilluChatLauncher />;
}

export default function MainProvider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            themes={['light', 'dark', 'system', 'dark-forest', 'light-rose']}
        >
            <FirebaseClientProvider>
                <MainLayout>
                    {children}
                </MainLayout>
                <ChatController />
                <Toaster />
                <NotificationManager />
                {process.env.NODE_ENV === 'development' && <ConditionalFirestoreObserver />}
            </FirebaseClientProvider>
        </ThemeProvider>
    )
}


'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { FirebaseClientProvider, useUser } from '@/firebase';
import { ThemeProvider } from '@/components/theme-provider';
import MainLayout from '@/components/main-layout';
import Chat from '@/components/chat/chat';
import BilluChatLauncher from '@/components/chat/billu-chat-launcher';

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


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
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
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

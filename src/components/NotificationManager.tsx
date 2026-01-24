'use client';

import { useEffect, useState } from 'react';
import { useMessaging, useUser, useFirestore } from '@/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { BellRing, BellOff } from 'lucide-react';

export default function NotificationManager() {
  const messaging = useMessaging();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission | 'loading'>('loading');

  useEffect(() => {
    // This effect ensures we only check Notification.permission on the client
    setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground message received.', payload);
        toast({
          title: payload.notification?.title,
          description: payload.notification?.body,
        });
      });
      return () => unsubscribe();
    }
  }, [messaging, toast]);

  const requestPermissionAndToken = async () => {
    if (!messaging || !user || !firestore) {
      if (!user) {
        toast({
          variant: 'destructive',
          title: 'Login Required',
          description: 'Please log in to enable notifications.',
        });
      }
      return;
    }
    
    try {
      const currentPermission = await Notification.requestPermission();
      setPermission(currentPermission);

      if (currentPermission === 'granted') {
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
        if (!vapidKey) {
            console.error("VAPID key not found. Push notifications will not work.");
            toast({ variant: 'destructive', title: 'Configuration Error', description: 'VAPID key is missing.' });
            return;
        }

        const currentToken = await getToken(messaging, { vapidKey });
        if (currentToken) {
          console.log('FCM Token:', currentToken);
          const userDocRef = doc(firestore, 'users', user.uid);
          await updateDoc(userDocRef, {
            fcmTokens: arrayUnion(currentToken)
          });
          toast({
            title: 'Notifications Enabled',
            description: 'You will now receive updates!',
          });
        } else {
          console.log('No registration token available. Request permission to generate one.');
          toast({ variant: 'destructive', title: 'Could not get token', description: 'Please try enabling notifications again.' });
        }
      } else {
        console.log('Unable to get permission to notify.');
        toast({
          title: 'Notifications Blocked',
          description: 'You can enable them in your browser settings if you change your mind.',
        });
      }
    } catch (error) {
      console.error('An error occurred while getting token. ', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not enable notifications.' });
    }
  };

  if (!user || permission === 'granted' || permission === 'loading') {
    return null;
  }

  if (permission === 'denied') {
      return (
          <div className="fixed bottom-4 left-4 z-50">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary text-secondary-foreground shadow-lg">
                <BellOff className="h-4 w-4" />
                <p className="text-sm">Notifications are blocked.</p>
              </div>
          </div>
      )
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button onClick={requestPermissionAndToken} variant="outline" className="bg-background shadow-lg">
        <BellRing className="mr-2 h-4 w-4" />
        Enable Notifications
      </Button>
    </div>
  );
}

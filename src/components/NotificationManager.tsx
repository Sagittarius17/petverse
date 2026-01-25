'use client';

import { useEffect, useState } from 'react';
import * as React from 'react';
import { useMessaging, useUser, useFirestore } from '@/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { BellRing, BellOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotificationManager() {
  const messaging = useMessaging();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission | 'loading'>('loading');
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // A more robust way to check for notification permission and listen for changes.
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'notifications' }).then((permissionStatus) => {
        setPermission(permissionStatus.state);
        permissionStatus.onchange = () => {
          setPermission(permissionStatus.state);
        };
      });
    } else {
      // Fallback for older browsers.
      setPermission(Notification.permission);
    }
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
      // The state will be updated automatically by the 'onchange' listener,
      // but we can set it here for immediate feedback.
      setPermission(currentPermission);

      if (currentPermission === 'granted') {
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
        if (!vapidKey || vapidKey === 'YOUR_VAPID_KEY_HERE') {
            console.error("VAPID key not found or is a placeholder. Push notifications will not work.");
            toast({
                variant: 'destructive',
                title: 'Configuration Error: VAPID Key Missing',
                description: (
                    <div className="text-sm">
                        <p>To enable push notifications, you need to add your Web Push Certificate key (VAPID key) from Firebase.</p>
                        <ol className="list-decimal list-inside mt-2 space-y-1">
                            <li>Go to your Firebase project settings.</li>
                            <li>Go to the "Cloud Messaging" tab.</li>
                            <li>Under "Web configuration", generate a key pair.</li>
                            <li>Copy the public key.</li>
                            <li>Create a <code className="font-mono bg-muted p-1 rounded">.env.local</code> file in your project root.</li>
                            <li>Add the key: <code className="font-mono bg-muted p-1 rounded">NEXT_PUBLIC_VAPID_KEY=YOUR_KEY_HERE</code></li>
                            <li>Restart your development server.</li>
                        </ol>
                    </div>
                ),
                duration: 20000,
            });
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
          description: 'To enable notifications, please go to your browser settings for this site and change the permission to "Allow".',
          duration: 9000,
        });
      }
    } catch (error) {
      console.error('An error occurred while getting token. ', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not enable notifications.' });
    }
  };

  if (isDismissed) {
    return null;
  }

  // Only show the button if a user is logged in, permission isn't granted, and the state isn't loading.
  if (!user || permission === 'granted' || permission === 'loading') {
    return null;
  }

  // If permission is denied, show the "Blocked" button.
  if (permission === 'denied') {
      return (
          <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2">
               <Button onClick={requestPermissionAndToken} variant="destructive-outline" className="shadow-lg">
                <BellOff className="mr-2 h-4 w-4" />
                Notifications Blocked
              </Button>
               <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background shadow-lg" onClick={() => setIsDismissed(true)}>
                <X className="h-4 w-4" />
              </Button>
          </div>
      )
  }

  // If permission is 'default' (not yet chosen), show the "Enable" button.
  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2">
      <Button onClick={requestPermissionAndToken} variant="outline" className="bg-background shadow-lg">
        <BellRing className="mr-2 h-4 w-4" />
        Enable Notifications
      </Button>
       <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background shadow-lg" onClick={() => setIsDismissed(true)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

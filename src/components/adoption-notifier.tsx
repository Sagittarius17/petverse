'use client';

import { useEffect, useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { subDays } from 'date-fns';

interface AdoptionNotification {
    id: string;
    title: string;
    description: string;
    timestamp: Timestamp;
    type: 'adoption';
}

const LAST_CHECKED_KEY = 'lastNotificationCheck';

export default function AdoptionNotifier() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    // Get the last checked timestamp from local storage on mount
    useEffect(() => {
        const storedLastChecked = localStorage.getItem(LAST_CHECKED_KEY);
        if (storedLastChecked) {
            setLastChecked(new Date(storedLastChecked));
        } else {
            // If it's the user's first visit, only show notifications from the last 2 days
            setLastChecked(subDays(new Date(), 2));
        }
    }, []);
    
    // Create a query that listens for new notifications since the component mounted
    const notificationsQuery = useMemoFirebase(() => {
        if (!firestore || !lastChecked) return null;
        return query(
            collection(firestore, 'notifications'),
            where('timestamp', '>=', lastChecked),
            orderBy('timestamp', 'desc')
        );
    }, [firestore, lastChecked]);

    const { data: notifications } = useCollection<AdoptionNotification>(notificationsQuery);

    useEffect(() => {
        if (notifications && notifications.length > 0) {
            // To prevent showing a storm of old notifications on first load,
            // we process them but only show a toast for very recent ones.
            // A more advanced implementation might show a notification count badge.

            const now = new Date();
            
            notifications.forEach((notification, index) => {
                // To avoid a "toast storm" on first load after being away,
                // we only show toasts for notifications that are very new.
                // We'll still update the `lastChecked` time to avoid showing them again.
                const notificationDate = notification.timestamp.toDate();
                const isVeryRecent = (now.getTime() - notificationDate.getTime()) < 60000; // less than 1 minute old

                // Stagger the toasts slightly to make them readable
                if(isVeryRecent) {
                    setTimeout(() => {
                        toast({
                            title: notification.title,
                            description: notification.description,
                            duration: 10000, // Keep it on screen for 10 seconds
                        });
                    }, index * 1500);
                }
            });

            // After processing, update the 'last checked' timestamp in local storage to now.
            // This ensures these notifications aren't processed again on the next page load.
            const newLastChecked = new Date().toISOString();
            localStorage.setItem(LAST_CHECKED_KEY, newLastChecked);
        }
    }, [notifications, toast]);


    // This component does not render anything itself
    return null;
}

    
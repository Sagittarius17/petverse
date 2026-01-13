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
    const [isInitialLoad, setIsInitialLoad] = useState(true);

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
            // On the very first load of notifications for a session, we don't want to show a toast storm.
            // We'll just update the timestamp.
            if (isInitialLoad) {
                setIsInitialLoad(false);
            } else {
                // For any subsequent notifications that arrive in real-time, show a toast.
                // We only process the newest one in the array to avoid storms if multiple arrive at once.
                const newestNotification = notifications[0];
                 setTimeout(() => {
                    toast({
                        title: newestNotification.title,
                        description: newestNotification.description,
                        duration: 10000,
                    });
                }, 500); // Small delay to ensure it feels natural
            }

            // After processing, update the 'last checked' timestamp in local storage to now.
            // This ensures these notifications aren't processed again on the next page load.
            const newLastChecked = new Date().toISOString();
            localStorage.setItem(LAST_CHECKED_KEY, newLastChecked);
            // Also update the state to ensure the query is updated for the next fetch.
            setLastChecked(new Date(newLastChecked));
        }
    }, [notifications, toast, isInitialLoad]);


    // This component does not render anything itself
    return null;
}

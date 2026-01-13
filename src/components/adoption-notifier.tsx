'use client';

import { useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { subMinutes, formatDistanceToNow } from 'date-fns';

interface AdoptionNotification {
    id: string;
    title: string;
    description: string;
    timestamp: Timestamp;
    type: 'adoption';
}

const LAST_CHECKED_KEY = 'lastAdoptionNotificationCheck';

export default function AdoptionNotifier() {
    const firestore = useFirestore();
    const { toast } = useToast();
    
    // Get the last checked timestamp from local storage on mount
    const lastChecked = useMemoFirebase(() => {
        if (typeof window === 'undefined') {
            return subMinutes(new Date(), 1); // Default for SSR or first load
        }
        const storedLastChecked = localStorage.getItem(LAST_CHECKED_KEY);
        if (storedLastChecked) {
            return new Date(storedLastChecked);
        } else {
            // If it's the user's first visit, only show notifications from the last minute to avoid a storm.
            return subMinutes(new Date(), 1);
        }
    }, []);
    
    // Create a query that listens for new notifications since the last check
    const notificationsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'notifications'),
            where('timestamp', '>=', lastChecked),
            orderBy('timestamp', 'desc')
        );
    }, [firestore, lastChecked]);

    const { data: notifications } = useCollection<AdoptionNotification>(notificationsQuery);

    useEffect(() => {
        if (notifications && notifications.length > 0) {
            notifications.forEach(notification => {
                 setTimeout(() => {
                    const timeAgo = notification.timestamp ? formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true }) : 'just now';
                    toast({
                        title: notification.title,
                        description: (
                            <div>
                                <p>{notification.description}</p>
                                <p className="text-xs text-muted-foreground mt-2">{timeAgo}</p>
                            </div>
                        ),
                        duration: 10000,
                    });
                }, 500); // Small delay to ensure it feels natural
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

'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useDevStore } from '@/lib/dev-store';
import FirestoreObserver from './FirestoreObserver';
import { doc } from 'firebase/firestore';

interface UserProfile {
  role?: 'Admin' | 'Superuser' | 'User' | 'Superadmin';
}

export default function ConditionalFirestoreObserver() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { isObserverEnabled } = useDevStore();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const isAuthorized = !isProfileLoading && userProfile && (userProfile.role === 'Admin' || userProfile.role === 'Superadmin');
  
  if (process.env.NODE_ENV !== 'development' || !isObserverEnabled || isUserLoading || !isAuthorized) {
    return null;
  }

  return <FirestoreObserver />;
}

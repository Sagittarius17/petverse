import { Firestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

type ActivityType = 'User' | 'Blog' | 'Pet';
type BadgeVariant = 'default' | 'secondary' | 'destructive';
type IconName = 'ShieldCheck' | 'ShieldOff' | 'Edit' | 'Trash2' | 'PlusCircle';

interface ActivityDetails {
  action: string;
  target: string;
  targetType: ActivityType;
  details: string;
  badgeVariant: BadgeVariant;
  iconName: IconName;
}

export function logActivity(
  firestore: Firestore,
  user: User,
  activityDetails: ActivityDetails
) {
  if (!user) {
    console.error("Cannot log activity, user is not authenticated.");
    return;
  }
  
  const activitiesCollection = collection(firestore, 'activities');
  
  addDoc(activitiesCollection, {
    ...activityDetails,
    userId: user.uid,
    userName: user.displayName || user.email,
    userAvatar: user.photoURL || '',
    timestamp: serverTimestamp(),
  }).catch(error => {
    console.error("Error logging activity:", error);
    // In a real app, you might want to handle this more gracefully
  });
}

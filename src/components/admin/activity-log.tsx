'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, Timestamp, doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  User,
  Dog,
  ShieldCheck,
  ShieldOff,
  Edit,
  Trash2,
  PlusCircle,
  ListCollapse,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { UserProfile } from '@/lib/data';

type ActivityType = 'User' | 'Blog' | 'Pet';
type BadgeVariant = 'default' | 'secondary' | 'destructive';
type IconName = 'ShieldCheck' | 'ShieldOff' | 'Edit' | 'Trash2' | 'PlusCircle';

interface Activity {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  target: string;
  targetType: ActivityType;
  details: string;
  timestamp: Timestamp;
  badgeVariant: BadgeVariant;
  iconName: IconName;
}

const typeIcons = {
  User: <User className="h-4 w-4" />,
  Blog: <FileText className="h-4 w-4" />,
  Pet: <Dog className="h-4 w-4" />,
};

function formatRelativeTime(timestamp?: Timestamp): string {
    if (!timestamp) return 'Just now';
    return `${formatDistanceToNow(timestamp.toDate())} ago`;
}

function ActivityItem({ activity }: { activity: Activity }) {
  const firestore = useFirestore();
  const userDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'users', activity.userId) : null),
    [firestore, activity.userId]
  );
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const iconMap: Record<string, React.ElementType> = useMemo(() => ({
    ShieldCheck: ShieldCheck,
    ShieldOff: ShieldOff,
    Edit: Edit,
    Trash2: Trash2,
    PlusCircle: PlusCircle,
  }), []);

  const ActionIcon = iconMap[activity.iconName] || Edit;
  
  const nameToDisplay = userProfile?.username || activity.userName;
  const avatarUrl = userProfile?.profilePicture || activity.userAvatar;

  return (
    <div className="grid items-start grid-cols-[auto_1fr_auto] gap-x-4">
        <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{nameToDisplay?.charAt(0) || 'A'}</AvatarFallback>
        </Avatar>
        <div className="text-sm">
            <div>
                <span className="font-semibold">{nameToDisplay}</span>
                <span className="text-muted-foreground"> performed action </span>
                <Badge variant={activity.badgeVariant || 'secondary'} className="mx-1">
                    <ActionIcon className="h-3 w-3 mr-1" />
                    {activity.action}
                </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                {typeIcons[activity.targetType as keyof typeof typeIcons]}
                <span className="font-medium truncate">{activity.target}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{activity.details}</p>
        </div>
        <div className="text-xs text-muted-foreground self-start">
            {formatRelativeTime(activity.timestamp)}
        </div>
    </div>
  );
}


export default function ActivityLog() {
  const firestore = useFirestore();

  const activitiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'activities'), orderBy('timestamp', 'desc'));
  }, [firestore]);

  const { data: activities, isLoading } = useCollection<Activity>(activitiesQuery);

  if (isLoading) {
    return (
      <div className="space-y-8 pr-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid items-start grid-cols-[auto_1fr_auto] gap-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
            <ListCollapse className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-semibold">No Activity Yet</h3>
            <p className="text-sm">Administrative actions will be logged here.</p>
        </div>
    );
  }


  return (
    <div className="space-y-8 pr-4">
      {activities.map(activity => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}

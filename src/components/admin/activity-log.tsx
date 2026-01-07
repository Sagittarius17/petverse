'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  User,
  Dog,
  ShieldCheck,
  ShieldOff,
  Edit,
  Trash2,
  PlusCircle,
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const activities = [
  {
    id: 'act_1',
    user: {
      name: 'Admin',
      avatar: PlaceHolderImages.find(p => p.id === 'user-avatar-1')?.imageUrl,
    },
    action: 'Disabled User',
    target: 'jane.doe@example.com',
    targetType: 'User',
    date: '2 mins ago',
    details: 'User status set to Inactive.',
    icon: ShieldOff,
    badgeVariant: 'destructive',
  },
  {
    id: 'act_2',
    user: {
      name: 'Superuser',
      avatar: 'https://github.com/shadcn.png',
    },
    action: 'Edited Blog Post',
    target: 'Beginner\'s Guide to Dog Care',
    targetType: 'Blog',
    date: '1 hour ago',
    details: 'Updated content and fixed typos.',
    icon: Edit,
    badgeVariant: 'secondary',
  },
  {
    id: 'act_3',
    user: {
      name: 'Admin',
      avatar: PlaceHolderImages.find(p => p.id === 'user-avatar-1')?.imageUrl,
    },
    action: 'Changed Role',
    target: 'john.smith@example.com',
    targetType: 'User',
    date: '3 hours ago',
    details: 'Promoted user to Superuser.',
    icon: ShieldCheck,
    badgeVariant: 'default',
  },
  {
    id: 'act_4',
    user: {
      name: 'Superuser',
      avatar: 'https://github.com/shadcn.png',
    },
    action: 'Added New Pet',
    target: 'Milo (Corgi)',
    targetType: 'Pet',
    date: '1 day ago',
    details: 'Added a new Corgi available for adoption.',
    icon: PlusCircle,
    badgeVariant: 'default',
  },
  {
    id: 'act_5',
    user: {
      name: 'Admin',
      avatar: PlaceHolderImages.find(p => p.id === 'user-avatar-1')?.imageUrl,
    },
    action: 'Deleted Blog Post',
    target: 'Outdated Cat Food Guide',
    targetType: 'Blog',
    date: '2 days ago',
    details: 'Removed post due to outdated information.',
    icon: Trash2,
    badgeVariant: 'destructive',
  },
];

const typeIcons = {
  User: <User className="h-4 w-4" />,
  Blog: <FileText className="h-4 w-4" />,
  Pet: <Dog className="h-4 w-4" />,
};

export default function ActivityLog() {
  return (
    <div className="space-y-8">
      {activities.map(activity => (
        <div key={activity.id} className="grid items-start grid-cols-[auto_1fr_auto] gap-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={activity.user.avatar} />
            <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p>
              <span className="font-semibold">{activity.user.name}</span>
              <span className="text-muted-foreground"> performed action </span>
              <Badge variant={activity.badgeVariant || 'secondary'} className="mx-1">
                <activity.icon className="h-3 w-3 mr-1" />
                {activity.action}
              </Badge>
            </p>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                {typeIcons[activity.targetType as keyof typeof typeIcons]}
                <span className="font-medium truncate">{activity.target}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{activity.details}</p>
          </div>
          <div className="text-xs text-muted-foreground self-start">
            {activity.date}
          </div>
        </div>
      ))}
    </div>
  );
}

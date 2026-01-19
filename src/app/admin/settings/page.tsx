
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon, Trees, Flower, Monitor } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { maintenanceStore } from '@/lib/maintenance-store';

export default function AdminSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const [isMaintenanceMode, setIsMaintenanceMode] = useState(maintenanceStore.getState().isMaintenanceMode);
  const [estimatedTime, setEstimatedTime] = useState(maintenanceStore.getState().estimatedTime);

  useEffect(() => {
    const unsubscribe = maintenanceStore.subscribe(
      (state) => {
        setIsMaintenanceMode(state.isMaintenanceMode);
        setEstimatedTime(state.estimatedTime);
      }
    );
    return unsubscribe;
  }, []);

  const handleProfileSave = () => {
    toast({
      title: 'Settings Saved!',
      description: 'Your profile has been updated.',
    });
  };

  const handleSiteSettingsSave = () => {
    maintenanceStore.setState({ isMaintenanceMode, estimatedTime });
    toast({
      title: 'Settings Saved!',
      description: 'Site settings have been saved.',
    });
  };

  const handleNotificationsSave = () => {
    toast({
      title: 'Settings Saved!',
      description: 'Notification settings have been updated.',
    });
  };

  if (isUserLoading || !user) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div><div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div></CardContent><CardFooter><Skeleton className="h-10 w-24" /></CardFooter></Card>
        <Card><CardHeader><Skeleton className="h-5 w-28" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent><CardFooter><Skeleton className="h-10 w-24" /></CardFooter></Card>
        <Card><CardHeader><Skeleton className="h-5 w-32" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></CardContent><CardFooter><Skeleton className="h-10 w-24" /></CardFooter></Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="flex flex-col lg:col-span-1">
        <CardHeader>
          <CardTitle>Admin Profile</CardTitle>
          <CardDescription>Manage your personal admin information.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="full-name">Full Name</Label>
            <Input id="full-name" defaultValue={user.displayName || 'Admin'} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input id="admin-email" type="email" defaultValue={user.email || 'admin@petverse.com'} readOnly />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleProfileSave}>Save Profile</Button>
        </CardFooter>
      </Card>

      <Card className="flex flex-col lg:col-span-2">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <RadioGroup
            value={theme}
            onValueChange={setTheme}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
          >
            {[
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'dark-forest', label: 'Forest', icon: Trees },
              { value: 'light-rose', label: 'Rose', icon: Flower },
              { value: 'system', label: 'System', icon: Monitor },
            ].map(({ value, label, icon: Icon }) => (
              <div key={value}>
                <RadioGroupItem value={value} id={value} className="peer sr-only" />
                <Label
                  htmlFor={value}
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-24"
                >
                  <Icon className="mb-2 h-6 w-6" />
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="flex flex-col lg:col-span-2">
        <CardHeader>
          <CardTitle>Site Settings</CardTitle>
          <CardDescription>Manage general settings for the application.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow grid gap-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="maintenance-mode"
              checked={isMaintenanceMode}
              onCheckedChange={setIsMaintenanceMode}
              showOnOff
            />
            <Label htmlFor="maintenance-mode" className="text-sm">
              Enable Maintenance Mode
            </Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="estimated-time">Estimated Downtime Message</Label>
            <Input 
              id="estimated-time" 
              placeholder="e.g., 'about 30 minutes'"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              disabled={!isMaintenanceMode}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSiteSettingsSave}>Save Settings</Button>
        </CardFooter>
      </Card>

      <Card className="flex flex-col lg:col-span-1">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure when and how you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow grid gap-6">
          <div className="flex items-center space-x-2">
            <Switch id="new-user-noti" defaultChecked showOnOff />
            <Label htmlFor="new-user-noti" className="text-sm">
              Email on new user registration
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="adoption-noti" defaultChecked showOnOff />
            <Label htmlFor="adoption-noti" className="text-sm">
              Email on successful adoption
            </Label>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleNotificationsSave}>Save Notifications</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

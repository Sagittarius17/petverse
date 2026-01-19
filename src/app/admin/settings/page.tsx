
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
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
import { Sun, Moon, Trees, Flower, Monitor, Loader2, Timer } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { differenceInSeconds, formatDuration, intervalToDuration } from 'date-fns';
import { updateProfile } from 'firebase/auth';

interface MaintenanceSettings {
  isMaintenanceMode?: boolean;
  bannerMessage?: string;
  maintenanceStartTime?: string | null;
  maintenanceEndTime?: string | null;
}

interface UserProfile {
    username?: string;
    displayName?: string;
}


function AdminCountdown({ settings }: { settings: MaintenanceSettings | null }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [status, setStatus] = useState<'inactive' | 'pending' | 'active'>('inactive');

  useEffect(() => {
    const interval = setInterval(() => {
      if (!settings) {
        setStatus('inactive');
        setTimeLeft('');
        return;
      }
      
      const { isMaintenanceMode, maintenanceStartTime, maintenanceEndTime } = settings;
      const now = new Date();

      if (isMaintenanceMode) {
        setStatus('active');
        if (maintenanceEndTime) {
          const end = new Date(maintenanceEndTime);
          const secondsLeft = differenceInSeconds(end, now);
          if (secondsLeft <= 0) {
            setTimeLeft('Ending now...');
          } else {
            setTimeLeft(`Active for ${formatDuration(intervalToDuration({ start: 0, end: secondsLeft * 1000 }), { format: ['hours', 'minutes', 'seconds'], zero: false, delimiter: ', ' })}`);
          }
        } else {
          setTimeLeft('Active indefinitely');
        }
      } else if (maintenanceStartTime) {
        const start = new Date(maintenanceStartTime);
        if (now < start) {
          setStatus('pending');
          const secondsLeft = differenceInSeconds(start, now);
          if (secondsLeft <= 0) {
            setTimeLeft('Starting now...');
          } else {
            setTimeLeft(`Starts in ${formatDuration(intervalToDuration({ start: 0, end: secondsLeft * 1000 }), { format: ['hours', 'minutes', 'seconds'], zero: false, delimiter: ', ' })}`);
          }
        } else {
            setStatus('inactive');
            setTimeLeft('');
        }
      } else {
        setStatus('inactive');
        setTimeLeft('');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [settings]);

  if (status === 'inactive' || !timeLeft) {
    return null;
  }

  return (
    <div className={`text-sm font-medium flex items-center gap-2 ${status === 'active' ? 'text-destructive' : 'text-primary'}`}>
       <Timer className="h-4 w-4" />
       <span>{timeLeft}</span>
    </div>
  );
}


export default function AdminSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const firestore = useFirestore();

  const settingsDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'maintenance');
  }, [firestore]);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);
  const { data: maintenanceSettings, isLoading: isSettingsLoading } = useDoc<MaintenanceSettings>(settingsDocRef);
  
  const [isMaintenanceOn, setIsMaintenanceOn] = useState(false);
  const [message, setMessage] = useState('');
  const [scheduleHours, setScheduleHours] = useState(0);
  const [scheduleMinutes, setScheduleMinutes] = useState(0);
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (maintenanceSettings) {
        const now = new Date();
        const startTime = maintenanceSettings.maintenanceStartTime ? new Date(maintenanceSettings.maintenanceStartTime) : null;
        const isActiveOrPending = maintenanceSettings.isMaintenanceMode || (startTime ? startTime > now : false);
        
        setIsMaintenanceOn(isActiveOrPending);
        setMessage(maintenanceSettings.bannerMessage || 'We are performing scheduled maintenance.');
    } else {
        setIsMaintenanceOn(false);
        setMessage('We are performing scheduled maintenance.');
    }
    if (userProfile) {
        setDisplayName(userProfile.displayName || user?.displayName || '');
        setUsername(userProfile.username || '');
    }
  }, [maintenanceSettings, userProfile, user]);
  
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !auth.currentUser) return;

    setIsSubmitting(true);
    try {
        // Update Auth profile
        if (auth.currentUser.displayName !== displayName) {
            await updateProfile(auth.currentUser, { displayName });
        }
        // Update Firestore user document
        updateDocumentNonBlocking(doc(firestore, 'users', user.uid), { displayName });
        toast({
            title: 'Profile Saved!',
            description: 'Your display name has been updated.',
        });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update profile.' });
        console.error(error);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleSiteSettingsSave = async () => {
    if (!firestore || !settingsDocRef) return;
    setIsSubmitting(true);

    try {
        if (!isMaintenanceOn) {
            await setDoc(settingsDocRef, {
                isMaintenanceMode: false,
                maintenanceStartTime: null,
                maintenanceEndTime: null,
                bannerMessage: message,
            }, { merge: true });
            toast({ title: 'Settings Saved', description: 'Maintenance mode is now disabled.' });
            return;
        }

        const now = new Date();
        const startOffsetMs = (scheduleHours * 60 * 60 + scheduleMinutes * 60) * 1000;
        const durationMs = (durationHours * 60 * 60 + durationMinutes * 60) * 1000;

        const calculatedStartTime = new Date(now.getTime() + startOffsetMs);
        let calculatedEndTime: string | null = null;
        if (durationMs > 0) {
            calculatedEndTime = new Date(calculatedStartTime.getTime() + durationMs).toISOString();
        }

        await setDoc(settingsDocRef, {
            isMaintenanceMode: startOffsetMs === 0,
            maintenanceStartTime: calculatedStartTime.toISOString(),
            maintenanceEndTime: calculatedEndTime,
            bannerMessage: message,
        }, { merge: true });

        toast({ title: 'Settings Saved!', description: 'Maintenance schedule has been updated.' });
    } catch (error) {
        console.error("Error saving settings:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not save settings.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleNotificationsSave = () => {
    toast({
      title: 'Settings Saved!',
      description: 'Notification settings have been updated.',
    });
  };
  
  const isLoading = isUserLoading || isSettingsLoading || isProfileLoading;

  if (isLoading || !user) {
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
        <form onSubmit={handleProfileSave}>
            <CardContent className="flex-grow grid gap-6">
            <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input id="display-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} readOnly disabled />
            </div>
            <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input id="admin-email" type="email" value={user.email || 'admin@petverse.com'} readOnly disabled />
            </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button type="submit" disabled={isSubmitting}>Save Profile</Button>
            </CardFooter>
        </form>
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
              checked={isMaintenanceOn}
              onCheckedChange={setIsMaintenanceOn}
              showOnOff
            />
            <Label htmlFor="maintenance-mode" className="text-sm">
              Enable Maintenance Mode
            </Label>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className="space-y-2">
                <Label>Start in</Label>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <Label htmlFor="schedule-hours" className="text-xs text-muted-foreground">Hours</Label>
                        <Input 
                            id="schedule-hours" 
                            type="number" min="0" placeholder="0"
                            value={scheduleHours || ''}
                            onChange={(e) => setScheduleHours(parseInt(e.target.value, 10) || 0)}
                            disabled={!isMaintenanceOn}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="schedule-minutes" className="text-xs text-muted-foreground">Minutes</Label>
                        <Input 
                            id="schedule-minutes" 
                            type="number" min="0" max="59" placeholder="0"
                            value={scheduleMinutes || ''}
                            onChange={(e) => setScheduleMinutes(parseInt(e.target.value, 10) || 0)}
                            disabled={!isMaintenanceOn}
                        />
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <Label>Duration</Label>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <Label htmlFor="duration-hours" className="text-xs text-muted-foreground">Hours</Label>
                        <Input 
                            id="duration-hours" 
                            type="number" min="0" placeholder="0"
                            value={durationHours || ''}
                            onChange={(e) => setDurationHours(parseInt(e.target.value, 10) || 0)}
                            disabled={!isMaintenanceOn}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="duration-minutes" className="text-xs text-muted-foreground">Minutes</Label>
                        <Input 
                            id="duration-minutes" 
                            type="number" min="0" max="59" placeholder="0"
                            value={durationMinutes || ''}
                            onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 0)}
                            disabled={!isMaintenanceOn}
                        />
                    </div>
                </div>
            </div>
          </div>
           <div className="space-y-2">
                <Label htmlFor="banner-message">Maintenance Message</Label>
                <Input 
                  id="banner-message" 
                  placeholder="e.g., Deploying new features..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={!isMaintenanceOn}
                />
            </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4 flex items-center justify-between">
          <Button onClick={handleSiteSettingsSave} disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             Save Settings
          </Button>
          <AdminCountdown settings={maintenanceSettings} />
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

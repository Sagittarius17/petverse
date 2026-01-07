'use client';

import { useState } from 'react';
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

export default function AdminSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, isUserLoading } = useUser();
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  if (isUserLoading || !user) {
    return (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <div className="grid gap-6">
                <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-5 w-32" /></CardHeader><CardContent><Skeleton className="h-8 w-full" /></CardContent></Card>
            </div>
            <div className="grid gap-6">
                <Card><CardHeader><Skeleton className="h-5 w-28" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
            </div>
        </div>
    )
  }


  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Admin Profile</CardTitle>
            <CardDescription>
              Manage your personal admin information.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input id="full-name" defaultValue={user.displayName || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input id="admin-email" type="email" defaultValue={user.email || ''} readOnly />
                </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button>Save Profile</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Site Settings</CardTitle>
            <CardDescription>
              Manage general settings for the application.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center space-x-2">
                <Switch 
                    id="maintenance-mode" 
                    checked={isMaintenanceMode}
                    onCheckedChange={setIsMaintenanceMode}
                />
                <Label htmlFor="maintenance-mode" className="text-sm">
                  Enable Maintenance Mode
                </Label>
              </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button>Save Settings</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure when and how you receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center space-x-2">
                <Switch id="new-user-noti" defaultChecked />
                <Label htmlFor="new-user-noti" className="text-sm">
                  Email on new user registration
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="adoption-noti" defaultChecked />
                <Label htmlFor="adoption-noti" className="text-sm">
                  Email on successful adoption
                </Label>
              </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button>Save Notifications</Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={theme}
              onValueChange={setTheme}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-3 gap-4"
            >
              {[
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
                { value: 'dark-forest', label: 'Forest', icon: Trees },
                { value: 'light-rose', label: 'Rose', icon: Flower },
                { value: 'system', label: 'System', icon: Monitor },
              ].map(({ value, label, icon: Icon }) => (
                <div key={value}>
                  <RadioGroupItem
                    value={value}
                    id={value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={value}
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Icon className="mb-2 h-6 w-6" />
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

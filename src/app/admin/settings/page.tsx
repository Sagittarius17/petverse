'use client';

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
import { Switch } from '@/components/ui/switch';

export default function AdminSettingsPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Site Settings</CardTitle>
          <CardDescription>
            Manage general settings for the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Site Name</Label>
                <Input id="site-name" defaultValue="PetVerse" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input id="admin-email" type="email" defaultValue="admin@petverse.com" />
              </div>
          </div>
          <div className="flex items-center space-x-2">
              <Switch id="maintenance-mode" />
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
  );
}

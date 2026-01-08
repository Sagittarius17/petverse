'use client';

import { MoreHorizontal, ShieldCheck, ShieldOff, Crown, User as UserIcon, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, useUser, useDoc } from '@/firebase';
import { collection, doc, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { logActivity } from '@/lib/activity-log';
import type { User } from 'firebase/auth';

type Role = 'Admin' | 'Superadmin' | 'Superuser' | 'User';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt?: Timestamp;
  role?: Role;
  status?: 'Active' | 'Inactive';
}

const roleVisuals: Record<Role, { icon: React.ElementType; color: string }> = {
  Superadmin: { icon: Crown, color: 'text-amber-500' },
  Admin: { icon: ShieldCheck, color: 'text-blue-500' },
  Superuser: { icon: UserCheck, color: 'text-green-500' },
  User: { icon: UserIcon, color: 'text-muted-foreground' },
};

function RoleDisplay({ role }: { role: Role }) {
  const { icon: Icon, color } = roleVisuals[role] || roleVisuals.User;
  return (
    <div className={cn('flex items-center gap-2', color)}>
      <Icon className="h-4 w-4" />
      <span>{role}</span>
    </div>
  );
}


export default function AdminUsersPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user: currentUser } = useUser();
  const usersCollection = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading } = useCollection<UserProfile>(usersCollection);

  const currentUserDocRef = useMemoFirebase(() => {
    if (!currentUser || !firestore) return null;
    return doc(firestore, 'users', currentUser.uid);
  }, [currentUser, firestore]);
  const { data: currentUserProfile } = useDoc<UserProfile>(currentUserDocRef);
  
  const [userToEdit, setUserToEdit] = useState<UserProfile | null>(null);
  const [userToToggleStatus, setUserToToggleStatus] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<Role>('User');

  const getDisplayName = (user: UserProfile) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || user.email;
  };

  const formatDate = (timestamp?: Timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString();
  };

  const handleToggleStatus = () => {
    if (userToToggleStatus && firestore && currentUser) {
      const newStatus = userToToggleStatus.status === 'Active' ? 'Inactive' : 'Active';
      const userDocRef = doc(firestore, 'users', userToToggleStatus.id);
      updateDocumentNonBlocking(userDocRef, { status: newStatus });

      logActivity(firestore, currentUser, {
        action: newStatus === 'Active' ? 'Enabled User' : 'Disabled User',
        target: getDisplayName(userToToggleStatus),
        targetType: 'User',
        details: `User status set to ${newStatus}.`,
        badgeVariant: newStatus === 'Active' ? 'default' : 'destructive',
        iconName: newStatus === 'Active' ? 'ShieldCheck' : 'ShieldOff'
      });

      toast({
        title: 'User Status Updated',
        description: `${getDisplayName(userToToggleStatus)} has been set to ${newStatus}.`,
      });
      setUserToToggleStatus(null);
    }
  };

  const handleSaveChanges = () => {
    if (userToEdit && firestore && currentUser) {
        const userDocRef = doc(firestore, 'users', userToEdit.id);
        const oldRole = userToEdit.role || 'User';
        updateDocumentNonBlocking(userDocRef, { role: newRole });

        logActivity(firestore, currentUser, {
          action: 'Changed Role',
          target: getDisplayName(userToEdit),
          targetType: 'User',
          details: `Changed role from ${oldRole} to ${newRole}.`,
          badgeVariant: 'default',
          iconName: 'ShieldCheck'
        });

        toast({
            title: 'User Updated',
            description: `${getDisplayName(userToEdit)}'s role has been changed to ${newRole}.`,
        });
        setUserToEdit(null);
    }
  };

  const openEditDialog = (user: UserProfile) => {
    setUserToEdit(user);
    setNewRole(user.role || 'User');
  };

  const canManageUser = (targetUser: UserProfile): boolean => {
    if (!currentUserProfile) return false;
    const requesterRole = currentUserProfile.role;
    const targetRole = targetUser.role;

    if (requesterRole === 'Superadmin') return true;
    if (requesterRole === 'Admin') return targetRole !== 'Admin' && targetRole !== 'Superadmin';
    if (requesterRole === 'Superuser') return targetRole === 'User';
    
    return false;
  };

  const canBeManaged = (user: UserProfile): boolean => {
    if (!currentUserProfile) return false;
    return user.id !== currentUserProfile.id;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            A list of all the users in your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : users && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id} className={cn(user.status === 'Inactive' && 'bg-muted/50 text-muted-foreground')}>
                    <TableCell className="font-medium">{getDisplayName(user)}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <RoleDisplay role={user.role || 'User'} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>
                        {user.status || 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      {canBeManaged(user) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost" disabled={!canManageUser(user)}>
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => openEditDialog(user)}>Edit Role</DropdownMenuItem>
                            {user.status !== 'Active' ? (
                              <DropdownMenuItem onSelect={() => setUserToToggleStatus(user)} className="text-green-600 focus:text-green-600">
                                <ShieldCheck className="mr-2 h-4 w-4" /> Enable
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onSelect={() => setUserToToggleStatus(user)} className="text-destructive focus:text-destructive">
                                <ShieldOff className="mr-2 h-4 w-4" /> Disable
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                  <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                          No users found.
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Disable/Enable Confirmation Dialog */}
      <AlertDialog open={!!userToToggleStatus} onOpenChange={(open) => !open && setUserToToggleStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will {userToToggleStatus?.status === 'Active' ? 'disable' : 'enable'} the account
              for <span className="font-bold">{userToToggleStatus && getDisplayName(userToToggleStatus)}</span>.
              A disabled user cannot access any part of the application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleToggleStatus} 
              className={cn(userToToggleStatus?.status === 'Active' && 'bg-destructive hover:bg-destructive/90')}
            >
              {userToToggleStatus?.status === 'Active' ? 'Disable' : 'Enable'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Role Dialog */}
      <Dialog open={!!userToEdit} onOpenChange={(open) => !open && setUserToEdit(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit User Role</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <p>
                    Change the role for <span className="font-bold">{userToEdit && getDisplayName(userToEdit)}</span>.
                </p>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">Role</Label>
                    <Select value={newRole} onValueChange={(value: Role) => setNewRole(value)}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="User">User</SelectItem>
                            <SelectItem value="Superuser">Superuser</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                             {currentUserProfile?.role === 'Superadmin' && (
                                <SelectItem value="Superadmin">Superadmin</SelectItem>
                             )}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setUserToEdit(null)}>Cancel</Button>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

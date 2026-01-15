'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Dog,
  Users,
  FileText,
  Settings,
  LogOut,
  PawPrint,
  ShieldAlert,
  ListCollapse
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pets", label: "Pets", icon: Dog },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/blogs", label: "Blogs", icon: FileText },
];

interface UserProfile {
  role?: 'Admin' | 'Superuser' | 'User' | 'Superadmin';
  username?: string;
}

function AccessDeniedScreen() {
    const router = useRouter();
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
            <ShieldAlert className="h-16 w-16 text-destructive" />
            <h1 className="mt-6 text-3xl font-bold font-headline text-foreground">
                Access Denied
            </h1>
            <p className="mt-2 max-w-md text-lg text-muted-foreground">
                You do not have the required permissions to view this page.
            </p>
            <Button onClick={() => router.push('/')} className="mt-6">
                Return to Homepage
            </Button>
        </div>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const isLoading = isAuthLoading || isProfileLoading;
  
  const isAuthorized = !isLoading && user && userProfile && (userProfile.role === 'Admin' || userProfile.role === 'Superuser' || userProfile.role === 'Superadmin');

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (!isAuthorized) {
        // Handled by the main render logic
      }
    }
  }, [isLoading, user, isAuthorized, router]);


  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <AccessDeniedScreen />;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
          <Sidebar
            collapsible="icon"
            className="flex h-full flex-col border-r"
          >
            <SidebarHeader className="shrink-0">
              <Link
                href="/admin"
                className="flex items-center gap-2 text-xl font-bold font-headline"
              >
                <PawPrint className="h-6 w-6 text-primary" />
                <span className="group-data-[collapsible=icon]:hidden">
                  PetVerse
                </span>
              </Link>
            </SidebarHeader>

            <SidebarContent className="flex-1 overflow-y-auto">
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href)}
                      tooltip={{ children: item.label }}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="shrink-0 border-t">
              <div className="p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:aspect-square">
                  <div className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:justify-center">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photoURL || undefined} alt={userProfile?.username} />
                        <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-sm group-data-[collapsible=icon]:hidden">
                        <span className="font-semibold text-foreground truncate">{userProfile?.username || user?.displayName || 'Admin'}</span>
                        <span className="text-muted-foreground text-xs truncate">{user?.email}</span>
                    </div>
                  </div>
              </div>
              <SidebarSeparator />
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip={{ children: "Settings" }}
                    isActive={pathname.startsWith("/admin/settings")}
                  >
                    <Link href="/admin/settings">
                      <Settings />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={{ children: "Logout" }}>
                    <Link href="/">
                      <LogOut />
                      <span>Logout</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 overflow-y-auto">
            <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-x-4 border-b bg-background px-4 shadow-sm sm:px-6 md:hidden">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold">Admin</h1>
            </header>
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
      </div>
    </SidebarProvider>
  );
}

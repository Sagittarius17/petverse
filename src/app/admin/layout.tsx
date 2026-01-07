
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
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
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Dog,
  Users,
  FileText,
  Settings,
  LogOut,
  PawPrint,
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pets", label: "Pets", icon: Dog },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/blogs", label: "Blogs", icon: FileText },
];

interface UserProfile {
  role?: 'Admin' | 'Superuser' | 'User';
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const isLoading = isAuthLoading || isProfileLoading;

  useEffect(() => {
    // This effect handles redirection based on auth state, but only after loading is complete.
    if (isLoading) {
      return; // Do nothing while loading
    }

    if (!user) {
      // If loading is done and there's no user, redirect to login.
      router.push('/login');
      return;
    }

    if (!userProfile || userProfile.role === 'User') {
      // If loading is done and the user is unauthorized, redirect them.
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You do not have permission to access the admin panel.',
      });
      router.push('/');
      return;
    }
  }, [user, userProfile, isLoading, router, toast]);

  // This block handles what to render: the loader, or the admin content.
  if (isLoading || !user || !userProfile || userProfile.role === 'User') {
    // Show a loader if we are still loading, or if the redirect effect hasn't run yet.
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If loading is complete and the user is authorized, render the admin layout.
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
                      isActive={
                        item.href === "/admin"
                          ? pathname === item.href
                          : pathname.startsWith(item.href)
                      }
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
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
      </div>
    </SidebarProvider>
  );
}

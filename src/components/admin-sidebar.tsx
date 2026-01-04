"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Dog, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  PawPrint
} from "lucide-react";

const menuItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/pets", label: "Pets", icon: Dog },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/blogs", label: "Blogs", icon: FileText },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
      <>
        <SidebarHeader>
           <Link href="/admin" className="flex items-center gap-2 text-xl font-bold font-headline">
              <PawPrint className="h-6 w-6 text-primary" />
              <span className="group-data-[collapsible=icon]:hidden">PetVerse</span>
            </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
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
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{children: 'Settings'}} isActive={pathname === '/admin/settings'}>
                    <Link href="/admin/settings">
                        <Settings />
                        <span>Settings</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{children: 'Logout'}}>
                    <Link href="/">
                        <LogOut />
                        <span>Logout</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </>
    );
  }
  
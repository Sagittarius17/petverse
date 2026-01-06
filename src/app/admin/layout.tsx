'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pets", label: "Pets", icon: Dog },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/blogs", label: "Blogs", icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      {/* FULL HEIGHT COLUMN */}
      <div className="flex min-h-screen flex-col">

        {/* ===== NAVBAR (already exists globally) ===== */}
        {/* Do NOT subtract height manually */}

        {/* ===== MAIN ADMIN AREA ===== */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* SIDEBAR */}
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

            {/* SCROLLABLE MENU */}
            <SidebarContent className="flex-1 overflow-y-auto">
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        pathname === item.href ||
                        (item.href !== "/admin" && pathname.startsWith(item.href))
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

            {/* FIXED SIDEBAR FOOTER */}
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

          {/* MAIN CONTENT */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>

        {/* ===== GLOBAL FOOTER (NO COLLISION NOW) ===== */}
      </div>
    </SidebarProvider>
  );
}

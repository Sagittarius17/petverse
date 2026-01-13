
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, PawPrint, Sun, Moon, Trees, Flower, Monitor, User as UserIcon, Home, Search, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useAuth } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { ServicesMenu } from './services-menu';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { useTheme } from 'next-themes';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/adopt', label: 'Adoption', icon: PawPrint },
  { href: '/lost-and-found', label: 'Lost & Found', icon: Search },
  { href: '/know-your-pet', label: 'Know Your Pet', icon: Heart },
];

export default function AdoptionHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isUserLoading } = useUser();
  const { setTheme } = useTheme();
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isShop = pathname.startsWith('/shop');

  const handleToggle = (checked: boolean) => {
    if (checked) {
      router.push('/shop');
    } else {
      router.push('/');
    }
  };

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline">
          <PawPrint className="h-6 w-6 text-primary" />
          PetVerse
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative font-medium transition-colors hover:text-foreground",
                "after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:bg-primary after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100",
                isClient && pathname === href
                  ? "text-foreground after:scale-x-100"
                  : "text-muted-foreground"
              )}
            >
              {label}
            </Link>
          ))}
          <ServicesMenu />
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {isUserLoading ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || ''} />
                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-transparent hover:bg-transparent focus:text-current hover:text-current cursor-default">
                    <div className="flex items-center justify-between w-full">
                        <Label htmlFor="view-mode-desktop" className="text-sm font-bold cursor-pointer pr-2">PetVerse</Label>
                        <Switch
                            id="view-mode-desktop"
                            checked={isShop}
                            onCheckedChange={handleToggle}
                        />
                        <Label htmlFor="view-mode-desktop" className="text-sm font-bold cursor-pointer pl-2">PetShop</Label>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="ml-2">Toggle theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme('light')}>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Light</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')}>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Dark</span>
                    </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => setTheme("dark-forest")}>
                      <Trees className="mr-2 h-4 w-4" />
                      <span>Forest</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("light-rose")}>
                      <Flower className="mr-2 h-4 w-4" />
                      <span>Rose</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('system')}>
                      <Monitor className="mr-2 h-4 w-4" />
                      <span>System</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline" onClick={() => setIsMenuOpen(false)}>
              <PawPrint className="h-6 w-6 text-primary" />
               PetVerse
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex flex-col bg-background items-start gap-2 p-4 text-left">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-4 text-xl w-full p-4 rounded-md font-medium",
                  pathname === href ? "text-foreground bg-muted" : "text-muted-foreground hover:bg-muted/50"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon className="h-6 w-6" />
                <span>{label}</span>
              </Link>
            ))}
             <Link
                href="#"
                className="flex items-center gap-4 text-xl w-full p-4 rounded-md font-medium text-muted-foreground hover:bg-muted/50"
                onClick={() => setIsMenuOpen(false)}
              >
                 <X className="h-6 w-6" />
                <span>Services</span>
              </Link>
            <div className="mt-8 flex w-full flex-col items-start gap-4">
              {user ? (
                <>
                    <Button asChild size="lg" className="w-full justify-start text-lg p-8">
                        <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                            <UserIcon className="mr-4 h-6 w-6" />
                            Profile
                        </Link>
                    </Button>
                    <Button variant="ghost" size="lg" onClick={handleLogout} className="w-full justify-start text-lg p-8 text-destructive hover:text-destructive">
                         <X className="mr-4 h-6 w-6 text-destructive" />
                        Log Out
                    </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="w-full">
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>Log In</Link>
                  </Button>
                  <Button variant="outline" asChild size="lg" className="w-full">
                      <Link href="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

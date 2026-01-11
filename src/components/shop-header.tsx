
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Menu, X, PawPrint, ShoppingCart, Search, Sun, Moon, Trees, Flower, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { useTheme } from 'next-themes';

const navLinks = [
  { href: '/shop', label: 'Home' },
  { href: '/shop/food', label: 'Food' },
  { href: '/shop/toys', label: 'Toys' },
  { href: '/shop/accessories', label: 'Accessories' },
];

export default function ShopHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
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
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams);
    const value = e.target.value;
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    // Use replace to avoid adding to browser history for each keystroke
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 gap-4">
        <Link href="/shop" className="flex items-center gap-2 text-xl font-bold font-headline">
          <PawPrint className="h-6 w-6 text-primary" />
          PetShop
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative text-sm font-medium transition-colors hover:text-foreground",
                "after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:bg-primary after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100",
                isClient && pathname === href
                  ? "text-foreground after:scale-x-100"
                  : "text-muted-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        
        <div className="hidden md:flex flex-1 max-w-md">
           <div className="w-full relative">
            <Input 
              placeholder="Search for food, toys, accessories..." 
              className="w-full pl-10"
              defaultValue={searchParams.get('q') || ''}
              onChange={handleSearch}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Shopping Cart</span>
          </Button>
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
                    <div className="flex items-center justify-center w-full gap-2">
                        <Label htmlFor="view-mode-desktop-shop" className="font-bold cursor-pointer">PetVerse</Label>
                        <Switch
                            id="view-mode-desktop-shop"
                            checked={isShop}
                            onCheckedChange={handleToggle}
                        />
                        <Label htmlFor="view-mode-desktop-shop" className="font-bold cursor-pointer">PetShop</Label>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/orders">Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/wishlist">Wishlist</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/addresses">Address</Link>
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
              <Button asChild>
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
            <Link href="/shop" className="flex items-center gap-2 text-xl font-bold font-headline" onClick={() => setIsMenuOpen(false)}>
              <PawPrint className="h-6 w-6 text-primary" />
               PetShop
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex flex-col items-center gap-6 p-8">
            <div className="w-full relative">
                <Input 
                  placeholder="Search..." 
                  className="w-full pl-10" 
                  defaultValue={searchParams.get('q') || ''}
                  onChange={handleSearch}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-lg font-medium",
                  pathname === href ? "text-foreground" : "text-muted-foreground"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="mt-6 flex flex-col gap-4 w-full">
              {user ? (
                 <Button variant="outline" size="lg" onClick={handleLogout}>
                    Log Out
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild size="lg">
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>Log In</Link>
                  </Button>
                  <Button asChild size="lg">
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

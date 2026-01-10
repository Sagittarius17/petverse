"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Menu, X, PawPrint, ShoppingCart, Search } from 'lucide-react';
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
} from "@/components/ui/dropdown-menu";
import { ThemeSwitcher } from './theme-switcher';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { Switch } from './ui/switch';

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
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

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
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set('q', searchTerm);
    } else {
      params.delete('q');
    }
    // Navigate to the base shop page with search query
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 gap-4">
        <Link href="/shop" className="flex items-center gap-2 text-xl font-bold font-headline">
          <PawPrint className="h-6 w-6 text-primary" />
          PetVerse Shop
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
           <form onSubmit={handleSearch} className="w-full relative">
            <Input 
              placeholder="Search for food, toys, accessories..." 
              className="w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </form>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Shopping Cart</span>
          </Button>
          <ThemeSwitcher />
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
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-transparent">
                    <div className="flex items-center space-x-2 w-full">
                        <Label htmlFor="view-mode-desktop-shop" className="text-sm font-normal text-muted-foreground">Adoption</Label>
                        <Switch
                            id="view-mode-desktop-shop"
                            checked={isShop}
                            onCheckedChange={handleToggle}
                        />
                        <Label htmlFor="view-mode-desktop-shop" className="text-sm font-medium">Shop</Label>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
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
               PetVerse Shop
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex flex-col items-center gap-6 p-8">
            <form onSubmit={handleSearch} className="w-full relative">
                <Input 
                  placeholder="Search..." 
                  className="w-full pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </form>
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
            <div className="mt-4">
              <ThemeSwitcher />
            </div>
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

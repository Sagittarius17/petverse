"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Menu, X, PawPrint, ShoppingCart, Search, Sun, Moon, Trees, Flower, Monitor, User, Package, Heart, Home, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, DocumentData } from 'firebase/firestore';
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
import useCartStore from '@/lib/cart-store';
import { Badge } from './ui/badge';
import CartSheet from './cart-sheet';
import { Skeleton } from './ui/skeleton';

const navLinks = [
  { href: '/shop', label: 'Home', icon: Home },
  { href: '/shop/products', label: 'Products', icon: ShoppingCart },
];

interface UserProfile extends DocumentData {
    profilePicture?: string;
    displayName: string;
    email: string;
}

export default function ShopHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, isUserLoading: isAuthLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore(); // get firestore instance
  const { setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const { totalItems } = useCartStore();

  // Fetch user profile from firestore
  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const isUserLoading = isAuthLoading || isProfileLoading;

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
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get('q') as string;
    
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }

    const currentPath = ['/shop/food', '/shop/toys', '/shop/accessories', '/shop/products'].includes(pathname)
      ? pathname
      : '/shop/products';
      
    router.push(`${currentPath}?${params.toString()}`);
    setIsMenuOpen(false);
  };

  const avatarUrl = userProfile?.profilePicture || user?.photoURL;

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 gap-4">
        <Link href="/shop" className="flex items-center gap-2 text-xl font-bold font-headline">
          <PawPrint className="h-6 w-6 text-primary" />
          PetShop
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
        </nav>
        
        <div className="hidden md:flex flex-1 max-w-md">
           <form onSubmit={handleSearch} className="w-full relative">
            <Input 
              name="q"
              placeholder="Search for food, toys, accessories..." 
              className="w-full pl-10"
              defaultValue={searchParams.get('q') || ''}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </form>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-destructive p-0">
                  {totalItems}
                </Badge>
              )}
              <span className="sr-only">Shopping Cart</span>
          </Button>
          {isUserLoading ? null : user && !user.isAnonymous ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl} alt={userProfile?.displayName || user.displayName || user.email || ''} />
                    <AvatarFallback><PawPrint className="h-4 w-4 text-muted-foreground" /></AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="cursor-pointer focus:bg-accent" asChild>
                  <Link href="/profile">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userProfile?.displayName || user.displayName || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-transparent hover:bg-transparent focus:text-current hover:text-current cursor-default">
                    <div className="flex items-center justify-center w-full gap-2">
                        <Label htmlFor="view-mode-desktop-shop" className="font-bold cursor-pointer">PetVerse</Label>
                        <Switch
                            id="view-mode-desktop-shop"
                            checked={isClient && isShop}
                            onCheckedChange={handleToggle}
                        />
                        <Label htmlFor="view-mode-desktop-shop" className="font-bold cursor-pointer">PetShop</Label>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/shop/order">
                    <Package className="mr-2 h-4 w-4" />
                    <span>Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/shop/address">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Address</span>
                  </Link>
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
                    <DropdownMenuItem onClick={() => setTheme('system')}>
                      <Monitor className="mr-2 h-4 w-4" />
                      <span>System</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
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
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-destructive p-0">
                  {totalItems}
                </Badge>
              )}
              <span className="sr-only">Shopping Cart</span>
          </Button>
          {isUserLoading ? <Skeleton className="h-8 w-8 rounded-full" /> : user && !user.isAnonymous ? (
            <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0" onClick={() => setIsMenuOpen(true)}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl} alt={userProfile?.displayName || user.displayName || user.email || ''} />
                <AvatarFallback><PawPrint className="h-4 w-4 text-muted-foreground" /></AvatarFallback>
              </Avatar>
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
          )}
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
          <div className="flex flex-col gap-2 p-4 pt-6">
            <form onSubmit={handleSearch} className="relative w-full">
                <Input 
                  name="q"
                  placeholder="Search..." 
                  className="w-full pl-10" 
                  defaultValue={searchParams.get('q') || ''}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </form>
             <div className="flex flex-col items-start gap-1 w-full text-left mt-4">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-4 text-lg w-full p-4 rounded-md font-medium",
                      isClient && pathname === href ? "text-foreground bg-muted" : "text-muted-foreground hover:bg-muted/50"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-6 w-6" />
                    <span>{label}</span>
                  </Link>
                ))}
            </div>
            <div className="mt-6 flex w-full flex-col items-center gap-4 border-t pt-6">
                 <div className="flex items-center justify-center w-full gap-2">
                    <Label htmlFor="view-mode-mobile-shop" className="font-bold cursor-pointer">PetVerse</Label>
                    <Switch
                        id="view-mode-mobile-shop"
                        checked={isClient && isShop}
                        onCheckedChange={handleToggle}
                    />
                    <Label htmlFor="view-mode-mobile-shop" className="font-bold cursor-pointer">PetShop</Label>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="lg" className="w-full justify-start text-lg p-6">
                      <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute left-6 h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      <span className="ml-4">Change Theme</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="center">
                    <DropdownMenuItem onClick={() => setTheme('light')}>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Light</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')}>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Dark</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('system')}>
                      <Monitor className="mr-2 h-4 w-4" />
                      <span>System</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              {user && !user.isAnonymous ? (
                <>
                  <Button asChild size="lg" className="w-full justify-start text-lg p-6">
                    <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                      <User className="mr-4 h-6 w-6" />
                      <span>Profile</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="lg" onClick={handleLogout} className="w-full justify-center text-lg p-6 text-destructive hover:text-destructive">
                      <LogOut className="mr-2 h-6 w-6" />
                      <span>Log Out</span>
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
    <CartSheet isOpen={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}

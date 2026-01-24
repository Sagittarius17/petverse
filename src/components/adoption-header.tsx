"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, PawPrint, Sun, Moon, Trees, Flower, Monitor, User as UserIcon, Home, Search, Heart, ChevronsDown, LogOut, ArrowLeft, Scissors, Stethoscope, Bone, HeartHandshake, ShoppingCart, Building, Shield, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { ServicesMenu as DesktopServicesMenu } from './services-menu';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { useTheme } from 'next-themes';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';


const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/adopt', label: 'Adoption', icon: PawPrint },
  { href: '/lost-and-found', label: 'Lost & Found', icon: Search },
  { href: '/know-your-pet', label: 'Know Your Pet', icon: Heart },
];

const services = [
  {
    title: 'Pet Care',
    items: [
      {
        title: 'Pet Grooming',
        href: '#',
        description: 'Professional grooming to keep your pet looking and feeling great.',
        icon: Scissors,
      },
      {
        title: 'Consult a Vet',
        href: '#',
        description: 'Connect with certified veterinarians for expert medical advice.',
        icon: Stethoscope,
      },
      {
        title: 'Dog Training',
        href: '#',
        description: 'Obedience and behavior training for a well-behaved companion.',
        icon: Bone,
      },
      {
        title: 'Dog Walking',
        href: '#',
        description: 'Reliable dog walking services to keep your friend active.',
        icon: HeartHandshake,
      },
    ],
  },
  {
    title: 'Resources',
    items: [
      {
        title: 'Online Pet Shop',
        href: '/shop',
        description: 'Shop for food, toys, and accessories from the comfort of home.',
        icon: ShoppingCart,
      },
      {
        title: 'Pet Boarding',
        href: '#',
        description: 'Safe and comfortable boarding facilities for when you are away.',
        icon: Building,
      },
      {
        title: 'Re-home a Pet',
        href: '#',
        description: 'Find a new loving home for your pet with our re-homing service.',
        icon: Home,
      },
    ],
  },
  {
    title: 'Community',
    items: [
      {
        title: 'Report Animal Abuse',
        href: '#',
        description: 'Anonymously report cases of animal cruelty or neglect.',
        icon: Shield,
      },
      {
        title: 'Pet Mating',
        href: '#',
        description: 'Connect with other pet owners for responsible breeding.',
        icon: HeartHandshake,
      },
      {
        title: 'Register Pet for Mating',
        href: '#',
        description: 'List your pet for mating and find the perfect match.',
        icon: UserPlus,
      },
    ],
  },
];

interface UserProfile extends DocumentData {
    profilePicture?: string;
    displayName: string;
    email: string;
}


export default function AdoptionHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore(); // get firestore instance
  const { setTheme } = useTheme();
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const defaultAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-1');

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

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsServicesMenuOpen(false);
  }
  
  const avatarUrl = userProfile?.profilePicture || user?.photoURL || defaultAvatar?.imageUrl;

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
          <DesktopServicesMenu />
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {isUserLoading ? null : user && !user.isAnonymous ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl} alt={userProfile?.displayName || user.displayName || user.email || ''} />
                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile?.displayName || user.displayName || 'User'}</p>
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
                            checked={isClient && isShop}
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
          {isUserLoading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : user && !user.isAnonymous ? (
            <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0" onClick={() => setIsMenuOpen(true)}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl} alt={userProfile?.displayName || user.displayName || user.email || ''} />
                <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
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
        <>
            <div className="fixed inset-0 z-50 bg-background md:hidden">
            <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline" onClick={closeAllMenus}>
                <PawPrint className="h-6 w-6 text-primary" />
                PetVerse
                </Link>
                <Button variant="ghost" size="icon" onClick={closeAllMenus}>
                <X className="h-6 w-6" />
                </Button>
            </div>
            <div className="flex flex-col bg-background items-start gap-1 p-4 text-left">
                {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                    key={href}
                    href={href}
                    className={cn(
                    "flex items-center gap-4 text-lg w-full p-4 rounded-md font-medium",
                    isClient && pathname === href ? "text-foreground bg-muted" : "text-muted-foreground hover:bg-muted/50"
                    )}
                    onClick={closeAllMenus}
                >
                    <Icon className="h-6 w-6" />
                    <span>{label}</span>
                </Link>
                ))}
                <button
                    className="flex items-center gap-4 text-lg w-full p-4 rounded-md font-medium text-muted-foreground hover:bg-muted/50"
                    onClick={() => setIsServicesMenuOpen(true)}
                >
                    <ChevronsDown className="h-6 w-6" />
                    <span>Services</span>
                </button>

                <div className="mt-6 flex w-full flex-col items-center gap-4 border-t pt-6">
                    <div className="flex items-center justify-center w-full gap-2">
                        <Label htmlFor="view-mode-mobile" className="font-bold cursor-pointer">PetVerse</Label>
                        <Switch
                            id="view-mode-mobile"
                            checked={isClient && isShop}
                            onCheckedChange={handleToggle}
                        />
                        <Label htmlFor="view-mode-mobile" className="font-bold cursor-pointer">PetShop</Label>
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                {user && !user.isAnonymous ? (
                    <>
                        <Button asChild size="lg" className="w-full justify-start text-lg p-6">
                            <Link href="/profile" onClick={closeAllMenus}>
                                <UserIcon className="mr-4 h-6 w-6" />
                                Profile
                            </Link>
                        </Button>
                        <Button variant="ghost" size="lg" onClick={handleLogout} className="w-full justify-center text-lg p-6 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <LogOut className="mr-2 h-6 w-6" />
                            Log Out
                        </Button>
                    </>
                ) : (
                    <>
                    <Button asChild size="lg" className="w-full">
                        <Link href="/login" onClick={closeAllMenus}>Log In</Link>
                    </Button>
                    <Button variant="outline" asChild size="lg" className="w-full">
                        <Link href="/register" onClick={closeAllMenus}>Register</Link>
                    </Button>
                    </>
                )}
                </div>
            </div>
            </div>

            {isServicesMenuOpen && (
                <div className="fixed inset-0 z-[60] bg-background md:hidden">
                    <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                        <h2 className="text-xl font-bold font-headline">All Services</h2>
                        <Button variant="ghost" size="icon" onClick={() => setIsServicesMenuOpen(false)}>
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                    <ScrollArea className="h-[calc(100vh-4rem)] p-4">
                        <div className="bg-background space-y-6">
                            {services.map(category => (
                                <div key={category.title}>
                                    <h3 className="mb-4 text-lg font-semibold text-primary">{category.title}</h3>
                                    <div className="grid gap-2">
                                        {category.items.map(item => {
                                            const ItemIcon = item.icon;
                                            return (
                                                <Link
                                                    key={item.title}
                                                    href={item.href}
                                                    onClick={closeAllMenus}
                                                    className="flex items-start gap-4 rounded-lg p-3 text-left transition-colors hover:bg-muted"
                                                >
                                                    <ItemIcon className="h-6 w-6 mt-1 text-muted-foreground flex-shrink-0" />
                                                    <div>
                                                        <p className="font-medium text-foreground">{item.title}</p>
                                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </>
      )}
    </header>
  );
}

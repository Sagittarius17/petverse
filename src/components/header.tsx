"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/adopt', label: 'Adoption' },
  { href: '/care', label: 'Care Guides' },
  { href: '/lost-and-found', label: 'Lost & Found' },
  { href: '/admin', label: 'Admin' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline">
          <PawPrint className="h-6 w-6 text-primary" />
          PetVerse
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/register">Register</Link>
          </Button>
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
          <div className="flex flex-col items-center gap-6 p-8">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                {label}
              </Link>
            ))}
            <div className="mt-6 flex flex-col gap-4 w-full">
               <Button variant="outline" asChild size="lg">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>Log In</Link>
                </Button>
                <Button asChild size="lg">
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
                </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

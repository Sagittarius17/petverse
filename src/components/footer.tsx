import Link from 'next/link';
import { PawPrint, Twitter, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-secondary">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline">
              <PawPrint className="h-6 w-6 text-primary" />
              PetVerse
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">Your universe for pets.</p>
          </div>
          <div>
            <h3 className="font-semibold tracking-wider text-foreground">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/adopt" className="text-sm text-muted-foreground hover:text-primary">Adoption</Link></li>
              <li><Link href="/care" className="text-sm text-muted-foreground hover:text-primary">Care Guides</Link></li>
              <li><Link href="/lost-and-found" className="text-sm text-muted-foreground hover:text-primary">Lost & Found</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold tracking-wider text-foreground">About Us</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Our Mission</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Contact</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Blog</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between border-t pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} PetVerse. All rights reserved.</p>
          <div className="mt-4 flex space-x-4 sm:mt-0">
            <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

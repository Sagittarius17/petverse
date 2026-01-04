import Link from 'next/link';
import { PawPrint, Twitter, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-secondary">
      <div className="container mx-auto max-w-7xl px-4 py-8 text-center">
        <div className="flex justify-center mb-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline">
              <PawPrint className="h-6 w-6 text-primary" />
              PetVerse
            </Link>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">Your universe for pets.</p>
        <div className="flex justify-center gap-6 mb-6 text-sm">
            <Link href="/adopt" className="text-muted-foreground hover:text-primary">Adoption</Link>
            <Link href="/care" className="text-muted-foreground hover:text-primary">Care Guides</Link>
            <Link href="/lost-and-found" className="text-muted-foreground hover:text-primary">Lost & Found</Link>
             <Link href="#" className="text-muted-foreground hover:text-primary">Contact</Link>
        </div>
        <div className="flex justify-center space-x-4 mb-6">
            <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>
        </div>
        <div className="border-t pt-6">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} PetVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

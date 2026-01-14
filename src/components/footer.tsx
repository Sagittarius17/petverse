
import Link from 'next/link';
import { PawPrint, Twitter, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-secondary">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* About Section */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline mb-2">
              <PawPrint className="h-6 w-6 text-primary" />
              PetVerse
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              Your one-stop destination for pet adoption, care, and community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-md font-semibold font-headline mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="/blog" className="text-muted-foreground hover:text-primary">Blog</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary">FAQs</Link></li>
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h3 className="text-md font-semibold font-headline mb-4">Get Involved</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/adopt" className="text-muted-foreground hover:text-primary">Adoption</Link></li>
              <li><Link href="/care" className="text-muted-foreground hover:text-primary">Care Guides</Link></li>
              <li><Link href="/lost-and-found" className="text-muted-foreground hover:text-primary">Lost & Found</Link></li>
            </ul>
          </div>

          {/* Partner With Us */}
          <div className='col-span-2 md:col-span-1'>
            <h3 className="text-md font-semibold font-headline mb-4">Be a Partner</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/be-a-partner" className="text-muted-foreground hover:text-primary">Dog Trainers</Link></li>
              <li><Link href="/be-a-partner" className="text-muted-foreground hover:text-primary">Dog Walkers</Link></li>
              <li><Link href="/be-a-partner" className="text-muted-foreground hover:text-primary">Veterinarians</Link></li>
              <li><Link href="/be-a-partner" className="text-muted-foreground hover:text-primary">Groomers</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground order-2 sm:order-1 mt-4 sm:mt-0">
            &copy; {new Date().getFullYear()} PetVerse. All rights reserved.
          </p>
          <div className="flex space-x-4 order-1 sm:order-2">
              <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

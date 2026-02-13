
import Link from 'next/link';
import { PawPrint, Facebook, Instagram } from 'lucide-react';

export default function AdoptionFooter() {
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
              <li><Link href="/donate" className="text-muted-foreground hover:text-primary">Donate</Link></li>
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

        <div className="mt-8 border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-y-4">
          <p className="text-sm text-muted-foreground order-3 sm:order-1">
            &copy; {new Date().getFullYear()} PetVerse. All rights reserved.
          </p>
          <div className="flex gap-4 sm:gap-6 order-2 sm:order-2">
            <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
            <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
          </div>
          <div className="flex space-x-4 order-1 sm:order-3">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current">
                    <title>X</title>
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.847h-7.407l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 7.184L18.901 1.153ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

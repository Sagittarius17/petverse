import Link from 'next/link';
import { PawPrint, Twitter, Facebook, Instagram } from 'lucide-react';

export default function ShopFooter() {
  return (
    <footer className="border-t bg-secondary">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* About Section */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/shop" className="flex items-center gap-2 text-xl font-bold font-headline mb-2">
              <PawPrint className="h-6 w-6 text-primary" />
              PetVerse Shop
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              Your one-stop shop for high-quality pet supplies and accessories.
            </p>
          </div>

          {/* Shop by Category */}
          <div>
            <h3 className="text-md font-semibold font-headline mb-4">Shop by Category</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop/products?category=Food" className="text-muted-foreground hover:text-primary">Food</Link></li>
              <li><Link href="/shop/products?category=Toys" className="text-muted-foreground hover:text-primary">Toys</Link></li>
              <li><Link href="/shop/products?category=Accessories" className="text-muted-foreground hover:text-primary">Accessories</Link></li>
              <li><Link href="/shop/products?category=Bedding" className="text-muted-foreground hover:text-primary">Bedding</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-md font-semibold font-headline mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary">FAQs</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Shipping & Returns</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Track Your Order</Link></li>
            </ul>
          </div>
          
           {/* About PetVerse */}
          <div className='col-span-2 md:col-span-1'>
            <h3 className="text-md font-semibold font-headline mb-4">About PetVerse</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-muted-foreground hover:text-primary">Main Site</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="/blog" className="text-muted-foreground hover:text-primary">Blog</Link></li>
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

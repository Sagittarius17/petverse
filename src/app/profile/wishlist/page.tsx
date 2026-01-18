
'use client';
import useCartStore from '@/lib/cart-store';
import ProductCard from '@/components/product-card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function WishlistPage() {
  const { wishlist } = useCartStore();

  return (
    <div className="p-8">
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        <p className="text-muted-foreground mb-6">Here are the items you have saved for later.</p>

        {wishlist.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
             </div>
        ) : (
             <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                    <p>Your wishlist is empty.</p>
                     <Button asChild variant="link">
                        <Link href="/shop/products">Find products you'll love</Link>
                    </Button>
                </CardContent>
            </Card>
        )}

    </div>
  )
}

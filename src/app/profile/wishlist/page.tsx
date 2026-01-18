
'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Info } from 'lucide-react';

export default function WishlistPage() {
  return (
    <div className="p-8">
        <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
                <Info className="mx-auto h-8 w-8 mb-4" />
                <p className="font-semibold">Your wishlist has a new home!</p>
                <p>You can now find your wishlist inside the shopping cart panel, accessible from the shop header.</p>
                 <Button asChild variant="link">
                    <Link href="/shop">Go to the Shop</Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  )
}

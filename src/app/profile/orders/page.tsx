'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PackageSearch } from 'lucide-react';

export default function OrdersMovedPage() {
  return (
    <div className="p-8">
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <PackageSearch className="mx-auto h-12 w-12 mb-4" />
          <p className="font-semibold text-xl text-foreground">Your orders have moved!</p>
          <p className="mt-2">You can now find your order history in the main shop section.</p>
          <Button asChild variant="link" className="mt-2">
            <Link href="/shop/order">Go to My Orders</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

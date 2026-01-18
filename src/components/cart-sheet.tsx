
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import useCartStore from '@/lib/cart-store';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';

interface CartSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CartSheet({ isOpen, onOpenChange }: CartSheetProps) {
  const {
    items,
    totalItems,
    subtotal,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
  } = useCartStore();

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0 w-full sm:max-w-md">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-2xl font-headline flex items-center gap-2">
            <ShoppingCart />
            Your Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>
        {totalItems > 0 ? (
          <>
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {items.map((item) => {
                  const image = PlaceHolderImages.find(p => p.id === item.imageId);
                  return (
                    <div key={item.id} className="flex items-start gap-4">
                      <div className="relative h-20 w-20 rounded-md overflow-hidden bg-secondary">
                        {image && <Image src={image.imageUrl} alt={item.name} fill style={{objectFit: 'cover'}} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => decrementQuantity(item.id)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-bold w-4 text-center">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => incrementQuantity(item.id)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                         <Button variant="ghost" size="icon" className="h-8 w-8 mt-2 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                            <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <SheetFooter className="p-6 border-t bg-secondary flex-col space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <SheetDescription>
                Shipping and taxes will be calculated at checkout.
              </SheetDescription>
              <Button asChild size="lg" className="w-full">
                <Link href="/shop/checkout">Proceed to Checkout</Link>
              </Button>
            </SheetFooter>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
             <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mb-4" />
             <h3 className="text-xl font-semibold">Your cart is empty</h3>
             <p className="text-muted-foreground mt-2">Looks like you haven't added anything to your cart yet.</p>
             <Button asChild variant="outline" className="mt-6" onClick={() => onOpenChange(false)}>
                <Link href="/shop/products">Start Shopping</Link>
             </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

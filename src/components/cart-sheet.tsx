
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useCartStore from '@/lib/cart-store';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Trash2, Plus, Minus, ShoppingCart, Heart, Forward } from 'lucide-react';
import type { Product } from '@/lib/shop-data';

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
    wishlist,
    toggleWishlist,
    addToCart,
  } = useCartStore();

  const handleMoveToCart = (product: Product) => {
    addToCart(product);
    toggleWishlist(product); // This will remove it from wishlist
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0 w-full sm:max-w-lg">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-2xl font-headline flex items-center gap-2">
            My Items
          </SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="cart" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cart">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Cart ({totalItems})
              </TabsTrigger>
              <TabsTrigger value="wishlist">
                <Heart className="mr-2 h-4 w-4" />
                Wishlist ({wishlist.length})
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="cart" className="flex-1 flex flex-col overflow-hidden mt-0 data-[state=inactive]:hidden">
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
                <SheetFooter className="p-6 border-t bg-secondary flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <div className="flex justify-between text-lg font-semibold">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <SheetDescription>
                        Shipping and taxes calculated at checkout.
                    </SheetDescription>
                  </div>
                  <Button asChild size="lg" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
                    <Link href="/shop/checkout">Proceed to Checkout</Link>
                  </Button>
                </SheetFooter>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-semibold">Your cart is empty</h3>
                <p className="text-muted-foreground mt-2">Add some goodies to your cart!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="wishlist" className="flex-1 flex flex-col overflow-hidden mt-0 data-[state=inactive]:hidden">
            {wishlist.length > 0 ? (
                <ScrollArea className="flex-1">
                  <div className="p-6 space-y-6">
                    {wishlist.map((item) => {
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
                                <Button size="sm" onClick={() => handleMoveToCart(item)}>
                                    <Forward className="mr-2 h-4 w-4" /> Move to Cart
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => toggleWishlist(item)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                           </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <h3 className="text-xl font-semibold">Your wishlist is empty</h3>
                    <p className="text-muted-foreground mt-2">Save items you love by clicking the heart icon.</p>
                </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}


'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type Product } from '@/lib/shop-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ShoppingCart, Heart } from 'lucide-react';
import useCartStore from '@/lib/cart-store';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/localization';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const image = PlaceHolderImages.find(p => p.id === product.imageId);
  const { addToCart, toggleWishlist, isWishlisted } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const wishlisted = isWishlisted(product.id);

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg group">
      <CardHeader className="relative h-56 w-full p-0">
        <div className="cursor-pointer h-full w-full">
          {image && (
            <Image
              src={image.imageUrl}
              alt={product.name}
              fill
              style={{ objectFit: 'cover' }}
              data-ai-hint={image.imageHint}
              className="transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="mb-1 text-lg font-headline group-hover:underline">
          {product.name}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">{product.description}</CardDescription>
        <p className="mt-2 text-lg font-semibold">{formatCurrency(product.price)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button className="w-full" onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
        <Button 
            variant="outline" 
            size="icon" 
            onClick={handleToggleWishlist}
            className={cn(wishlisted && 'border-red-500 hover:bg-red-500/10')}
        >
          <Heart className={cn("h-5 w-5", wishlisted ? "text-red-500 fill-red-500" : "text-muted-foreground")} />
        </Button>
      </CardFooter>
    </Card>
  );
}

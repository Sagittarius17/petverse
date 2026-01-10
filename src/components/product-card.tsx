'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type Product } from '@/lib/shop-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const image = PlaceHolderImages.find(p => p.id === product.imageId);

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
        <p className="mt-2 text-lg font-semibold">${product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full">
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}

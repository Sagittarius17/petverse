import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Pet } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface PetCardProps {
  pet: Pet;
}

export default function PetCard({ pet }: PetCardProps) {
  const image = PlaceHolderImages.find(p => p.id === pet.imageId);

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="relative h-48 w-full p-0">
        <Link href={`/adopt/${pet.id}`}>
          {image && (
            <Image
              src={image.imageUrl}
              alt={image.description}
              fill
              style={{ objectFit: 'cover' }}
              data-ai-hint={image.imageHint}
              className="transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </Link>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="mb-2 text-xl font-headline">
          <Link href={`/adopt/${pet.id}`} className="hover:underline">{pet.name}</Link>
        </CardTitle>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">{pet.breed}</Badge>
          <Badge variant="secondary">{pet.age}</Badge>
          <Badge variant="secondary">{pet.gender}</Badge>
        </div>
        <p className="mt-3 text-sm line-clamp-2">{pet.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={`/adopt/${pet.id}`}>Meet {pet.name}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import type { CareGuide } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface CareGuideCardProps {
  guide: CareGuide;
}

export default function CareGuideCard({ guide }: CareGuideCardProps) {
  const image = PlaceHolderImages.find(p => p.id === guide.imageId);

  return (
    <Link href={`/care/${guide.id}`} className="group">
      <Card className="flex h-full flex-col overflow-hidden transition-all group-hover:shadow-lg">
        <CardHeader className="relative h-48 w-full p-0">
          {image && (
            <Image
              src={image.imageUrl}
              alt={image.description}
              fill
              style={{ objectFit: 'cover' }}
              data-ai-hint={image.imageHint}
            />
          )}
        </CardHeader>
        <CardContent className="flex-grow p-4">
          <Badge variant="outline" className="mb-2">{guide.petType}</Badge>
          <CardTitle className="mb-2 text-xl font-headline">{guide.title}</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">{guide.summary}</p>
        </CardContent>
        <div className="p-4 pt-0">
          <span className="text-sm font-semibold text-primary group-hover:underline">
            Read More <ArrowRight className="inline h-4 w-4" />
          </span>
        </div>
      </Card>
    </Link>
  );
}

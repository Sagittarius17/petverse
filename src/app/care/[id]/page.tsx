'use client';

import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { allCareGuides } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { use } from 'react';

// Using a client component to use the useRouter hook
export default function CareGuidePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const guide = allCareGuides.find(g => g.id === resolvedParams.id);

  if (!guide) {
    notFound();
  }

  const image = PlaceHolderImages.find(p => p.id === guide.imageId);

  const renderContent = (content: string) => {
    return content
      .split('\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map((paragraph, index) => {
        if (paragraph.startsWith('### ')) {
          return <h3 key={index} className="text-2xl font-bold font-headline mt-6 mb-2">{paragraph.substring(4)}</h3>;
        }
        if (paragraph.startsWith('#### ')) {
            return <h4 key={index} className="text-xl font-bold font-headline mt-4 mb-2">{paragraph.substring(5)}</h4>;
        }
        if (paragraph.startsWith('- ')) {
            return <li key={index} className="ml-5 list-disc">{paragraph.substring(2)}</li>
        }
        return <p key={index} className="my-4 text-muted-foreground leading-relaxed">{paragraph}</p>;
      });
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
       <Button variant="ghost" onClick={() => router.back()} className="mb-4 pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      <article>
        <header className="mb-8">
          <Badge variant="outline" className="mb-2">{guide.petType}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">{guide.title}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{guide.summary}</p>
        </header>

        {image && (
            <Card className="relative h-64 md:h-96 w-full overflow-hidden rounded-xl shadow-lg mb-8">
                <Image
                    src={image.imageUrl}
                    alt={image.description}
                    fill
                    style={{ objectFit: 'cover' }}
                    data-ai-hint={image.imageHint}
                    priority
                />
            </Card>
        )}
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
            {renderContent(guide.content)}
        </div>
      </article>
    </div>
  );
}

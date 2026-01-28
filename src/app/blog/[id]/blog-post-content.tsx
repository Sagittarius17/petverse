
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User } from 'lucide-react';

// This interface needs to match the serialized data from the server
interface Blog {
  id: string;
  title: string;
  content: string;
  authorName: string;
  categoryName: string;
  createdAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
  imageUrl?: string;
}

export default function BlogPostContent({ post }: { post: Blog }) {
  const router = useRouter();

  let image;
  if (post.imageUrl) {
    image = {
      imageUrl: post.imageUrl,
      description: post.title,
      imageHint: post.categoryName.toLowerCase(),
    };
  } else {
    const imageId = `guide-${post.categoryName?.toLowerCase() || 'dog'}`;
    image = PlaceHolderImages.find(p => p.id === imageId) || PlaceHolderImages.find(p => p.id === 'guide-dog');
  }

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

  const createdAtDate = post.createdAt ? new Date(post.createdAt._seconds * 1000) : null;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 pl-0">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Blog
      </Button>
      <article>
        <header className="mb-8">
          <Badge variant="outline" className="mb-4">{post.categoryName}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">{post.title}</h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
             <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.authorName}</span>
             </div>
             <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{createdAtDate ? createdAtDate.toLocaleDateString() : 'N/A'}</span>
             </div>
          </div>
        </header>

        {image && (
          <Card className="relative h-64 md:h-96 w-full overflow-hidden rounded-xl shadow-lg mb-8">
            <Image
              src={image.imageUrl}
              alt={post.title}
              fill
              style={{ objectFit: 'cover' }}
              data-ai-hint={image.imageHint}
              priority
            />
          </Card>
        )}
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {renderContent(post.content)}
        </div>
      </article>
    </div>
  );
}

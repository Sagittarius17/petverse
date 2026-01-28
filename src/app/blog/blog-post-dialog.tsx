'use client';

import Image from 'next/image';
import { Timestamp } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Blog {
  id: string;
  title: string;
  content: string;
  authorName: string;
  categoryName: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  imageUrl?: string;
}

interface BlogPostDialogProps {
    post: Blog | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function BlogPostDialog({ post, isOpen, onClose }: BlogPostDialogProps) {
  if (!post) {
      return null;
  }
  
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

  const createdAtDate = post.createdAt ? post.createdAt.toDate() : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
            <ScrollArea className="max-h-[90vh]">
                <article>
                    {image && (
                        <Card className="relative h-64 md:h-96 w-full overflow-hidden rounded-b-none shadow-lg">
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
                    <div className="p-8">
                        <header className="mb-8">
                        <Badge variant="outline" className="mb-4">{post.categoryName}</Badge>
                        <DialogTitle className="text-4xl md:text-5xl font-bold font-headline tracking-tight">{post.title}</DialogTitle>
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
                        
                        <div className="prose prose-lg dark:prose-invert max-w-none">
                        {renderContent(post.content)}
                        </div>
                    </div>
                </article>
            </ScrollArea>
             <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground bg-black/50 text-white hover:bg-black/75">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
            </DialogClose>
        </DialogContent>
    </Dialog>
  );
}

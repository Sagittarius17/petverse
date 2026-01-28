'use client';

import Image from 'next/image';
import { Timestamp } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, X, Edit, History } from 'lucide-react';
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

  const formatDate = (timestamp?: Timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const showUpdatedAt = post.createdAt && post.updatedAt && post.updatedAt.toMillis() - post.createdAt.toMillis() > 60000;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
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
                    <div className="p-8 md:p-12">
                        <header className="mb-8">
                        <Badge variant="outline" className="mb-4">{post.categoryName}</Badge>
                        <DialogTitle className="text-4xl md:text-5xl font-bold font-headline tracking-tight">{post.title}</DialogTitle>
                        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{post.authorName}</span>
                            </div>
                        </div>
                        </header>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-12 mt-8">
                            <div className="prose prose-lg dark:prose-invert max-w-none md:col-span-3">
                                {renderContent(post.content)}
                            </div>
                            <aside className="md:col-span-1 mt-12 md:mt-0">
                                <h4 className="font-semibold text-lg mb-6 font-headline flex items-center gap-2">
                                    <History className="h-5 w-5 text-muted-foreground" />
                                    Post History
                                </h4>
                                <ol className="relative border-l border-border ml-2">
                                    {showUpdatedAt && (
                                    <li className="mb-8 ml-6">
                                        <span className="absolute flex items-center justify-center w-6 h-6 bg-secondary rounded-full -left-3 ring-8 ring-background">
                                            <Edit className="w-3 h-3 text-primary" />
                                        </span>
                                        <h3 className="font-semibold text-foreground">Last Updated</h3>
                                        <time className="block mb-2 text-sm font-normal leading-none text-muted-foreground">
                                            {formatDate(post.updatedAt)}
                                        </time>
                                    </li>
                                    )}
                                    {post.createdAt && (
                                    <li className="ml-6">
                                        <span className="absolute flex items-center justify-center w-6 h-6 bg-secondary rounded-full -left-3 ring-8 ring-background">
                                            <Calendar className="w-3 h-3 text-primary" />
                                        </span>
                                        <h3 className="font-semibold text-foreground">Published</h3>
                                        <time className="block mb-2 text-sm font-normal leading-none text-muted-foreground">
                                            {formatDate(post.createdAt)}
                                        </time>
                                    </li>
                                    )}
                                </ol>
                            </aside>
                        </div>
                    </div>
                </article>
            </ScrollArea>
        </DialogContent>
    </Dialog>
  );
}

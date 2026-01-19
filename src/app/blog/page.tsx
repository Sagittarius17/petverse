'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface Blog {
  id: string;
  title: string;
  content: string;
  authorName: string;
  categoryName: string;
  status: 'Draft' | 'Published';
  createdAt?: Timestamp;
}

function BlogCard({ post }: { post: Blog }) {
    const imageId = `guide-${post.categoryName?.toLowerCase() || 'dog'}`;
    const image = PlaceHolderImages.find(p => p.id === imageId) || PlaceHolderImages.find(p => p.id === 'guide-dog');

    return (
        <Link href={`/blog/${post.id}`} className="group">
             <Card className="flex h-full flex-col overflow-hidden transition-all group-hover:shadow-lg">
                {image && (
                    <CardHeader className="relative h-48 w-full p-0">
                        <Image
                            src={image.imageUrl}
                            alt={post.title}
                            fill
                            style={{ objectFit: 'cover' }}
                            data-ai-hint={image.imageHint}
                            className="transition-transform duration-300 group-hover:scale-105"
                        />
                    </CardHeader>
                )}
                <CardContent className="flex-grow p-6">
                    <Badge variant="outline" className="mb-2">{post.categoryName}</Badge>
                    <CardTitle className="mb-2 text-xl font-headline group-hover:text-primary transition-colors">{post.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                        {post.content.substring(0, 150)}...
                    </CardDescription>
                </CardContent>
                <CardFooter className="flex justify-between items-center text-xs text-muted-foreground p-6 pt-0">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{post.createdAt ? post.createdAt.toDate().toLocaleDateString() : 'N/A'}</span>
                        <span className='mx-1'>•</span>
                        <span>{post.authorName}</span>
                    </div>
                     <span className="text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Read More <ArrowRight className="inline h-4 w-4" />
                    </span>
                </CardFooter>
            </Card>
        </Link>
    );
}


export default function BlogPage() {
    const firestore = useFirestore();
    const blogsCollection = useMemoFirebase(
        () => collection(firestore, 'blogs'),
        [firestore]
    );

    // Remove orderBy to avoid needing a composite index which can cause permission errors if not set up.
    // Sorting will be done client-side.
    const publishedBlogsQuery = useMemoFirebase(
        () => blogsCollection 
            ? query(blogsCollection, where('status', '==', 'Published'))
            : null,
        [blogsCollection]
    );

    const { data: posts, isLoading } = useCollection<Blog>(publishedBlogsQuery);

    const sortedPosts = useMemo(() => {
        if (!posts) return [];
        return [...posts].sort((a, b) => {
            const timeA = a.createdAt?.toMillis() || 0;
            const timeB = b.createdAt?.toMillis() || 0;
            return timeB - timeA;
        });
    }, [posts]);

    return (
        <div className="container mx-auto px-4 py-6 md:py-8">
            <div className="text-center mb-8 md:mb-12">
                <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">PetVerse Blog</h1>
                <p className="mt-2 text-md md:text-lg text-muted-foreground">
                    Insights, stories, and advice from our team of pet experts.
                </p>
            </div>
            
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="p-0">
                                 <Skeleton className="h-48 w-full" />
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-4 w-1/2" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : sortedPosts && sortedPosts.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {sortedPosts.map(post => (
                       <BlogCard key={post.id} post={post} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <h2 className="text-2xl font-semibold">No Posts Yet</h2>
                    <p className="text-muted-foreground mt-2">Check back soon for new articles!</p>
                </div>
            )}
        </div>
    );
}

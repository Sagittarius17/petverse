
import { db } from '@/firebase/server';
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostContent from './blog-post-content';
import { Timestamp } from 'firebase-admin/firestore';

// Define the Blog interface to match the data structure from Firestore
interface Blog {
  id: string;
  title: string;
  content: string;
  authorName: string;
  categoryName: string;
  createdAt?: Timestamp;
}

// Server-side function to fetch a single blog post
async function getPost(id: string): Promise<Blog | null> {
  if (!db) {
    console.warn("Firestore Admin SDK not initialized. Server-side data fetching for blogs is disabled. Please check your server environment variables.");
    return null;
  }
  const docRef = db.collection('blogs').doc(id);
  const docSnap = await docRef.get();
  
  if (!docSnap.exists || docSnap.data()?.status !== 'Published') {
    return null;
  }
  
  const data = docSnap.data()!;
  
  // The Timestamp from the Admin SDK is compatible enough for serialization
  return {
    id: docSnap.id,
    title: data.title,
    content: data.content,
    authorName: data.authorName,
    categoryName: data.categoryName,
    createdAt: data.createdAt,
  } as Blog;
}

// Function to generate dynamic metadata for each blog post
export async function generateMetadata(
  { params }: { params: { id: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await getPost(params.id);

  if (!post) {
    return {
      title: 'Post Not Found | PetVerse',
    };
  }

  // Create a concise description for SEO and social sharing
  const description = post.content.substring(0, 160).replace(/\n/g, ' ').trim() + '...';

  return {
    title: `${post.title} | PetVerse Blog`,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      type: 'article',
      // Assuming a generic image for now, this could be dynamic in a future step
      images: ['/og-image.png'], 
    },
  };
}

// The main page component is now a Server Component
export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  // We pass the fetched data to a Client Component for rendering
  return <BlogPostContent post={JSON.parse(JSON.stringify(post))} />;
}

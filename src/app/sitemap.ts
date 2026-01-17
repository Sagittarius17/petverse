import { MetadataRoute } from 'next';
import { db } from '@/firebase/server';
import { allCareGuides } from '@/lib/data';
import { initialPetCategories } from '@/lib/initial-pet-data';

// IMPORTANT: Replace this with your actual production URL
const URL = 'https://petverse.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static pages
  const staticPages = [
    '/',
    '/about',
    '/adopt',
    '/be-a-partner',
    '/blog',
    '/care',
    '/contact',
    '/donate',
    '/faq',
    '/know-your-pet',
    '/login',
    '/lost-and-found',
    '/profile',
    '/register',
    '/shop',
    '/shop/products',
    '/shop/food',
    '/shop/toys',
    '/shop/accessories',
  ].map((route) => ({
    url: `${URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as 'monthly',
    priority: route === '/' ? 1 : 0.8,
  }));

  // 2. Dynamic blog posts from Firestore
  let blogPosts: MetadataRoute.Sitemap = [];
  try {
    const blogsSnapshot = await db.collection('blogs').where('status', '==', 'Published').get();
    blogPosts = blogsSnapshot.docs.map((doc) => ({
      url: `${URL}/blog/${doc.id}`,
      lastModified: doc.data().updatedAt?.toDate() || new Date(),
      changeFrequency: 'weekly' as 'weekly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error fetching blog posts for sitemap, returning empty. This might happen during initial setup.", error);
    // Return empty array on error so the build doesn't fail
  }
  

  // 3. Dynamic care guides from static data
  const careGuides = allCareGuides.map((guide) => ({
    url: `${URL}/care/${guide.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as 'monthly',
    priority: 0.6,
  }));

  // 4. Dynamic "Know Your Pet" pages from static data
  const knowYourPetPages = initialPetCategories.flatMap((category) =>
    category.species.map((species) => ({
      url: `${URL}/know-your-pet/${encodeURIComponent(category.category)}/${encodeURIComponent(species.name)}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as 'monthly',
      priority: 0.5,
    }))
  );

  return [...staticPages, ...blogPosts, ...careGuides, ...knowYourPetPages];
}

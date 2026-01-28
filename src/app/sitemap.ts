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
    '/privacy-policy',
    '/register',
    '/shop',
    '/shop/products',
    '/terms-of-service',
  ].map((route) => ({
    url: `${URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as 'monthly',
    priority: route === '/' ? 1 : 0.8,
  }));

  // Blog posts are now part of the main /blog page, so we don't need to list them individually.
  // This helps with SEO by not having dead links in the sitemap.

  // 2. Dynamic care guides from static data
  const careGuides = allCareGuides.map((guide) => ({
    url: `${URL}/care/${guide.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as 'monthly',
    priority: 0.6,
  }));

  // 3. Dynamic "Know Your Pet" pages from static data
  const knowYourPetPages = initialPetCategories.flatMap((category) =>
    category.species.map((species) => ({
      url: `${URL}/know-your-pet/${encodeURIComponent(category.category)}/${encodeURIComponent(species.name)}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as 'monthly',
      priority: 0.5,
    }))
  );

  return [...staticPages, ...careGuides, ...knowYourPetPages];
}

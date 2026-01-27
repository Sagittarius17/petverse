
import { type Metadata } from 'next';
import ClientHomePage from './client-home-page';

export const metadata: Metadata = {
  title: 'PetVerse - Adopt a Pet, Find a Friend',
  description: 'Your one-stop destination for pet adoption, expert pet care guides, and a community of animal lovers. Find your new best friend today!',
  openGraph: {
    title: 'PetVerse - Adopt a Pet, Find a Friend',
    description: 'Find your new best friend! Browse pets for adoption, get expert care advice, and join our community.',
    images: [{
      url: 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=1200&h=630', // A nice default OG image
      width: 1200,
      height: 630,
      alt: 'A friendly dog and cat together',
    }],
  },
};

export default function Home() {
  return <ClientHomePage />;
}

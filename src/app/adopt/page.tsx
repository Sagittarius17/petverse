
import { type Metadata } from 'next';
import AdoptPageClient from './adopt-page-client';

export const metadata: Metadata = {
  title: 'Adopt a Pet | PetVerse',
  description: 'Find your new best friend. Browse our listings of lovable dogs, cats, birds, and more, all waiting for a forever home.',
};

export default function AdoptPage() {
  return <AdoptPageClient />;
}

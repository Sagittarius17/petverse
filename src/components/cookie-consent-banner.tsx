'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';
import { cn } from '@/lib/utils';

const COOKIE_CONSENT_KEY = 'petverse-cookie-consent';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // This effect runs only on the client side
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (consent !== 'true') {
        // Add a small delay to prevent layout flash on page load
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error("Could not access localStorage for cookie consent:", error);
      // If localStorage is disabled, we can't store consent, so we don't show the banner.
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
      setIsVisible(false);
    } catch (error) {
      console.error("Could not set cookie consent in localStorage:", error);
      // Hide the banner even if localStorage fails, to not block the user.
      setIsVisible(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-[150] w-full animate-in slide-in-from-bottom-full duration-500'
      )}
    >
      <div className="bg-secondary/95 p-4 backdrop-blur-sm">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-primary flex-shrink-0" />
                <p className="text-sm text-secondary-foreground">
                We use digital "treats" (cookies) to make your PetVerse experience even better. You can learn more in our{' '}
                <Link href="/privacy-policy" className="font-semibold underline hover:text-primary">
                    Privacy Policy
                </Link>
                .
                </p>
            </div>
            <Button size="sm" onClick={handleAccept}>
                Pawsitively Accept
            </Button>
        </div>
      </div>
    </div>
  );
}

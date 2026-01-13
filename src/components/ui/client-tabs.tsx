
"use client"

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { ComponentProps } from 'react';

// A client-only wrapper around the Tabs component to prevent hydration errors.
// Radix UI's Tabs can generate unique IDs that cause a mismatch between server and client.
// By deferring rendering until the component has mounted on the client, we ensure IDs are consistent.

export function ClientTabs(props: ComponentProps<typeof Tabs>) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // On the server and during the initial client render, return null or a placeholder.
    // Returning null is often sufficient and avoids layout shifts.
    return null; 
  }

  return <Tabs {...props} />;
}

export { TabsList, TabsTrigger, TabsContent };

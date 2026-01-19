
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdoptionHeader from '@/components/adoption-header';
import AdoptionFooter from '@/components/adoption-footer';
import ShopHeader from '@/components/shop-header';
import ShopFooter from '@/components/shop-footer';
import { maintenanceStore } from '@/lib/maintenance-store';
import MaintenancePage from './maintenance-page';
import AdoptionNotifier from './adoption-notifier';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');
  const isShopPage = pathname.startsWith('/shop');

  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [maintenanceEndTime, setMaintenanceEndTime] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    // We can now safely access localStorage through our store.
    const state = maintenanceStore.getState();
    setIsMaintenanceMode(state.isMaintenanceMode);
    setEstimatedTime(state.estimatedTime);
    setMaintenanceEndTime(state.maintenanceEndTime);
    setIsClient(true);

    const unsubscribe = maintenanceStore.subscribe(
      (currentState) => {
        setIsMaintenanceMode(currentState.isMaintenanceMode);
        setEstimatedTime(currentState.estimatedTime);
        setMaintenanceEndTime(currentState.maintenanceEndTime);
      }
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isClient || !isMaintenanceMode || !maintenanceEndTime) {
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(maintenanceEndTime).getTime();
      if (now >= end) {
        maintenanceStore.setState({ isMaintenanceMode: false, maintenanceEndTime: null, automaticToggleTime: 'manual' });
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isClient, isMaintenanceMode, maintenanceEndTime]);

  // On the server, and during the initial client render before the useEffect runs,
  // isClient will be false. We must render the default layout to match the server.
  if (!isClient) {
    if (isAdminPage) {
        return <main className="flex-grow">{children}</main>;
    }
    return (
        <div className="flex min-h-screen flex-col">
          {isShopPage ? <ShopHeader /> : <AdoptionHeader />}
          <main className="flex-grow">{children}</main>
          {isShopPage ? <ShopFooter /> : <AdoptionFooter />}
        </div>
    );
  }

  // After mounting on the client, we can now safely render based on the maintenance state.
  if (isMaintenanceMode && !isAdminPage) {
    return <MaintenancePage estimatedTime={estimatedTime} maintenanceEndTime={maintenanceEndTime} />;
  }

  if (isAdminPage) {
    return <main className="flex-grow">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {isShopPage ? <ShopHeader /> : <AdoptionHeader />}
      <AdoptionNotifier />
      <main className="flex-grow">{children}</main>
      {isShopPage ? <ShopFooter /> : <AdoptionFooter />}
    </div>
  );
}

    
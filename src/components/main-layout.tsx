
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
import MaintenanceBanner from './maintenance-banner';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');
  const isShopPage = pathname.startsWith('/shop');

  const [maintenanceState, setMaintenanceState] = useState(maintenanceStore.getState());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    setIsClient(true);
    
    // On mount, immediately sync with the possibly-hydrated store state
    setMaintenanceState(maintenanceStore.getState());
    
    // Then subscribe for subsequent changes
    const unsubscribe = maintenanceStore.subscribe(setMaintenanceState);
    
    return unsubscribe;
  }, []);

  // On the server, and during initial client render, render a non-maintenance layout
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

  // From here on, we are on the client and can use the real maintenance state
  const { isMaintenanceMode, maintenanceStartTime, maintenanceEndTime, bannerMessage } = maintenanceState;
  const now = new Date().getTime();
  const startTime = maintenanceStartTime ? new Date(maintenanceStartTime).getTime() : null;

  const showBanner = !isMaintenanceMode && startTime && now < startTime;

  if (isMaintenanceMode && !isAdminPage) {
    return <MaintenancePage message={bannerMessage} maintenanceEndTime={maintenanceEndTime} />;
  }

  if (isAdminPage) {
    return <main className="flex-grow">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {isShopPage ? <ShopHeader /> : <AdoptionHeader />}
      {showBanner && maintenanceStartTime && (
        <MaintenanceBanner startTime={maintenanceStartTime} message={bannerMessage} />
      )}
      <AdoptionNotifier />
      <main className="flex-grow">{children}</main>
      {isShopPage ? <ShopFooter /> : <AdoptionFooter />}
    </div>
  );
}

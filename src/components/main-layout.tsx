
'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import AdoptionHeader from '@/components/adoption-header';
import AdoptionFooter from '@/components/adoption-footer';
import ShopHeader from '@/components/shop-header';
import ShopFooter from '@/components/shop-footer';
import { maintenanceStore } from '@/lib/maintenance-store';
import MaintenancePage from './maintenance-page';
import AdoptionNotifier from './adoption-notifier';
import MaintenanceBanner from './maintenance-banner';

const getServerSnapshot = () => {
  return maintenanceStore.getState();
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');
  const isShopPage = pathname.startsWith('/shop');

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Use useSyncExternalStore to safely subscribe to the external store.
  // This is the idiomatic React way to handle external state and prevent hydration mismatches.
  const maintenanceState = useSyncExternalStore(
    maintenanceStore.subscribe,
    () => maintenanceStore.getState(),
    getServerSnapshot
  );

  // On the server, and during the initial client render before hydration is guaranteed,
  // we render the basic layout to avoid mismatches.
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

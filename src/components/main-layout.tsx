
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdoptionHeader from '@/components/adoption-header';
import AdoptionFooter from '@/components/adoption-footer';
import ShopHeader from '@/components/shop-header';
import ShopFooter from '@/components/shop-footer';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import MaintenancePage from './maintenance-page';
import AdoptionNotifier from './adoption-notifier';
import MaintenanceBanner from './maintenance-banner';

interface MaintenanceSettings {
  isMaintenanceMode: boolean;
  bannerMessage: string;
  maintenanceStartTime: string | null;
  maintenanceEndTime: string | null;
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');
  const isShopPage = pathname.startsWith('/shop');

  const firestore = useFirestore();
  
  const settingsDocRef = useMemoFirebase(() => {
    return firestore ? doc(firestore, 'settings', 'maintenance') : null;
  }, [firestore]);
  
  const { data: maintenanceSettings, isLoading } = useDoc<MaintenanceSettings>(settingsDocRef);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // This effect runs on all clients and acts as the "cron job" to update the global state.
  useEffect(() => {
    if (!settingsDocRef || !maintenanceSettings) return;

    const now = new Date();
    const startTime = maintenanceSettings.maintenanceStartTime ? new Date(maintenanceSettings.maintenanceStartTime) : null;
    const endTime = maintenanceSettings.maintenanceEndTime ? new Date(maintenanceSettings.maintenanceEndTime) : null;
    
    // If it's not currently in maintenance mode, but the start time has passed
    if (!maintenanceSettings.isMaintenanceMode && startTime && now >= startTime) {
        setDoc(settingsDocRef, { isMaintenanceMode: true }, { merge: true });
    }

    // If it IS in maintenance mode, but the end time has passed
    if (maintenanceSettings.isMaintenanceMode && endTime && now >= endTime) {
        setDoc(settingsDocRef, {
            isMaintenanceMode: false,
            maintenanceStartTime: null,
            maintenanceEndTime: null,
        }, { merge: true });
    }
  }, [maintenanceSettings, settingsDocRef]);
  
  const now = new Date();
  
  const isCurrentlyInMaintenance = maintenanceSettings?.isMaintenanceMode || 
    (maintenanceSettings?.maintenanceStartTime ? new Date(maintenanceSettings.maintenanceStartTime) <= now : false);

  const showBanner = !isCurrentlyInMaintenance && 
    maintenanceSettings?.maintenanceStartTime && 
    new Date(maintenanceSettings.maintenanceStartTime) > now;
    
  if (!isClient || isLoading) {
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
  
  if (isCurrentlyInMaintenance && !isAdminPage) {
    return <MaintenancePage message={maintenanceSettings?.bannerMessage} maintenanceEndTime={maintenanceSettings?.maintenanceEndTime} />;
  }

  if (isAdminPage) {
    return <main className="flex-grow">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {isShopPage ? <ShopHeader /> : <AdoptionHeader />}
      {showBanner && maintenanceSettings?.maintenanceStartTime && (
        <MaintenanceBanner startTime={maintenanceSettings.maintenanceStartTime} message={maintenanceSettings.bannerMessage} />
      )}
      <AdoptionNotifier />
      <main className="flex-grow">{children}</main>
      {isShopPage ? <ShopFooter /> : <AdoptionFooter />}
    </div>
  );
}

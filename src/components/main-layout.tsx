
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { maintenanceStore } from '@/lib/maintenance-store';
import MaintenancePage from './maintenance-page';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  const [isMaintenanceMode, setIsMaintenanceMode] = useState(maintenanceStore.getState().isMaintenanceMode);
  const [estimatedTime, setEstimatedTime] = useState(maintenanceStore.getState().estimatedTime);

  useEffect(() => {
    const unsubscribe = maintenanceStore.subscribe(
      (state) => {
        setIsMaintenanceMode(state.isMaintenanceMode);
        setEstimatedTime(state.estimatedTime);
      }
    );
    return unsubscribe;
  }, []);

  if (isMaintenanceMode && !isAdminPage) {
    return <MaintenancePage estimatedTime={estimatedTime} />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {!isAdminPage && <Header />}
      <main className="flex-grow">{children}</main>
      {!isAdminPage && <Footer />}
    </div>
  );
}


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

  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    // We can now safely access localStorage through our store.
    const state = maintenanceStore.getState();
    setIsMaintenanceMode(state.isMaintenanceMode);
    setEstimatedTime(state.estimatedTime);
    setIsClient(true);

    const unsubscribe = maintenanceStore.subscribe(
      (currentState) => {
        setIsMaintenanceMode(currentState.isMaintenanceMode);
        setEstimatedTime(currentState.estimatedTime);
      }
    );
    return unsubscribe;
  }, []);

  // On the server, and during the initial client render before the useEffect runs,
  // isClient will be false. We must render the default layout to match the server.
  if (!isClient) {
    return (
        <div className="flex min-h-screen flex-col">
          {!isAdminPage && <Header />}
          <main className="flex-grow">{children}</main>
          {!isAdminPage && <Footer />}
        </div>
    );
  }

  // After mounting on the client, we can now safely render based on the maintenance state.
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

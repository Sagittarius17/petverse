'use client';

import { useEffect } from 'react';
import { maintenanceStore } from '@/lib/maintenance-store';

export default function MaintenanceManager() {
  useEffect(() => {
    // This interval is responsible for automatically toggling maintenance mode based on schedule.
    const interval = setInterval(() => {
      const { maintenanceStartTime, maintenanceEndTime, isMaintenanceMode, setState } = maintenanceStore.getState();
      const now = new Date().getTime();

      // Check if we need to START maintenance
      if (maintenanceStartTime && !isMaintenanceMode) {
        const start = new Date(maintenanceStartTime).getTime();
        if (now >= start) {
          setState({ isMaintenanceMode: true });
        }
      }

      // Check if we need to END maintenance
      if (maintenanceEndTime && isMaintenanceMode) {
        const end = new Date(maintenanceEndTime).getTime();
        if (now >= end) {
          setState({
            isMaintenanceMode: false,
            maintenanceStartTime: null,
            maintenanceEndTime: null,
          });
        }
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, []); // Empty dependency array ensures this runs only once when the app loads.

  return null; // This component renders nothing.
}

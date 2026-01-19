
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface MaintenanceState {
  isMaintenanceMode: boolean;
  bannerMessage: string;
  maintenanceStartTime: string | null; // When maintenance is scheduled to START
  maintenanceEndTime: string | null;   // When maintenance is scheduled to END
  setState: (newState: Partial<MaintenanceState>) => void;
}

export const maintenanceStore = create<MaintenanceState>()(
  persist(
    (set) => ({
      isMaintenanceMode: false,
      bannerMessage: 'We are performing scheduled maintenance.',
      maintenanceStartTime: null,
      maintenanceEndTime: null,
      setState: (newState) => set(newState),
    }),
    {
      name: 'maintenance-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // use localStorage
    }
  )
);

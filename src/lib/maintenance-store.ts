
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface MaintenanceState {
  isMaintenanceMode: boolean;
  estimatedTime: string;
  setState: (newState: Partial<MaintenanceState>) => void;
}

export const maintenanceStore = create<MaintenanceState>()(
  persist(
    (set) => ({
      isMaintenanceMode: false,
      estimatedTime: 'a few minutes',
      setState: (newState) => set(newState),
    }),
    {
      name: 'maintenance-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // use localStorage
    }
  )
);

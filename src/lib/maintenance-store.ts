
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface MaintenanceState {
  isMaintenanceMode: boolean;
  estimatedTime: string;
  durationHours: number;
  durationMinutes: number;
  maintenanceEndTime: string | null; // ISO string for when to turn off
  setState: (newState: Partial<MaintenanceState>) => void;
}

export const maintenanceStore = create<MaintenanceState>()(
  persist(
    (set) => ({
      isMaintenanceMode: false,
      estimatedTime: 'a few minutes',
      durationHours: 0,
      durationMinutes: 0,
      maintenanceEndTime: null,
      setState: (newState) => set(newState),
    }),
    {
      name: 'maintenance-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // use localStorage
    }
  )
);

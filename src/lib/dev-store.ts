'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface DevState {
  // Session counts
  reads: number;
  writes: number;
  // Persistent total counts
  totalReads: number;
  totalWrites: number;
  isObserverEnabled: boolean;
  // Actions
  incrementReads: () => void;
  incrementWrites: () => void;
  resetCounts: () => void;
  setIsObserverEnabled: (enabled: boolean) => void;
}

export const useDevStore = create<DevState>()(
  persist(
    (set) => ({
      reads: 0,
      writes: 0,
      totalReads: 0,
      totalWrites: 0,
      isObserverEnabled: true, // Default to true for dev environments
      incrementReads: () =>
        set((state) => ({
          reads: state.reads + 1,
          totalReads: state.totalReads + 1,
        })),
      incrementWrites: () =>
        set((state) => ({
          writes: state.writes + 1,
          totalWrites: state.totalWrites + 1,
        })),
      resetCounts: () => set({ reads: 0, writes: 0 }), // Only resets session counts
      setIsObserverEnabled: (enabled: boolean) => set({ isObserverEnabled: enabled }),
    }),
    {
      name: 'dev-settings-storage', // name of the item in storage
      storage: createJSONStorage(() => localStorage), // use localStorage
      // Persist totals and the enabled flag
      partialize: (state) => ({
        totalReads: state.totalReads,
        totalWrites: state.totalWrites,
        isObserverEnabled: state.isObserverEnabled,
      }),
    }
  )
);

// When the app first loads, reset the session counts to 0.
// The persisted total counts will be rehydrated from localStorage automatically.
useDevStore.getState().resetCounts();

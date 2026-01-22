'use client';

import { create } from 'zustand';

interface DevState {
  reads: number;
  writes: number;
  incrementReads: () => void;
  incrementWrites: () => void;
  resetCounts: () => void;
}

export const useDevStore = create<DevState>((set) => ({
  reads: 0,
  writes: 0,
  incrementReads: () => set((state) => ({ reads: state.reads + 1 })),
  incrementWrites: () => set((state) => ({ writes: state.writes + 1 })),
  resetCounts: () => set({ reads: 0, writes: 0 }),
}));

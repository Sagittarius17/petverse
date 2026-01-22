'use client';

import { create } from 'zustand';

interface ChatState {
  isOpen: boolean;
  activeConversationId: string | null;
  currentlyPlayingAudio: HTMLAudioElement | null;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  setActiveConversationId: (id: string | null) => void;
  setCurrentlyPlayingAudio: (audio: HTMLAudioElement | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  activeConversationId: null,
  currentlyPlayingAudio: null,
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false, activeConversationId: null }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setCurrentlyPlayingAudio: (audio) => {
    const current = get().currentlyPlayingAudio;
    if (current && current !== audio) {
      current.pause();
    }
    set({ currentlyPlayingAudio: audio });
  },
}));

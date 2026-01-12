'use client';

import { create } from 'zustand';

interface ChatState {
  isOpen: boolean;
  activeConversationId: string | null;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  setActiveConversationId: (id: string | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  activeConversationId: null,
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false, activeConversationId: null }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  setActiveConversationId: (id) => set({ activeConversationId: id }),
}));

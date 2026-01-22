'use client';

import { create } from 'zustand';

// A minimal version for the store to hold reply context
export interface ReplyMessageInfo {
  id: string;
  senderId: string;
  displayName: string;
  text?: string;
  mediaType?: 'image' | 'audio';
}

interface ChatState {
  isOpen: boolean;
  activeConversationId: string | null;
  currentlyPlayingAudio: HTMLAudioElement | null;
  replyingTo: ReplyMessageInfo | null;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  setActiveConversationId: (id: string | null) => void;
  setCurrentlyPlayingAudio: (audio: HTMLAudioElement | null) => void;
  setReplyingTo: (message: ReplyMessageInfo | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  activeConversationId: null,
  currentlyPlayingAudio: null,
  replyingTo: null,
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false, activeConversationId: null }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  setActiveConversationId: (id) => {
    // When changing conversation, clear any pending reply
    set({ activeConversationId: id, replyingTo: null });
  },
  setCurrentlyPlayingAudio: (audio) => {
    const current = get().currentlyPlayingAudio;
    if (current && current !== audio) {
      current.pause();
    }
    set({ currentlyPlayingAudio: audio });
  },
  setReplyingTo: (message) => set({ replyingTo: message }),
}));

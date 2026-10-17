"use client";

import { create } from "zustand";

interface Overlay {
  title: string;
  description?: string;
}

interface OverlayState {
  overlay: Overlay | null;
  leaving: boolean;
  showOverlay: (title: string, description?: string) => void;
  hideOverlay: () => void;
}

const FADE_OUT = 220;

let hideTimer: ReturnType<typeof setTimeout> | undefined;

export const useOverlayStore = create<OverlayState>()((set, get) => ({
  overlay: null,
  leaving: false,
  showOverlay: (title, description) => {
    clearTimeout(hideTimer);
    set({ overlay: { title, description }, leaving: false });
  },
  hideOverlay: () => {
    if (!get().overlay || get().leaving) {
      return;
    }

    set({ leaving: true });
    hideTimer = setTimeout(() => set({ overlay: null, leaving: false }), FADE_OUT);
  },
}));

export const showOverlay = (title: string, description?: string) => useOverlayStore.getState().showOverlay(title, description);

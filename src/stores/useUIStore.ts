/**
 * Pandoos Music — UI Store (Zustand)
 *
 * Global UI state: panda state, active modals, theme overrides.
 * Intentionally lightweight — keeps audio state in PlayerContext.
 */

import { create } from 'zustand';
import type { PandaState } from '../types/index';

interface UIStore {
  // Panda companion state
  pandaState: PandaState;
  pandaMessage: string | null;
  setPandaState: (state: PandaState, message?: string) => void;

  // Modals / overlays
  showBadgeCelebration: boolean;
  setShowBadgeCelebration: (show: boolean) => void;

  // Sidebar (mobile)
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Search overlay (mobile quick access)
  searchOverlayOpen: boolean;
  setSearchOverlayOpen: (open: boolean) => void;

  // Onboarding (first time user)
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;

  // Mood override (user manually sets mood)
  manualMoodOverride: string | null;
  setManualMoodOverride: (mood: string | null) => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  pandaState: 'idle',
  pandaMessage: null,
  setPandaState: (state, message) => set({
    pandaState: state,
    pandaMessage: message ?? null,
  }),

  showBadgeCelebration: false,
  setShowBadgeCelebration: (show) => set({ showBadgeCelebration: show }),

  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  searchOverlayOpen: false,
  setSearchOverlayOpen: (open) => set({ searchOverlayOpen: open }),

  hasCompletedOnboarding: Boolean(localStorage.getItem('pandoos_onboarded')),
  completeOnboarding: () => {
    localStorage.setItem('pandoos_onboarded', '1');
    set({ hasCompletedOnboarding: true });
  },

  manualMoodOverride: null,
  setManualMoodOverride: (mood) => set({ manualMoodOverride: mood }),
}));

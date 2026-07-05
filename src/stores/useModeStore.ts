import { create } from 'zustand';

export type Mode = 'fan' | 'band';

interface ModeState {
  mode: Mode;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
}

export const useModeStore = create<ModeState>((set) => ({
  mode: 'fan',
  setMode: (mode) => set({ mode }),
  toggleMode: () =>
    set((state) => ({ mode: state.mode === 'fan' ? 'band' : 'fan' })),
}));

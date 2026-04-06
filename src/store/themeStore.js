import { create } from 'zustand';
import { PALETTES } from '../utils/theme';

export const useThemeStore = create((set) => ({
  activeThemeKey: 'sems',
  theme: PALETTES['sems'],
  setTheme: (themeKey) => {
    if (PALETTES[themeKey]) {
      set({ activeThemeKey: themeKey, theme: PALETTES[themeKey] });
    }
  }
}));

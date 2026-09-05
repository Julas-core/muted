import { create } from 'zustand';
import { ColorScheme, lightTheme, darkTheme } from '../constants/theme';

interface ThemeState {
  isDark: boolean;
  colors: ColorScheme;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false, // Default is Electric Blue Light theme
  colors: lightTheme,
  toggleTheme: () =>
    set((state) => {
      const nextDark = !state.isDark;
      return {
        isDark: nextDark,
        colors: nextDark ? darkTheme : lightTheme,
      };
    }),
  setTheme: (isDark: boolean) =>
    set({
      isDark,
      colors: isDark ? darkTheme : lightTheme,
    }),
}));

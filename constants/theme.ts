export interface ColorScheme {
  isDark: boolean;
  backgroundGradient: [string, string, ...string[]];
  surface: string;
  surfaceGlass: string;
  cardBg: string;
  primary: string;
  primaryGlow: string;
  secondary: string;
  text: string;
  textMuted: string;
  border: string;
  pillBg: string;
  pillActiveBg: string;
  pillActiveText: string;
  tabBarBg: string;
  accent: string;
  heartActive: string;
}

export const lightTheme: ColorScheme = {
  isDark: false,
  backgroundGradient: ['#3A8DFF', '#73AEFF', '#D4E7FF'],
  surface: '#FFFFFF',
  surfaceGlass: 'rgba(255, 255, 255, 0.75)',
  cardBg: 'rgba(255, 255, 255, 0.9)',
  primary: '#0D5DFE',
  primaryGlow: 'rgba(13, 93, 254, 0.35)',
  secondary: '#1E293B',
  text: '#0F172A',
  textMuted: '#64748B',
  border: 'rgba(255, 255, 255, 0.3)',
  pillBg: 'rgba(0, 0, 0, 0.5)',
  pillActiveBg: '#0D5DFE',
  pillActiveText: '#FFFFFF',
  tabBarBg: 'rgba(255, 255, 255, 0.7)',
  accent: '#0D5DFE',
  heartActive: '#FF334B',
};

export const darkTheme: ColorScheme = {
  isDark: true,
  backgroundGradient: ['#0A0A0A', '#1F0407', '#3A080E'],
  surface: '#121212',
  surfaceGlass: 'rgba(24, 24, 27, 0.75)',
  cardBg: 'rgba(28, 28, 30, 0.9)',
  primary: '#E50914',
  primaryGlow: 'rgba(229, 9, 20, 0.4)',
  secondary: '#FAFAFA',
  text: '#F8FAFC',
  textMuted: '#A1A1AA',
  border: 'rgba(255, 255, 255, 0.1)',
  pillBg: 'rgba(255, 255, 255, 0.15)',
  pillActiveBg: '#E50914',
  pillActiveText: '#FFFFFF',
  tabBarBg: 'rgba(24, 24, 27, 0.75)',
  accent: '#E50914',
  heartActive: '#E50914',
};

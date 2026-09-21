import { create } from 'zustand';
import { Wallpaper, SEED_WALLPAPERS } from '../constants/seedWallpapers';

interface WallpaperState {
  wallpapers: Wallpaper[];
  selectedTastes: string[];
  favorites: string[];
  downloads: string[];
  searchQuery: string;
  activeExploreTag: string;
  categoryWeights: Record<string, number>;

  // Actions
  setTastes: (tastes: string[]) => void;
  toggleFavorite: (id: string) => boolean;
  recordDownload: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setActiveExploreTag: (tag: string) => void;
  addWallpaper: (wallpaper: Wallpaper) => void;
  getCuratedFeed: () => Wallpaper[];
}

export const useWallpaperStore = create<WallpaperState>((set, get) => ({
  wallpapers: SEED_WALLPAPERS,
  selectedTastes: ['anime-manga', 'automotive', 'dark-minimalist-oled'],
  favorites: ['w1', 'w3', 'w6'],
  downloads: ['w7', 'w12'],
  searchQuery: '',
  activeExploreTag: 'All',
  categoryWeights: {
    'anime & manga': 5,
    automotive: 4,
    'dark minimalist & oled': 3,
  },

  setTastes: (tastes: string[]) =>
    set((state) => {
      const newWeights = { ...state.categoryWeights };
      tastes.forEach((t) => {
        const normalizedTaste = t.replace(/-/g, ' ').toLowerCase();
        newWeights[normalizedTaste] = (newWeights[normalizedTaste] || 0) + 5;
      });
      return { selectedTastes: tastes, categoryWeights: newWeights };
    }),

  toggleFavorite: (id: string) => {
    const { favorites, wallpapers, categoryWeights } = get();
    const isFav = favorites.includes(id);
    const wallpaper = wallpapers.find((w) => w.id === id);

    let updatedFavorites: string[];
    const updatedWeights = { ...categoryWeights };

    if (isFav) {
      updatedFavorites = favorites.filter((favId) => favId !== id);
    } else {
      updatedFavorites = [...favorites, id];
      if (wallpaper) {
        const cat = wallpaper.category.toLowerCase();
        updatedWeights[cat] = (updatedWeights[cat] || 0) + 3; // adaptive boost
      }
    }

    set({ favorites: updatedFavorites, categoryWeights: updatedWeights });
    return !isFav;
  },

  recordDownload: (id: string) => {
    const { downloads, wallpapers, categoryWeights } = get();
    const wallpaper = wallpapers.find((w) => w.id === id);
    const updatedWeights = { ...categoryWeights };

    if (wallpaper) {
      const cat = wallpaper.category.toLowerCase();
      updatedWeights[cat] = (updatedWeights[cat] || 0) + 6; // strong adaptive signal
    }

    const updatedDownloads = downloads.includes(id) ? downloads : [...downloads, id];
    set({ downloads: updatedDownloads, categoryWeights: updatedWeights });
  },

  setSearchQuery: (searchQuery: string) => set({ searchQuery }),

  setActiveExploreTag: (activeExploreTag: string) => set({ activeExploreTag }),

  addWallpaper: (newWallpaper: Wallpaper) =>
    set((state) => ({ wallpapers: [newWallpaper, ...state.wallpapers] })),

  // Adaptive recommendation algorithm
  getCuratedFeed: () => {
    const { wallpapers, categoryWeights } = get();
    return [...wallpapers].sort((a, b) => {
      const weightA = categoryWeights[a.category.toLowerCase()] || 0;
      const weightB = categoryWeights[b.category.toLowerCase()] || 0;
      return weightB - weightA;
    });
  },
}));

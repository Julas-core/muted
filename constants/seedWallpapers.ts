import { LOCAL_WALLPAPERS } from './localWallpapers';

export interface Wallpaper {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  url: string | number;
  category: string;
  tags: string[];
  likesCount: number;
  downloadCount: number;
  heightRatio: number;
}

const TITLES = [
  'Cloud Ape Aesthete',
  'Doberman Halftone',
  'Crimson Tiger Fury',
  'God Did Atmosphere',
  'Off Canvas Typography',
  'Translucent Glass Dice',
  'Midnight Skyline Drift',
  'Oakley Visor Concept',
  'Blood Moon Lunar Sequence',
  'The Dark Knight Graphic',
  'F1 Speed Halftone',
  'Manga Hero Awakening',
];

const AUTHORS = ['NigoLab', 'Kravitz Noir', 'Irezumi Art', 'VibeVault', 'Virgil Archive', 'RenderBoy', 'TokyoSpeed', 'Futurism Lab'];
const AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80';

export const SEED_WALLPAPERS: Wallpaper[] = LOCAL_WALLPAPERS.map(({ source, genre }, index) => {
  const category = genre;
  const title = TITLES[index] || `Muted Collection ${index + 1}`;
  const author = AUTHORS[index % AUTHORS.length];

  return {
    id: `w${index + 1}`,
    title,
    author,
    authorAvatar: AVATAR,
    url: source,
    category,
    tags: [category, 'Muted', index % 2 === 0 ? 'Curated' : 'New'],
    likesCount: 120 + index * 37,
    downloadCount: 48 + index * 11,
    heightRatio: index % 9 === 0 ? 1.76 : 1.68,
  };
});

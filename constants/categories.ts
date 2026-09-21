export interface Category {
  id: string;
  name: string;
  image: number;
  badge?: string;
}

export const CATEGORIES: Category[] = [
  { id: 'anime-manga', name: 'Anime & Manga', image: require('../assets/wallpapers/generes/Anime_and_Manga/anime_and_manga_022.jpg') },
  { id: 'automotive', name: 'Automotive', image: require('../assets/wallpapers/generes/Automotive/automotive_004.jpg') },
  { id: 'comics-superheroes', name: 'Comics & Superheroes', image: require('../assets/wallpapers/generes/Comics_and_Superheroes/comics_and_superheroes_002.jpg') },
  { id: 'dark-minimalist-oled', name: 'Dark Minimalist & OLED', image: require('../assets/wallpapers/generes/Dark_Minimalist_and_OLED/dark_minimalist_and_oled_006.jpg') },
  { id: 'moody-landscapes-nature', name: 'Moody Landscapes & Nature', image: require('../assets/wallpapers/generes/Moody_Landscapes_and_Nature/moody_landscapes_and_nature_031.jpg') },
  { id: 'spiritual-conceptual', name: 'Spiritual & Conceptual', image: require('../assets/wallpapers/generes/Spiritual_and_Conceptual/spiritual_and_conceptual_073.jpg') },
  { id: 'streetwear-urban-culture', name: 'Streetwear & Urban Culture', image: require('../assets/wallpapers/generes/Streetwear_and_Urban_Culture/streetwear_and_urban_culture_025.jpg') },
  { id: 'y2k-cyber-graphics', name: 'Y2K & Cyber Graphics', image: require('../assets/wallpapers/generes/Y2K_and_Cyber_Graphics/y2k_and_cyber_graphics_001.jpg') },
];

export const EXPLORE_TAGS = [
  'All',
  'Anime & Manga',
  'Automotive',
  'Comics & Superheroes',
  'Dark Minimalist & OLED',
  'Moody Landscapes & Nature',
  'Spiritual & Conceptual',
  'Streetwear & Urban Culture',
  'Y2K & Cyber Graphics',
];

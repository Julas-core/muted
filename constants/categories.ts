export interface Category {
  id: string;
  name: string;
  image: string;
  badge?: string;
}

export const CATEGORIES: Category[] = [
  { id: 'chess', name: 'Chess', image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&q=80' },
  { id: 'minimal', name: 'Minimal', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80' },
  { id: 'cars', name: 'Cars', image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&q=80' },
  { id: 'dark', name: 'Dark', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&q=80' },
  { id: 'abstract', name: 'Abstract', image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&q=80' },
  { id: 'nature', name: 'Nature', image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&q=80' },
  { id: 'calligraphy', name: 'Calligraphy', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&q=80' },
  { id: 'comic', name: 'Comic', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80' },
  { id: 'animals', name: 'Animals', image: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=600&q=80' },
  { id: 'anime', name: 'Anime', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80' },
  { id: 'illustration', name: 'Illustration', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80' },
  { id: 'sport', name: 'Sport', image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80' },
  { id: 'cartoon', name: 'Cartoon', image: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=600&q=80' },
  { id: 'money', name: 'Money', image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&q=80' },
  { id: 'space', name: 'Space', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80' },
];

export const EXPLORE_TAGS = ['All', 'Minimal', 'Nature', 'Abstract', 'Anime', 'Cars', 'Dark', 'Space', 'Comic'];

import { Product, User } from '@prisma/client';

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
  product: Product & {
    images: Array<{ url: string; altText?: string }>;
    category: { name: string; slug: string };
  };
  user: User;
}

export interface FavoritesState {
  favorites: string[]; // Array of product IDs
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addToFavorites: (productId: string) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
  loadFavorites: () => Promise<void>;
  isFavorite: (productId: string) => boolean;
}
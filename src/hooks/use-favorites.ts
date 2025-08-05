import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useFavoritesStore } from '@/stores/favorites-store';

export function useFavorites() {
  const { data: session } = useSession();
  const favorites = useFavoritesStore();

  // Load favorites on mount
  useEffect(() => {
    favorites.loadFavorites();
  }, []);

  // Sync with server when user logs in
  useEffect(() => {
    if (session?.user) {
      // TODO: Sync local favorites with server
      favorites.loadFavorites();
    }
  }, [session?.user]);

  return {
    favorites: favorites.favorites,
    isLoading: favorites.isLoading,
    error: favorites.error,
    
    // Actions
    addToFavorites: favorites.addToFavorites,
    removeFromFavorites: favorites.removeFromFavorites,
    toggleFavorite: favorites.toggleFavorite,
    isFavorite: favorites.isFavorite,
    
    // Computed
    favoriteCount: favorites.favorites.length,
  };
}
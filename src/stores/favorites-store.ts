import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FavoritesState } from '@/types/favorites';

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      isLoading: false,
      error: null,

      addToFavorites: async (productId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // For guest users, just store locally
          const currentFavorites = get().favorites;
          if (!currentFavorites.includes(productId)) {
            set({ 
              favorites: [...currentFavorites, productId],
              isLoading: false 
            });
          } else {
            set({ isLoading: false });
          }

          // TODO: If user is logged in, sync with server
          // await FavoritesAPI.addToFavorites(productId);
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to add to favorites' 
          });
        }
      },

      removeFromFavorites: async (productId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentFavorites = get().favorites;
          set({ 
            favorites: currentFavorites.filter(id => id !== productId),
            isLoading: false 
          });

          // TODO: If user is logged in, sync with server
          // await FavoritesAPI.removeFromFavorites(productId);
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to remove from favorites' 
          });
        }
      },

      toggleFavorite: async (productId: string) => {
        const isFav = get().isFavorite(productId);
        if (isFav) {
          await get().removeFromFavorites(productId);
        } else {
          await get().addToFavorites(productId);
        }
      },

      loadFavorites: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // TODO: If user is logged in, load from server
          // const favorites = await FavoritesAPI.getFavorites();
          // set({ favorites: favorites.map(f => f.productId), isLoading: false });
          
          // For now, just use local storage (handled by persist middleware)
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to load favorites' 
          });
        }
      },

      isFavorite: (productId: string) => {
        return get().favorites.includes(productId);
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favorites: state.favorites,
      }),
    }
  )
);
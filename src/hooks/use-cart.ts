import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/stores/cart-store';

export function useCart() {
  const { data: session } = useSession();
  const cart = useCartStore();

  // Load cart from storage on mount
  useEffect(() => {
    cart.loadFromStorage();
  }, []);

  // Sync with server when user logs in
  useEffect(() => {
    if (session?.user) {
      cart.syncWithServer();
    }
  }, [session?.user]);

  return {
    items: cart.items,
    itemCount: cart.getItemCount(),
    subtotal: cart.getSubtotal(),
    summary: cart.getSummary(),
    isLoading: cart.isLoading,
    error: cart.error,
    
    // Actions
    addItem: cart.addItem,
    removeItem: cart.removeItem,
    updateQuantity: cart.updateQuantity,
    clearCart: cart.clearCart,
    syncWithServer: cart.syncWithServer,
  };
}
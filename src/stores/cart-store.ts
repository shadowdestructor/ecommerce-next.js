import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartState, CartItem, CartSummary } from '@/types/cart';
import { Product, ProductVariant } from '@prisma/client';

const TAX_RATE = 0.08; // 8% tax
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 5.99;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      addItem: (product, variant, quantity = 1) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => 
              item.productId === product.id && 
              item.variantId === variant?.id
          );

          if (existingItemIndex >= 0) {
            // Update existing item quantity
            const updatedItems = [...state.items];
            const existingItem = updatedItems[existingItemIndex];
            const newQuantity = existingItem.quantity + quantity;
            
            // Check stock availability
            const maxStock = variant?.inventoryQuantity || product.inventoryQuantity;
            if (newQuantity > maxStock) {
              return {
                ...state,
                error: `Cannot add more items. Only ${maxStock} available in stock.`,
              };
            }

            updatedItems[existingItemIndex] = {
              ...existingItem,
              quantity: newQuantity,
            };

            return {
              ...state,
              items: updatedItems,
              error: null,
            };
          } else {
            // Add new item
            const maxStock = variant?.inventoryQuantity || product.inventoryQuantity;
            if (quantity > maxStock) {
              return {
                ...state,
                error: `Cannot add ${quantity} items. Only ${maxStock} available in stock.`,
              };
            }

            const newItem: CartItem = {
              id: `${product.id}-${variant?.id || 'default'}-${Date.now()}`,
              productId: product.id,
              variantId: variant?.id,
              quantity,
              product,
              variant,
              addedAt: new Date(),
            };

            return {
              ...state,
              items: [...state.items, newItem],
              error: null,
            };
          }
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          ...state,
          items: state.items.filter((item) => item.id !== itemId),
          error: null,
        }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => {
          const itemIndex = state.items.findIndex((item) => item.id === itemId);
          if (itemIndex === -1) return state;

          const item = state.items[itemIndex];
          const maxStock = item.variant?.inventoryQuantity || item.product.inventoryQuantity;
          
          if (quantity > maxStock) {
            return {
              ...state,
              error: `Cannot update quantity. Only ${maxStock} available in stock.`,
            };
          }

          const updatedItems = [...state.items];
          updatedItems[itemIndex] = {
            ...item,
            quantity,
          };

          return {
            ...state,
            items: updatedItems,
            error: null,
          };
        });
      },

      clearCart: () => {
        set({
          items: [],
          error: null,
        });
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.variant?.price || item.product.price;
          return total + (Number(price) * item.quantity);
        }, 0);
      },

      getSummary: (): CartSummary => {
        const state = get();
        const subtotal = state.getSubtotal();
        const itemCount = state.getItemCount();
        
        const tax = subtotal * TAX_RATE;
        const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
        const discount = 0; // TODO: Implement discount logic
        const total = subtotal + tax + shipping - discount;

        return {
          subtotal: Number(subtotal.toFixed(2)),
          tax: Number(tax.toFixed(2)),
          shipping: Number(shipping.toFixed(2)),
          discount: Number(discount.toFixed(2)),
          total: Number(total.toFixed(2)),
          itemCount,
        };
      },

      loadFromStorage: () => {
        // This is handled automatically by the persist middleware
        // But we can add custom logic here if needed
      },

      syncWithServer: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // TODO: Implement server sync
          // This would involve:
          // 1. Sending cart items to server
          // 2. Validating stock availability
          // 3. Updating prices if changed
          // 4. Merging with server-side cart if user is logged in
          
          await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
          
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to sync cart' 
          });
        }
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);
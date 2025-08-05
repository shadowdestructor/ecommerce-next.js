import { Product, ProductVariant } from '@prisma/client';

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: Product & {
    images: Array<{ url: string; altText?: string }>;
  };
  variant?: ProductVariant;
  addedAt: Date;
}

export interface CartSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  itemCount: number;
}

export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addItem: (product: Product & { images: Array<{ url: string; altText?: string }> }, variant?: ProductVariant, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Computed values
  getItemCount: () => number;
  getSubtotal: () => number;
  getSummary: () => CartSummary;
  
  // Persistence
  loadFromStorage: () => void;
  syncWithServer: () => Promise<void>;
}
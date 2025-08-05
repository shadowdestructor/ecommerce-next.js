import { useCartStore } from '@/stores/cart-store';
import { Product } from '@prisma/client';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('CartStore', () => {
  beforeEach(() => {
    // Reset store state
    useCartStore.setState({
      items: [],
      isLoading: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  const mockProduct: Product & { images: Array<{ url: string; altText?: string }> } = {
    id: '1',
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test description',
    shortDescription: null,
    sku: 'TEST-001',
    price: 99.99,
    comparePrice: null,
    costPrice: null,
    trackInventory: true,
    inventoryQuantity: 10,
    weight: null,
    categoryId: 'cat-1',
    brand: 'Test Brand',
    status: 'ACTIVE',
    featured: false,
    metaTitle: null,
    metaDescription: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: [{ url: 'test.jpg', altText: 'Test' }],
  } as any;

  describe('addItem', () => {
    it('should add new item to cart', () => {
      const { addItem, items } = useCartStore.getState();
      
      addItem(mockProduct, undefined, 2);
      
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(2);
      expect(state.items[0].productId).toBe('1');
    });

    it('should update quantity for existing item', () => {
      const { addItem } = useCartStore.getState();
      
      // Add item first time
      addItem(mockProduct, undefined, 2);
      
      // Add same item again
      addItem(mockProduct, undefined, 3);
      
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(5);
    });

    it('should not exceed stock limit', () => {
      const { addItem } = useCartStore.getState();
      
      // Try to add more than available stock
      addItem(mockProduct, undefined, 15);
      
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
      expect(state.error).toContain('Only 10 available in stock');
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const { addItem, removeItem } = useCartStore.getState();
      
      addItem(mockProduct, undefined, 2);
      const itemId = useCartStore.getState().items[0].id;
      
      removeItem(itemId);
      
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const { addItem, updateQuantity } = useCartStore.getState();
      
      addItem(mockProduct, undefined, 2);
      const itemId = useCartStore.getState().items[0].id;
      
      updateQuantity(itemId, 5);
      
      const state = useCartStore.getState();
      expect(state.items[0].quantity).toBe(5);
    });

    it('should remove item when quantity is 0', () => {
      const { addItem, updateQuantity } = useCartStore.getState();
      
      addItem(mockProduct, undefined, 2);
      const itemId = useCartStore.getState().items[0].id;
      
      updateQuantity(itemId, 0);
      
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });

    it('should not exceed stock limit', () => {
      const { addItem, updateQuantity } = useCartStore.getState();
      
      addItem(mockProduct, undefined, 2);
      const itemId = useCartStore.getState().items[0].id;
      
      updateQuantity(itemId, 15);
      
      const state = useCartStore.getState();
      expect(state.items[0].quantity).toBe(2); // Should remain unchanged
      expect(state.error).toContain('Only 10 available in stock');
    });
  });

  describe('clearCart', () => {
    it('should clear all items', () => {
      const { addItem, clearCart } = useCartStore.getState();
      
      addItem(mockProduct, undefined, 2);
      clearCart();
      
      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });
  });

  describe('computed values', () => {
    it('should calculate item count correctly', () => {
      const { addItem, getItemCount } = useCartStore.getState();
      
      addItem(mockProduct, undefined, 2);
      addItem({ ...mockProduct, id: '2' }, undefined, 3);
      
      expect(getItemCount()).toBe(5);
    });

    it('should calculate subtotal correctly', () => {
      const { addItem, getSubtotal } = useCartStore.getState();
      
      addItem(mockProduct, undefined, 2); // 2 * 99.99 = 199.98
      
      expect(getSubtotal()).toBe(199.98);
    });

    it('should calculate summary correctly', () => {
      const { addItem, getSummary } = useCartStore.getState();
      
      addItem(mockProduct, undefined, 1); // 1 * 99.99 = 99.99
      
      const summary = getSummary();
      expect(summary.subtotal).toBe(99.99);
      expect(summary.tax).toBe(8.00); // 8% of 99.99
      expect(summary.shipping).toBe(5.99); // Under free shipping threshold
      expect(summary.total).toBe(113.98); // 99.99 + 8.00 + 5.99
      expect(summary.itemCount).toBe(1);
    });

    it('should apply free shipping for orders over threshold', () => {
      const { addItem, getSummary } = useCartStore.getState();
      
      // Add items worth more than $50
      addItem(mockProduct, undefined, 1); // 99.99
      
      const summary = getSummary();
      expect(summary.shipping).toBe(0); // Free shipping
    });
  });
});
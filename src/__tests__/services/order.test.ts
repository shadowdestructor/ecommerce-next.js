import { OrderService } from '@/services/order';
import { prisma } from '@/lib/db';
import { OrderStatus, PaymentStatus } from '@prisma/client';

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    orderItem: {
      update: jest.fn(),
    },
    product: {
      update: jest.fn(),
    },
    productVariant: {
      update: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('OrderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create order with items', async () => {
      const orderData = {
        email: 'test@example.com',
        items: [
          {
            productId: 'product-1',
            quantity: 2,
            unitPrice: 99.99,
          },
        ],
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          addressLine1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
        billingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          addressLine1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
        paymentMethod: 'credit_card',
        subtotal: 199.98,
        taxAmount: 16.00,
        shippingAmount: 5.99,
        discountAmount: 0,
        totalAmount: 221.97,
      };

      const mockOrder = {
        id: 'order-1',
        orderNumber: 'ORD240101001',
        ...orderData,
        status: OrderStatus.PENDING,
        items: [
          {
            id: 'item-1',
            productId: 'product-1',
            quantity: 2,
            unitPrice: 99.99,
            totalPrice: 199.98,
            product: {
              id: 'product-1',
              name: 'Test Product',
              slug: 'test-product',
              images: [],
            },
          },
        ],
      };

      mockPrisma.order.count.mockResolvedValue(0); // First order of the day
      mockPrisma.order.create.mockResolvedValue(mockOrder as any);
      mockPrisma.orderItem.update.mockResolvedValue({} as any);
      mockPrisma.product.update.mockResolvedValue({} as any);

      const result = await OrderService.createOrder(orderData, 'user-1');

      expect(mockPrisma.order.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          orderNumber: expect.stringMatching(/^ORD\d{8}\d{4}$/),
          userId: 'user-1',
          email: orderData.email,
          status: OrderStatus.PENDING,
          totalAmount: orderData.totalAmount,
        }),
        include: expect.any(Object),
      });

      expect(result).toEqual(mockOrder);
    });
  });

  describe('getOrders', () => {
    it('should return paginated orders', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          orderNumber: 'ORD240101001',
          status: OrderStatus.PENDING,
          items: [],
        },
      ];

      mockPrisma.order.findMany.mockResolvedValue(mockOrders as any);
      mockPrisma.order.count.mockResolvedValue(1);

      const result = await OrderService.getOrders({
        page: 1,
        limit: 10,
      });

      expect(result.orders).toEqual(mockOrders);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should filter orders by status', async () => {
      mockPrisma.order.findMany.mockResolvedValue([]);
      mockPrisma.order.count.mockResolvedValue(0);

      await OrderService.getOrders({
        status: OrderStatus.PENDING,
      });

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: OrderStatus.PENDING },
        })
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const mockOrder = {
        id: 'order-1',
        status: OrderStatus.CONFIRMED,
        items: [],
      };

      mockPrisma.order.update.mockResolvedValue(mockOrder as any);

      const result = await OrderService.updateOrderStatus('order-1', OrderStatus.CONFIRMED);

      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: OrderStatus.CONFIRMED },
        include: expect.any(Object),
      });

      expect(result).toEqual(mockOrder);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order and restore inventory', async () => {
      const mockOrder = {
        id: 'order-1',
        status: OrderStatus.PENDING,
        items: [
          {
            id: 'item-1',
            productId: 'product-1',
            variantId: null,
            quantity: 2,
          },
        ],
      };

      mockPrisma.order.findUnique.mockResolvedValue(mockOrder as any);
      mockPrisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CANCELLED,
      } as any);
      mockPrisma.product.update.mockResolvedValue({} as any);

      const result = await OrderService.cancelOrder('order-1');

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: {
          inventoryQuantity: {
            increment: 2,
          },
        },
      });

      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('should throw error for shipped orders', async () => {
      const mockOrder = {
        id: 'order-1',
        status: OrderStatus.SHIPPED,
        items: [],
      };

      mockPrisma.order.findUnique.mockResolvedValue(mockOrder as any);

      await expect(OrderService.cancelOrder('order-1')).rejects.toThrow(
        'Cannot cancel shipped or delivered orders'
      );
    });
  });

  describe('getOrderSummary', () => {
    it('should return order summary', async () => {
      mockPrisma.order.count
        .mockResolvedValueOnce(10) // total orders
        .mockResolvedValueOnce(3)  // pending orders
        .mockResolvedValueOnce(7); // completed orders

      mockPrisma.order.aggregate.mockResolvedValue({
        _sum: { totalAmount: 1000 },
      } as any);

      const result = await OrderService.getOrderSummary('user-1');

      expect(result).toEqual({
        totalOrders: 10,
        totalRevenue: 1000,
        pendingOrders: 3,
        completedOrders: 7,
        averageOrderValue: 100,
      });
    });
  });
});
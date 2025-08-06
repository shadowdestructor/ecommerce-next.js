import { prisma } from '@/lib/db';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { CreateOrderData, OrderFilters, OrderPage, OrderWithItems, OrderSummary } from '@/types/order';

export class OrderService {
  static async createOrder(data: CreateOrderData, userId?: string): Promise<OrderWithItems> {
    // Generate unique order number
    const orderNumber = await this.generateOrderNumber();

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        email: data.email,
        status: OrderStatus.PENDING,
        subtotal: data.subtotal,
        taxAmount: data.taxAmount,
        shippingAmount: data.shippingAmount,
        discountAmount: data.discountAmount,
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod,
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress,
        notes: data.notes,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: '', // Will be updated below
            variantName: item.variantId ? '' : undefined,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  select: { url: true, altText: true },
                  orderBy: { sortOrder: 'asc' },
                  take: 1,
                },
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                option1Name: true,
                option1Value: true,
                option2Name: true,
                option2Value: true,
              },
            },
          },
        },
        user: true,
      },
    });

    // Update product names in order items
    await Promise.all(
      order.items.map(item =>
        prisma.orderItem.update({
          where: { id: item.id },
          data: {
            productName: item.product.name,
            variantName: item.variant?.name,
          },
        })
      )
    );

    // Update inventory
    await this.updateInventoryForOrder(order.items);

    // Send order confirmation email
    try {
      const { EmailService } = await import('@/lib/email');
      await EmailService.sendOrderConfirmation({
        email: order.user?.email || order.email,
        orderNumber: order.orderNumber,
        customerName: order.user?.name || 'Customer',
        items: order.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: Number(item.unitPrice),
          image: item.product.images[0]?.url,
        })),
        subtotal: Number(order.subtotal),
        tax: Number(order.taxAmount),
        shipping: Number(order.shippingAmount),
        total: Number(order.totalAmount),
        shippingAddress: order.shippingAddress as any,
      });
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
    }

    return order as OrderWithItems;
  }

  static async getOrders(filters: OrderFilters = {}): Promise<OrderPage> {
    const {
      status,
      paymentStatus,
      userId,
      email,
      orderNumber,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (userId) where.userId = userId;
    if (email) where.email = { contains: email, mode: 'insensitive' };
    if (orderNumber) where.orderNumber = { contains: orderNumber, mode: 'insensitive' };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: {
                    select: { url: true, altText: true },
                    orderBy: { sortOrder: 'asc' },
                    take: 1,
                  },
                },
              },
              variant: {
                select: {
                  id: true,
                  name: true,
                  option1Name: true,
                  option1Value: true,
                  option2Name: true,
                  option2Value: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      orders: orders as OrderWithItems[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  static async getOrderById(id: string): Promise<OrderWithItems | null> {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  select: { url: true, altText: true },
                  orderBy: { sortOrder: 'asc' },
                  take: 1,
                },
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                option1Name: true,
                option1Value: true,
                option2Name: true,
                option2Value: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }) as Promise<OrderWithItems | null>;
  }

  static async getOrderByNumber(orderNumber: string): Promise<OrderWithItems | null> {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  select: { url: true, altText: true },
                  orderBy: { sortOrder: 'asc' },
                  take: 1,
                },
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                option1Name: true,
                option1Value: true,
                option2Name: true,
                option2Value: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }) as Promise<OrderWithItems | null>;
  }

  static async updateOrderStatus(id: string, status: OrderStatus): Promise<OrderWithItems> {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  select: { url: true, altText: true },
                  orderBy: { sortOrder: 'asc' },
                  take: 1,
                },
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                option1Name: true,
                option1Value: true,
                option2Name: true,
                option2Value: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Send status update email
    try {
      const { EmailService } = await import('@/lib/email');
      await EmailService.sendOrderStatusUpdate({
        email: order.user?.email || order.email,
        orderNumber: order.orderNumber,
        customerName: order.user?.name || 'Customer',
        status: status,
      });
    } catch (error) {
      console.error('Failed to send order status update email:', error);
    }

    return order as OrderWithItems;
  }

  static async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<OrderWithItems> {
    return prisma.order.update({
      where: { id },
      data: { paymentStatus },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  select: { url: true, altText: true },
                  orderBy: { sortOrder: 'asc' },
                  take: 1,
                },
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                option1Name: true,
                option1Value: true,
                option2Name: true,
                option2Value: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }) as Promise<OrderWithItems>;
  }

  static async cancelOrder(id: string, reason?: string): Promise<OrderWithItems> {
    const order = await this.getOrderById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
      throw new Error('Cannot cancel shipped or delivered orders');
    }

    // Restore inventory
    await this.restoreInventoryForOrder(order.items);

    // Update order status
    return this.updateOrderStatus(id, OrderStatus.CANCELLED);
  }

  static async getOrderSummary(userId?: string): Promise<OrderSummary> {
    const where = userId ? { userId } : {};

    const [
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
    ] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where: { ...where, paymentStatus: PaymentStatus.PAID },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({
        where: { ...where, status: OrderStatus.PENDING },
      }),
      prisma.order.count({
        where: { ...where, status: OrderStatus.DELIVERED },
      }),
    ]);

    const revenue = Number(totalRevenue._sum.totalAmount || 0);
    const averageOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;

    return {
      totalOrders,
      totalRevenue: revenue,
      pendingOrders,
      completedOrders,
      averageOrderValue,
    };
  }

  private static async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Get count of orders today
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    
    const todayOrderCount = await prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const sequence = (todayOrderCount + 1).toString().padStart(4, '0');
    return `ORD${year}${month}${day}${sequence}`;
  }

  private static async updateInventoryForOrder(items: any[]) {
    for (const item of items) {
      if (item.variantId) {
        // Update variant inventory
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            inventoryQuantity: {
              decrement: item.quantity,
            },
          },
        });
      } else {
        // Update product inventory
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            inventoryQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }
    }
  }

  private static async restoreInventoryForOrder(items: any[]) {
    for (const item of items) {
      if (item.variantId) {
        // Restore variant inventory
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            inventoryQuantity: {
              increment: item.quantity,
            },
          },
        });
      } else {
        // Restore product inventory
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            inventoryQuantity: {
              increment: item.quantity,
            },
          },
        });
      }
    }
  }
}
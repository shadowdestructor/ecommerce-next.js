import { prisma } from '@/lib/db';
import { CartItem as PrismaCartItem } from '@prisma/client';

export interface CartItemData {
  productId: string;
  variantId?: string;
  quantity: number;
}

export class CartService {
  static async getCartItems(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) {
      throw new Error('Either userId or sessionId is required');
    }

    const cartItems = await prisma.cartItem.findMany({
      where: {
        OR: [
          userId ? { userId } : {},
          sessionId ? { sessionId } : {},
        ].filter(Boolean),
      },
      include: {
        product: {
          include: {
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
            category: true,
          },
        },
        variant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return cartItems;
  }

  static async addToCart(
    data: CartItemData,
    userId?: string,
    sessionId?: string
  ) {
    if (!userId && !sessionId) {
      throw new Error('Either userId or sessionId is required');
    }

    // Check if item already exists
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        productId: data.productId,
        variantId: data.variantId,
        OR: [
          userId ? { userId } : {},
          sessionId ? { sessionId } : {},
        ].filter(Boolean),
      },
    });

    if (existingItem) {
      // Update quantity
      return await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + data.quantity,
        },
        include: {
          product: {
            include: {
              images: {
                orderBy: { sortOrder: 'asc' },
                take: 1,
              },
            },
          },
          variant: true,
        },
      });
    } else {
      // Create new item
      return await prisma.cartItem.create({
        data: {
          ...data,
          userId,
          sessionId,
        },
        include: {
          product: {
            include: {
              images: {
                orderBy: { sortOrder: 'asc' },
                take: 1,
              },
            },
          },
          variant: true,
        },
      });
    }
  }

  static async updateCartItem(
    itemId: string,
    quantity: number,
    userId?: string,
    sessionId?: string
  ) {
    const whereClause: any = { id: itemId };
    
    if (userId || sessionId) {
      whereClause.OR = [
        userId ? { userId } : {},
        sessionId ? { sessionId } : {},
      ].filter(Boolean);
    }

    return await prisma.cartItem.update({
      where: whereClause,
      data: { quantity },
      include: {
        product: {
          include: {
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
          },
        },
        variant: true,
      },
    });
  }

  static async removeFromCart(
    itemId: string,
    userId?: string,
    sessionId?: string
  ) {
    const whereClause: any = { id: itemId };
    
    if (userId || sessionId) {
      whereClause.OR = [
        userId ? { userId } : {},
        sessionId ? { sessionId } : {},
      ].filter(Boolean);
    }

    await prisma.cartItem.delete({
      where: whereClause,
    });
  }

  static async clearCart(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) {
      throw new Error('Either userId or sessionId is required');
    }

    await prisma.cartItem.deleteMany({
      where: {
        OR: [
          userId ? { userId } : {},
          sessionId ? { sessionId } : {},
        ].filter(Boolean),
      },
    });
  }

  static async mergeGuestCart(guestSessionId: string, userId: string) {
    // Get guest cart items
    const guestItems = await prisma.cartItem.findMany({
      where: { sessionId: guestSessionId },
    });

    if (guestItems.length === 0) return;

    // Get user's existing cart items
    const userItems = await prisma.cartItem.findMany({
      where: { userId },
    });

    // Merge items
    for (const guestItem of guestItems) {
      const existingUserItem = userItems.find(
        (item) =>
          item.productId === guestItem.productId &&
          item.variantId === guestItem.variantId
      );

      if (existingUserItem) {
        // Update existing item quantity
        await prisma.cartItem.update({
          where: { id: existingUserItem.id },
          data: {
            quantity: existingUserItem.quantity + guestItem.quantity,
          },
        });
      } else {
        // Create new item for user
        await prisma.cartItem.create({
          data: {
            productId: guestItem.productId,
            variantId: guestItem.variantId,
            quantity: guestItem.quantity,
            userId,
          },
        });
      }
    }

    // Delete guest cart items
    await prisma.cartItem.deleteMany({
      where: { sessionId: guestSessionId },
    });
  }

  static async validateCartItems(userId?: string, sessionId?: string) {
    const cartItems = await this.getCartItems(userId, sessionId);
    const validationResults = [];

    for (const item of cartItems) {
      const product = item.product;
      const variant = item.variant;
      
      let isValid = true;
      let message = '';
      let maxQuantity = 0;

      // Check if product is still active
      if (product.status !== 'ACTIVE') {
        isValid = false;
        message = 'Product is no longer available';
      } else {
        // Check stock
        maxQuantity = variant?.inventoryQuantity || product.inventoryQuantity;
        
        if (maxQuantity === 0) {
          isValid = false;
          message = 'Product is out of stock';
        } else if (item.quantity > maxQuantity) {
          isValid = false;
          message = `Only ${maxQuantity} items available`;
        }
      }

      validationResults.push({
        itemId: item.id,
        isValid,
        message,
        maxQuantity,
        currentQuantity: item.quantity,
      });
    }

    return validationResults;
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CartService } from '@/services/cart';
import { z } from 'zod';

const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional(),
  quantity: z.number().int().positive('Quantity must be positive'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    const cartItems = await CartService.getCartItems(
      session?.user?.id,
      sessionId || undefined
    );

    return NextResponse.json({
      success: true,
      data: cartItems,
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!session?.user?.id && !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = addToCartSchema.parse(body);

    const cartItem = await CartService.addToCart(
      validatedData,
      session?.user?.id,
      sessionId || undefined
    );

    return NextResponse.json(
      {
        success: true,
        data: cartItem,
        message: 'Item added to cart',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add to cart error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!session?.user?.id && !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session required' },
        { status: 401 }
      );
    }

    await CartService.clearCart(
      session?.user?.id,
      sessionId || undefined
    );

    return NextResponse.json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
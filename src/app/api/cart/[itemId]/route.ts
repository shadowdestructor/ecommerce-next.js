import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CartService } from '@/services/cart';
import { z } from 'zod';

const updateCartItemSchema = z.object({
  quantity: z.number().int().positive('Quantity must be positive'),
});

interface RouteParams {
  params: {
    itemId: string;
  };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const { quantity } = updateCartItemSchema.parse(body);

    const cartItem = await CartService.updateCartItem(
      params.itemId,
      quantity,
      session?.user?.id,
      sessionId || undefined
    );

    return NextResponse.json({
      success: true,
      data: cartItem,
      message: 'Cart item updated',
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    await CartService.removeFromCart(
      params.itemId,
      session?.user?.id,
      sessionId || undefined
    );

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    console.error('Remove cart item error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove cart item' },
      { status: 500 }
    );
  }
}
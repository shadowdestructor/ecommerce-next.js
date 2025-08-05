import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/services/product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const updateStockSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
});

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { quantity } = updateStockSchema.parse(body);

    await ProductService.updateStock(params.id, quantity);

    return NextResponse.json({
      success: true,
      message: 'Stock updated successfully',
    });
  } catch (error) {
    console.error('Update stock error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid quantity', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update stock' },
      { status: 500 }
    );
  }
}
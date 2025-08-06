import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

interface RouteParams {
  params: {
    productId: string;
  };
}

const updateProductSchema = z.object({
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
  inventoryQuantity: z.number().optional(),
  price: z.number().optional(),
});

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    const product = await prisma.product.findUnique({
      where: { id: params.productId },
      include: {
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        variants: true,
        _count: {
          select: {
            orderItems: true,
            favorites: true,
            reviews: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    const body = await request.json();
    const data = updateProductSchema.parse(body);

    const product = await prisma.product.update({
      where: { id: params.productId },
      data,
      include: {
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error updating product:', error);
    
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    // Check if product has orders
    const orderCount = await prisma.orderItem.count({
      where: { productId: params.productId },
    });

    if (orderCount > 0) {
      // If product has orders, archive instead of delete
      await prisma.product.update({
        where: { id: params.productId },
        data: { status: 'ARCHIVED' },
      });

      return NextResponse.json({ 
        message: 'Product archived (has existing orders)' 
      });
    }

    // Safe to delete if no orders
    await prisma.product.delete({
      where: { id: params.productId },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
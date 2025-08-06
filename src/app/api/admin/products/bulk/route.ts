import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const bulkActionSchema = z.object({
  action: z.enum(['activate', 'deactivate', 'delete', 'archive']),
  productIds: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { action, productIds } = bulkActionSchema.parse(body);

    if (productIds.length === 0) {
      return NextResponse.json(
        { error: 'No products selected' },
        { status: 400 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case 'activate':
        updateData = { status: 'ACTIVE' };
        break;
      case 'deactivate':
        updateData = { status: 'DRAFT' };
        break;
      case 'archive':
        updateData = { status: 'ARCHIVED' };
        break;
      case 'delete':
        // For safety, we'll archive instead of hard delete
        updateData = { status: 'ARCHIVED' };
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const result = await prisma.product.updateMany({
      where: {
        id: {
          in: productIds,
        },
      },
      data: updateData,
    });

    return NextResponse.json({
      message: `Successfully updated ${result.count} products`,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    );
  }
}
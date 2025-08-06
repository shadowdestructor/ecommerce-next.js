import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await requireAdmin();

    // Get top products by total quantity sold
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        totalPrice: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });

    // Get product details for the top products
    const productsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            slug: true,
            images: {
              take: 1,
              select: {
                url: true,
                altText: true,
              },
            },
          },
        });

        return {
          id: product?.id || '',
          name: product?.name || 'Unknown Product',
          slug: product?.slug || '',
          totalSold: item._sum.quantity || 0,
          revenue: Number(item._sum.totalPrice || 0),
          image: product?.images[0] || null,
        };
      })
    );

    return NextResponse.json({ 
      products: productsWithDetails.filter(p => p.id) 
    });
  } catch (error) {
    console.error('Error fetching top products:', error);
    
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch top products' },
      { status: 500 }
    );
  }
}
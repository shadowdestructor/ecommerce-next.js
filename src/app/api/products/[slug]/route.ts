import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const product = await prisma.product.findUnique({
      where: { 
        slug,
        status: 'ACTIVE'
      },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        variants: {
          orderBy: { createdAt: 'asc' }
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }

    // Get related products from the same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        status: 'ACTIVE',
        id: { not: product.id }
      },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1
        },
        variants: true
      },
      take: 8,
      orderBy: { createdAt: 'desc' }
    });

    // Calculate average rating
    const averageRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;

    const productWithRating = {
      ...product,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: product.reviews.length
    };

    return NextResponse.json({
      product: productWithRating,
      relatedProducts
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Ürün getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}
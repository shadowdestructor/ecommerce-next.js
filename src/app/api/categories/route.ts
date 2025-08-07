import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all parent categories (categories without parent)
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        parentId: null // Only parent categories
      },
      include: {
        children: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            _count: {
              select: {
                products: {
                  where: { status: 'ACTIVE' }
                }
              }
            }
          },
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: {
            products: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    // Transform data to include product counts
    const categoriesWithCounts = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
      productCount: category._count.products,
      children: category.children.map(child => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        productCount: child._count.products
      }))
    }));

    return NextResponse.json({
      categories: categoriesWithCounts
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Kategoriler getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}
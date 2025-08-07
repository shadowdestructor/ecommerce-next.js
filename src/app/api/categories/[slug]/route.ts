import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Find category
    const category = await prisma.category.findUnique({
      where: { 
        slug,
        isActive: true
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        children: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true
          },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Kategori bulunamadı' },
        { status: 404 }
      );
    }

    // Get products in this category and its subcategories
    const categoryIds = [category.id, ...category.children.map(c => c.id)];
    
    const products = await prisma.product.findMany({
      where: {
        categoryId: { in: categoryIds },
        status: 'ACTIVE'
      },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1
        },
        variants: true,
        reviews: {
          where: { isApproved: true },
          select: { rating: true }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Add calculated fields
    const productsWithRating = products.map(product => ({
      ...product,
      averageRating: product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0,
      reviewCount: product.reviews.length
    }));

    // Get filter options for this category
    const [brands_options, priceRange] = await Promise.all([
      prisma.product.groupBy({
        by: ['brand'],
        where: {
          categoryId: { in: categoryIds },
          status: 'ACTIVE',
          brand: { not: null }
        },
        _count: true,
        orderBy: { brand: 'asc' }
      }),
      prisma.product.aggregate({
        where: {
          categoryId: { in: categoryIds },
          status: 'ACTIVE'
        },
        _min: { price: true },
        _max: { price: true }
      })
    ]);

    const filterOptions = {
      categories: [
        {
          id: category.id,
          name: category.name,
          count: products.filter(p => p.categoryId === category.id).length
        },
        ...category.children.map(child => ({
          id: child.id,
          name: child.name,
          count: products.filter(p => p.categoryId === child.id).length
        }))
      ],
      brands: brands_options.map(brand => ({
        name: brand.brand!,
        count: brand._count
      })),
      priceRange: {
        min: Math.floor(priceRange._min.price?.toNumber() || 0),
        max: Math.ceil(priceRange._max.price?.toNumber() || 1000)
      }
    };

    return NextResponse.json({
      category,
      products: productsWithRating,
      filterOptions
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Kategori getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}
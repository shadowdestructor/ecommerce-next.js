import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get('search') || '';
    const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
    const brands = searchParams.get('brands')?.split(',').filter(Boolean) || [];
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');
    const rating = parseInt(searchParams.get('rating') || '0');
    const inStock = searchParams.get('inStock') === 'true';
    const onSale = searchParams.get('onSale') === 'true';
    const featured = searchParams.get('featured') === 'true';

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = {
      status: 'ACTIVE',
    };

    // Search in name and description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Category filter
    if (categories.length > 0) {
      where.categoryId = { in: categories };
    }

    // Brand filter
    if (brands.length > 0) {
      where.brand = { in: brands };
    }

    // Price range filter
    if (minPrice > 0 || maxPrice < 999999) {
      where.price = {
        gte: minPrice,
        lte: maxPrice
      };
    }

    // Stock filter
    if (inStock) {
      where.inventoryQuantity = { gt: 0 };
    }

    // Sale filter
    if (onSale) {
      where.comparePrice = { not: null };
    }

    // Featured filter
    if (featured) {
      where.featured = true;
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'price':
        orderBy.price = sortOrder;
        break;
      case 'name':
        orderBy.name = sortOrder;
        break;
      case 'createdAt':
      default:
        orderBy.createdAt = sortOrder;
        break;
    }

    // Get products
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
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
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    // Add calculated fields
    const productsWithRating = products.map(product => ({
      ...product,
      averageRating: product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0,
      reviewCount: product.reviews.length
    }));

    // Get filter options
    const [categories_options, brands_options, priceRange] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              products: {
                where: { status: 'ACTIVE' }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      }),
      prisma.product.groupBy({
        by: ['brand'],
        where: {
          status: 'ACTIVE',
          brand: { not: null }
        },
        _count: true,
        orderBy: { brand: 'asc' }
      }),
      prisma.product.aggregate({
        where: { status: 'ACTIVE' },
        _min: { price: true },
        _max: { price: true }
      })
    ]);

    const filterOptions = {
      categories: categories_options.map(cat => ({
        id: cat.id,
        name: cat.name,
        count: cat._count.products
      })),
      brands: brands_options.map(brand => ({
        name: brand.brand!,
        count: brand._count
      })),
      priceRange: {
        min: Math.floor(priceRange._min.price?.toNumber() || 0),
        max: Math.ceil(priceRange._max.price?.toNumber() || 1000)
      }
    };

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      products: productsWithRating,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filterOptions
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Ürünler getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}
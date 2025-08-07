import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return NextResponse.json({
        suggestions: [],
        products: [],
        categories: []
      });
    }

    // Search for products
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1
        }
      },
      take: limit,
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Search for categories
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        name: { contains: query, mode: 'insensitive' }
      },
      take: 5,
      orderBy: { name: 'asc' }
    });

    // Generate search suggestions
    const suggestions = [
      ...products.slice(0, 5).map(p => p.name),
      ...categories.map(c => c.name),
      // Add some common search terms based on query
      ...(query.length >= 3 ? [
        `${query} fiyatları`,
        `${query} modelleri`,
        `${query} çeşitleri`
      ] : [])
    ].slice(0, 8);

    return NextResponse.json({
      suggestions: [...new Set(suggestions)], // Remove duplicates
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.images[0]?.url || null,
        category: product.category.name
      })),
      categories: categories.map(category => ({
        id: category.id,
        name: category.name,
        slug: category.slug
      }))
    });
  } catch (error) {
    console.error('Error in search:', error);
    return NextResponse.json(
      { error: 'Arama sırasında hata oluştu' },
      { status: 500 }
    );
  }
}
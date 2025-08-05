import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/services/product';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 8;

    const products = await ProductService.getFeaturedProducts(limit);

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Featured products API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch featured products' },
      { status: 500 }
    );
  }
}
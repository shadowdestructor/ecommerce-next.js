import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/services/category';

export async function GET(request: NextRequest) {
  try {
    const categories = await CategoryService.getRootCategories();

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Root categories API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch root categories' },
      { status: 500 }
    );
  }
}
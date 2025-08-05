import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/services/category';

export async function GET(request: NextRequest) {
  try {
    const hierarchy = await CategoryService.getCategoryHierarchy();

    return NextResponse.json({
      success: true,
      data: hierarchy,
    });
  } catch (error) {
    console.error('Category hierarchy API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category hierarchy' },
      { status: 500 }
    );
  }
}
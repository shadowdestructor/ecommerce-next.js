import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FavoritesService } from '@/services/favorites';
import { z } from 'zod';

const addToFavoritesSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const favorites = await FavoritesService.getFavorites(session.user.id);

    return NextResponse.json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId } = addToFavoritesSchema.parse(body);

    const favorite = await FavoritesService.addToFavorites(
      session.user.id,
      productId
    );

    return NextResponse.json(
      {
        success: true,
        data: favorite,
        message: 'Added to favorites',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add to favorites error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to add to favorites' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await FavoritesService.clearFavorites(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'All favorites cleared',
    });
  } catch (error) {
    console.error('Clear favorites error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear favorites' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { OrderService } from '@/services/order';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    
    // For admin users, they can get summary for any user or all users
    // For regular users, they can only get their own summary
    let userId: string | undefined;
    
    if (session?.user?.role === 'ADMIN') {
      userId = searchParams.get('userId') || undefined;
    } else {
      userId = session?.user?.id;
    }

    const summary = await OrderService.getOrderSummary(userId);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Get order summary error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order summary' },
      { status: 500 }
    );
  }
}
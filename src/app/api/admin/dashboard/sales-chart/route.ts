import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    let days = 30;
    if (period === '7d') days = 7;
    else if (period === '90d') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Generate date range
    const dateRange = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dateRange.push(date.toISOString().split('T')[0]);
    }

    // Get sales data for each day
    const salesData = await Promise.all(
      dateRange.map(async (date) => {
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const [salesResult, ordersCount] = await Promise.all([
          prisma.order.aggregate({
            where: {
              createdAt: {
                gte: new Date(date),
                lt: nextDate,
              },
              status: { not: 'CANCELLED' },
            },
            _sum: { totalAmount: true },
          }),
          prisma.order.count({
            where: {
              createdAt: {
                gte: new Date(date),
                lt: nextDate,
              },
              status: { not: 'CANCELLED' },
            },
          }),
        ]);

        return {
          date,
          sales: Number(salesResult._sum.totalAmount || 0),
          orders: ordersCount,
        };
      })
    );

    return NextResponse.json({ salesData });
  } catch (error) {
    console.error('Error fetching sales chart data:', error);
    
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch sales chart data' },
      { status: 500 }
    );
  }
}
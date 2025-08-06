import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());

    // Get current month stats
    const [
      currentRevenue,
      currentOrders,
      currentCustomers,
      currentProducts,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: {
          createdAt: { gte: lastMonth },
          status: { not: 'CANCELLED' },
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: lastMonth },
          status: { not: 'CANCELLED' },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: lastMonth },
          role: 'CUSTOMER',
        },
      }),
      prisma.product.count({
        where: {
          createdAt: { gte: lastMonth },
          status: 'ACTIVE',
        },
      }),
    ]);

    // Get previous month stats for comparison
    const [
      previousRevenue,
      previousOrders,
      previousCustomers,
      previousProducts,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: {
          createdAt: { gte: twoMonthsAgo, lt: lastMonth },
          status: { not: 'CANCELLED' },
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: twoMonthsAgo, lt: lastMonth },
          status: { not: 'CANCELLED' },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: twoMonthsAgo, lt: lastMonth },
          role: 'CUSTOMER',
        },
      }),
      prisma.product.count({
        where: {
          createdAt: { gte: twoMonthsAgo, lt: lastMonth },
          status: 'ACTIVE',
        },
      }),
    ]);

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const totalRevenue = Number(currentRevenue._sum.totalAmount || 0);
    const prevRevenue = Number(previousRevenue._sum.totalAmount || 0);

    return NextResponse.json({
      totalRevenue,
      totalOrders: currentOrders,
      totalCustomers: currentCustomers,
      totalProducts: currentProducts,
      revenueChange: calculateChange(totalRevenue, prevRevenue),
      ordersChange: calculateChange(currentOrders, previousOrders),
      customersChange: calculateChange(currentCustomers, previousCustomers),
      productsChange: calculateChange(currentProducts, previousProducts),
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
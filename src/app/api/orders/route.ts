import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { OrderService } from '@/services/order';
import { createOrderSchema, orderFiltersSchema } from '@/lib/validations/order';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    
    const filters = {
      status: searchParams.get('status') as any || undefined,
      paymentStatus: searchParams.get('paymentStatus') as any || undefined,
      userId: session?.user?.role === 'ADMIN' ? searchParams.get('userId') || undefined : session?.user?.id,
      email: searchParams.get('email') || undefined,
      orderNumber: searchParams.get('orderNumber') || undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10,
    };

    // For non-admin users, only show their own orders
    if (session?.user?.role !== 'ADMIN') {
      filters.userId = session?.user?.id;
    }

    const result = await OrderService.getOrders(filters);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const validatedData = createOrderSchema.parse(body);
    
    const order = await OrderService.createOrder(
      validatedData,
      session?.user?.id
    );

    return NextResponse.json(
      {
        success: true,
        data: order,
        message: 'Order created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create order error:', error);
    
    if (error instanceof Error && error.message.includes('Insufficient inventory')) {
      return NextResponse.json(
        { success: false, error: 'Some items are out of stock' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
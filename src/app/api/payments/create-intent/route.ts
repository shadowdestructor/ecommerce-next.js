import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PaymentService } from '@/services/payment';
import { z } from 'zod';

const createPaymentIntentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('usd'),
  orderId: z.string().min(1, 'Order ID is required'),
  paymentMethodId: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const validatedData = createPaymentIntentSchema.parse(body);
    
    const paymentIntent = await PaymentService.createPaymentIntent({
      ...validatedData,
      customerId: session?.user?.id,
    });

    return NextResponse.json({
      success: true,
      data: paymentIntent,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
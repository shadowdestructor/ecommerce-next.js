import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment';
import { OrderService } from '@/services/order';
import { z } from 'zod';

const confirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
  paymentMethodId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, paymentMethodId } = confirmPaymentSchema.parse(body);
    
    const paymentIntent = await PaymentService.confirmPaymentIntent(
      paymentIntentId,
      paymentMethodId
    );

    // Update order payment status based on payment intent status
    if (paymentIntent.metadata?.orderId) {
      const orderId = paymentIntent.metadata.orderId;
      
      if (paymentIntent.status === 'succeeded') {
        await OrderService.updatePaymentStatus(orderId, 'PAID');
        await OrderService.updateOrderStatus(orderId, 'CONFIRMED');
      } else if (paymentIntent.status === 'payment_failed') {
        await OrderService.updatePaymentStatus(orderId, 'FAILED');
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
      },
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}
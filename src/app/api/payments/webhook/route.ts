import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment';
import { OrderService } from '@/services/order';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  try {
    const event = await PaymentService.handleWebhook(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);
        
        // Update order status
        if (paymentIntent.metadata?.orderId) {
          await OrderService.updatePaymentStatus(paymentIntent.metadata.orderId, 'PAID');
          await OrderService.updateOrderStatus(paymentIntent.metadata.orderId, 'CONFIRMED');
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);
        
        // Update order status
        if (paymentIntent.metadata?.orderId) {
          await OrderService.updatePaymentStatus(paymentIntent.metadata.orderId, 'FAILED');
        }
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment canceled:', paymentIntent.id);
        
        // Update order status
        if (paymentIntent.metadata?.orderId) {
          await OrderService.updatePaymentStatus(paymentIntent.metadata.orderId, 'FAILED');
        }
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        console.log('Dispute created:', dispute.id);
        
        // Handle dispute - notify admin, update order status, etc.
        // TODO: Implement dispute handling logic
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Invoice payment succeeded:', invoice.id);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription ${event.type}:`, subscription.id);
        
        // Handle subscription events if you have subscription products
        // TODO: Implement subscription handling logic
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}
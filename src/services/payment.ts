import { stripe } from '@/lib/stripe';
import { CreatePaymentIntentData, PaymentIntent } from '@/types/payment';
import Stripe from 'stripe';

export class PaymentService {
  static async createPaymentIntent(data: CreatePaymentIntentData): Promise<PaymentIntent> {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100), // Convert to cents
      currency: data.currency || 'usd',
      payment_method: data.paymentMethodId,
      confirmation_method: 'manual',
      confirm: !!data.paymentMethodId,
      metadata: {
        orderId: data.orderId,
        ...data.metadata,
      },
    });

    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    };
  }

  static async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string
  ): Promise<Stripe.PaymentIntent> {
    const updateData: Stripe.PaymentIntentConfirmParams = {};
    
    if (paymentMethodId) {
      updateData.payment_method = paymentMethodId;
    }

    return await stripe.paymentIntents.confirm(paymentIntentId, updateData);
  }

  static async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  }

  static async createCustomer(data: {
    email: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Customer> {
    return await stripe.customers.create({
      email: data.email,
      name: data.name,
      phone: data.phone,
      metadata: data.metadata,
    });
  }

  static async retrieveCustomer(customerId: string): Promise<Stripe.Customer> {
    return await stripe.customers.retrieve(customerId) as Stripe.Customer;
  }

  static async createPaymentMethod(data: {
    type: 'card';
    card: {
      number: string;
      exp_month: number;
      exp_year: number;
      cvc: string;
    };
    billing_details?: {
      name?: string;
      email?: string;
      phone?: string;
      address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
      };
    };
  }): Promise<Stripe.PaymentMethod> {
    return await stripe.paymentMethods.create(data);
  }

  static async attachPaymentMethodToCustomer(
    paymentMethodId: string,
    customerId: string
  ): Promise<Stripe.PaymentMethod> {
    return await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  static async listCustomerPaymentMethods(
    customerId: string,
    type: 'card' = 'card'
  ): Promise<Stripe.PaymentMethod[]> {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type,
    });

    return paymentMethods.data;
  }

  static async refundPayment(
    paymentIntentId: string,
    amount?: number,
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  ): Promise<Stripe.Refund> {
    return await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason,
    });
  }

  static async handleWebhook(
    body: string,
    signature: string,
    endpointSecret: string
  ): Promise<Stripe.Event> {
    return stripe.webhooks.constructEvent(body, signature, endpointSecret);
  }

  static async calculateOrderAmount(items: Array<{
    price: number;
    quantity: number;
  }>): Promise<number> {
    // Calculate the order total on the server to prevent manipulation
    const subtotal = items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Add tax (8%)
    const tax = subtotal * 0.08;
    
    // Add shipping (free over $50)
    const shipping = subtotal >= 50 ? 0 : 5.99;
    
    const total = subtotal + tax + shipping;
    
    return Math.round(total * 100); // Return in cents
  }

  static formatAmountForDisplay(amount: number, currency: string = 'usd'): string {
    const numberFormat = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      currencyDisplay: 'symbol',
    });

    return numberFormat.format(amount / 100);
  }

  static formatAmountFromStripe(amount: number): number {
    return amount / 100;
  }
}
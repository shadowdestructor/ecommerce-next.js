import { Address } from '@/types/order';

export interface CheckoutState {
  step: CheckoutStep;
  email: string;
  shippingAddress: Address | null;
  billingAddress: Address | null;
  useSameAddress: boolean;
  paymentMethod: string;
  isProcessing: boolean;
  error: string | null;
}

export enum CheckoutStep {
  SHIPPING = 'shipping',
  PAYMENT = 'payment',
  REVIEW = 'review',
  COMPLETE = 'complete',
}

export interface CheckoutFormData {
  email: string;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  paymentDetails?: PaymentDetails;
}

export interface PaymentDetails {
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  cardholderName?: string;
}

export interface CheckoutSummary {
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
    image?: string;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  itemCount: number;
}
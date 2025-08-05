import apiClient from '@/lib/api-client';
import { CreatePaymentIntentData, PaymentIntent, ConfirmPaymentData, PaymentResult } from '@/types/payment';

export class PaymentsAPI {
  static async createPaymentIntent(data: CreatePaymentIntentData): Promise<PaymentIntent> {
    const response = await apiClient.post('/payments/create-intent', data);
    return response.data;
  }

  static async confirmPayment(data: ConfirmPaymentData): Promise<PaymentResult> {
    try {
      const response = await apiClient.post('/payments/confirm', data);
      return {
        success: true,
        paymentIntent: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment confirmation failed',
      };
    }
  }

  static async retrievePaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    const response = await apiClient.get(`/payments/intent/${paymentIntentId}`);
    return response.data;
  }
}
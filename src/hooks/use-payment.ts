import { useState } from 'react';
import { PaymentsAPI } from '@/services/api/payments';
import { CreatePaymentIntentData, PaymentIntent } from '@/types/payment';

export function usePayment() {
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = async (data: CreatePaymentIntentData) => {
    setIsLoading(true);
    setError(null);

    try {
      const intent = await PaymentsAPI.createPaymentIntent(data);
      setPaymentIntent(intent);
      return intent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment intent';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmPayment = async (paymentIntentId: string, paymentMethodId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await PaymentsAPI.confirmPayment({
        paymentIntentId,
        paymentMethodId,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.paymentIntent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment confirmation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setPaymentIntent(null);
    setError(null);
    setIsLoading(false);
  };

  return {
    paymentIntent,
    isLoading,
    error,
    createPaymentIntent,
    confirmPayment,
    reset,
  };
}
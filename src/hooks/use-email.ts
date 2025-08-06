import { useState } from 'react';

interface EmailData {
  type: 'order_confirmation' | 'order_status_update' | 'welcome' | 'password_reset' | 'low_stock_alert';
  data: Record<string, any>;
}

export function useEmail() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = async (emailData: EmailData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send email';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const sendOrderConfirmation = async (orderData: any) => {
    return sendEmail({
      type: 'order_confirmation',
      data: orderData,
    });
  };

  const sendOrderStatusUpdate = async (orderData: any) => {
    return sendEmail({
      type: 'order_status_update',
      data: orderData,
    });
  };

  const sendWelcomeEmail = async (userData: any) => {
    return sendEmail({
      type: 'welcome',
      data: userData,
    });
  };

  const sendPasswordResetEmail = async (userData: any) => {
    return sendEmail({
      type: 'password_reset',
      data: userData,
    });
  };

  const sendLowStockAlert = async (productData: any) => {
    return sendEmail({
      type: 'low_stock_alert',
      data: productData,
    });
  };

  return {
    isLoading,
    error,
    sendEmail,
    sendOrderConfirmation,
    sendOrderStatusUpdate,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendLowStockAlert,
  };
}
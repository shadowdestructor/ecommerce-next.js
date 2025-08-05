'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MainLayout } from '@/components/layout/main-layout';
import { CheckoutSteps } from '@/components/checkout/checkout-steps';
import { ShippingForm } from '@/components/checkout/shipping-form';
import { PaymentForm } from '@/components/checkout/payment-form';
import { OrderReview } from '@/components/checkout/order-review';
import { useCheckoutStore } from '@/stores/checkout-store';
import { useCart } from '@/hooks/use-cart';
import { CheckoutStep } from '@/types/checkout';
import { OrdersAPI } from '@/services/api/orders';
import { CreateOrderData } from '@/types/order';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, summary, clearCart } = useCart();
  const [completedSteps, setCompletedSteps] = useState<CheckoutStep[]>([]);
  
  const {
    step,
    email,
    shippingAddress,
    billingAddress,
    useSameAddress,
    paymentMethod,
    isProcessing,
    error,
    setStep,
    setEmail,
    setShippingAddress,
    setBillingAddress,
    setUseSameAddress,
    setPaymentMethod,
    setProcessing,
    setError,
    nextStep,
    previousStep,
    reset,
  } = useCheckoutStore();

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, router]);

  // Set user email if logged in
  useEffect(() => {
    if (session?.user?.email && !email) {
      setEmail(session.user.email);
    }
  }, [session?.user?.email, email, setEmail]);

  const handleShippingSubmit = (data: any) => {
    setEmail(data.email);
    setShippingAddress(data.shippingAddress);
    setCompletedSteps(prev => [...prev.filter(s => s !== CheckoutStep.SHIPPING), CheckoutStep.SHIPPING]);
    nextStep();
  };

  const handlePaymentSubmit = (data: any) => {
    setPaymentMethod(data.paymentMethod);
    setUseSameAddress(data.useSameAddress);
    
    if (data.useSameAddress) {
      setBillingAddress(shippingAddress!);
    } else {
      setBillingAddress(data.billingAddress);
    }
    
    setCompletedSteps(prev => [...prev.filter(s => s !== CheckoutStep.PAYMENT), CheckoutStep.PAYMENT]);
    nextStep();
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress || !billingAddress) {
      setError('Missing address information');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const orderData: CreateOrderData = {
        email,
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: Number(item.variant?.price || item.product.price),
        })),
        shippingAddress,
        billingAddress,
        paymentMethod,
        subtotal: summary.subtotal,
        taxAmount: summary.tax,
        shippingAmount: summary.shipping,
        discountAmount: summary.discount,
        totalAmount: summary.total,
      };

      const order = await OrdersAPI.createOrder(orderData);
      
      // Clear cart and reset checkout
      clearCart();
      reset();
      
      // Redirect to success page
      router.push(`/checkout/success?order=${order.orderNumber}`);
    } catch (error) {
      console.error('Order creation failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  const handleEditShipping = () => {
    setStep(CheckoutStep.SHIPPING);
    setCompletedSteps(prev => prev.filter(s => s !== CheckoutStep.SHIPPING));
  };

  const handleEditPayment = () => {
    setStep(CheckoutStep.PAYMENT);
    setCompletedSteps(prev => prev.filter(s => s !== CheckoutStep.PAYMENT));
  };

  if (items.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">
            Complete your order in just a few simple steps
          </p>
        </div>

        {/* Progress Steps */}
        <CheckoutSteps currentStep={step} completedSteps={completedSteps} />

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {step === CheckoutStep.SHIPPING && (
            <ShippingForm
              initialData={{ email, shippingAddress }}
              onSubmit={handleShippingSubmit}
              isLoading={isProcessing}
            />
          )}

          {step === CheckoutStep.PAYMENT && shippingAddress && (
            <PaymentForm
              initialData={{ paymentMethod, billingAddress, useSameAddress }}
              shippingAddress={shippingAddress}
              onSubmit={handlePaymentSubmit}
              onBack={previousStep}
              isLoading={isProcessing}
            />
          )}

          {step === CheckoutStep.REVIEW && shippingAddress && billingAddress && (
            <OrderReview
              email={email}
              shippingAddress={shippingAddress}
              billingAddress={billingAddress}
              paymentMethod={paymentMethod}
              onEditShipping={handleEditShipping}
              onEditPayment={handleEditPayment}
              onPlaceOrder={handlePlaceOrder}
              isProcessing={isProcessing}
            />
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-1">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Your information is secure and encrypted</span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
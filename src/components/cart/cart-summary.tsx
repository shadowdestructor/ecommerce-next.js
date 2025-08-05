'use client';

import { Truck, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CartSummary as CartSummaryType } from '@/types/cart';

interface CartSummaryProps {
  summary: CartSummaryType;
  onCheckout?: () => void;
  isCheckoutDisabled?: boolean;
  showCouponInput?: boolean;
}

export function CartSummary({ 
  summary, 
  onCheckout, 
  isCheckoutDisabled = false,
  showCouponInput = true 
}: CartSummaryProps) {
  const freeShippingThreshold = 50;
  const remainingForFreeShipping = freeShippingThreshold - summary.subtotal;

  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>

      {/* Coupon Input */}
      {showCouponInput && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Promo Code
          </label>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter coupon code"
              className="flex-1"
            />
            <Button variant="outline" size="sm">
              <Tag className="h-4 w-4 mr-1" />
              Apply
            </Button>
          </div>
        </div>
      )}

      {/* Free Shipping Progress */}
      {summary.shipping > 0 && remainingForFreeShipping > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-center text-blue-700 text-sm">
            <Truck className="h-4 w-4 mr-2" />
            <span>
              Add ${remainingForFreeShipping.toFixed(2)} more for free shipping!
            </span>
          </div>
          <div className="mt-2 bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min((summary.subtotal / freeShippingThreshold) * 100, 100)}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Free Shipping Achieved */}
      {summary.shipping === 0 && summary.subtotal >= freeShippingThreshold && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center text-green-700 text-sm">
            <Truck className="h-4 w-4 mr-2" />
            <span>🎉 You qualify for free shipping!</span>
          </div>
        </div>
      )}

      {/* Summary Details */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Subtotal ({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'})
          </span>
          <span className="font-medium">${summary.subtotal.toFixed(2)}</span>
        </div>

        {summary.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="font-medium text-green-600">
              -${summary.discount.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">
            {summary.shipping === 0 ? 'Free' : `$${summary.shipping.toFixed(2)}`}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium">${summary.tax.toFixed(2)}</span>
        </div>

        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between">
            <span className="text-base font-semibold text-gray-900">Total</span>
            <span className="text-lg font-bold text-gray-900">
              ${summary.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      {onCheckout && (
        <Button
          onClick={onCheckout}
          disabled={isCheckoutDisabled || summary.itemCount === 0}
          className="w-full"
          size="lg"
        >
          {summary.itemCount === 0 ? 'Cart is Empty' : 'Proceed to Checkout'}
        </Button>
      )}

      {/* Security Badge */}
      <div className="text-center text-xs text-gray-500">
        <div className="flex items-center justify-center space-x-1">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>Secure checkout powered by SSL encryption</span>
        </div>
      </div>
    </div>
  );
}
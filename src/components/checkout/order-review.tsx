'use client';

import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CartSummary } from '@/components/cart/cart-summary';
import { useCart } from '@/hooks/use-cart';
import { Address } from '@/types/order';

interface OrderReviewProps {
  email: string;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  onEditShipping: () => void;
  onEditPayment: () => void;
  onPlaceOrder: () => void;
  isProcessing?: boolean;
}

export function OrderReview({
  email,
  shippingAddress,
  billingAddress,
  paymentMethod,
  onEditShipping,
  onEditPayment,
  onPlaceOrder,
  isProcessing = false,
}: OrderReviewProps) {
  const { items, summary } = useCart();

  const formatAddress = (address: Address) => {
    return [
      `${address.firstName} ${address.lastName}`,
      address.company,
      address.addressLine1,
      address.addressLine2,
      `${address.city}, ${address.state} ${address.postalCode}`,
      address.country,
      address.phone,
    ].filter(Boolean).join('\n');
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'credit_card':
        return 'Credit Card';
      case 'cash_on_delivery':
        return 'Cash on Delivery';
      default:
        return method;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Review Your Order
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Details */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">Contact Information</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEditShipping}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{email}</p>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">Shipping Address</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEditShipping}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="text-sm text-gray-600 whitespace-pre-line">
                {formatAddress(shippingAddress)}
              </pre>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">Billing Address</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEditPayment}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="text-sm text-gray-600 whitespace-pre-line">
                {formatAddress(billingAddress)}
              </pre>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">Payment Method</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEditPayment}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {getPaymentMethodLabel(paymentMethod)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3">
                {items.map((item) => {
                  const price = item.variant?.price || item.product.price;
                  const primaryImage = item.product.images[0];
                  
                  return (
                    <div key={item.id} className="flex items-center space-x-3">
                      {/* Product Image */}
                      <div className="relative w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        {primaryImage ? (
                          <img
                            src={primaryImage.url}
                            alt={primaryImage.altText || item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                        {/* Quantity Badge */}
                        <div className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </p>
                        {item.variant && (
                          <p className="text-xs text-gray-500">
                            {item.variant.option1Name && item.variant.option1Value && (
                              <span>{item.variant.option1Name}: {item.variant.option1Value}</span>
                            )}
                          </p>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-sm font-medium text-gray-900">
                        ${(Number(price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${summary.subtotal.toFixed(2)}</span>
                </div>
                
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
                
                {summary.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">
                      -${summary.discount.toFixed(2)}
                    </span>
                  </div>
                )}
                
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${summary.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Place Order Button */}
          <div className="mt-6">
            <Button
              onClick={onPlaceOrder}
              disabled={isProcessing || items.length === 0}
              className="w-full"
              size="lg"
            >
              {isProcessing ? 'Processing Order...' : `Place Order - $${summary.total.toFixed(2)}`}
            </Button>
            
            <p className="text-xs text-gray-500 text-center mt-2">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
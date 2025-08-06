'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { OrderWithItems } from '@/types/order';
import { OrderStatusBadge } from './order-status-badge';
import { OrderTrackingTimeline } from './order-tracking-timeline';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface OrderDetailClientProps {
  orderNumber: string;
  userId: string;
}

export function OrderDetailClient({ orderNumber, userId }: OrderDetailClientProps) {
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/orders/${orderNumber}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }

        const data = await response.json();
        setOrder(data.order);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (address: any) => {
    if (typeof address === 'string') {
      return address;
    }
    
    if (!address) return 'No address provided';
    
    return `${address.firstName} ${address.lastName}
${address.addressLine1}
${address.addressLine2 ? address.addressLine2 + '\\n' : ''}${address.city}, ${address.state} ${address.postalCode}
${address.country}`;
  };

  if (loading) {
    return <div>Loading order details...</div>;
  }

  if (error) {
    return (
      <div className=\"text-center py-12\">
        <div className=\"text-red-600 mb-4\">{error}</div>
        <Link
          href=\"/orders\"
          className=\"bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700\"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className=\"text-center py-12\">
        <div className=\"text-gray-500 mb-4\">Order not found</div>
        <Link
          href=\"/orders\"
          className=\"bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700\"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className=\"space-y-8\">
      {/* Header */}
      <div className=\"flex items-center gap-4\">
        <Link
          href=\"/orders\"
          className=\"flex items-center gap-2 text-gray-600 hover:text-gray-900\"
        >
          <ArrowLeftIcon className=\"w-5 h-5\" />
          Back to Orders
        </Link>
      </div>

      <div className=\"bg-white border border-gray-200 rounded-lg shadow-sm\">
        {/* Order Header */}
        <div className=\"p-6 border-b border-gray-200\">
          <div className=\"flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4\">
            <div>
              <h1 className=\"text-2xl font-bold text-gray-900 mb-2\">
                Order #{order.orderNumber}
              </h1>
              <div className=\"flex items-center gap-4\">
                <OrderStatusBadge status={order.status} size=\"lg\" />
                <span className=\"text-gray-600\">
                  Placed on {formatDate(order.createdAt)}
                </span>
              </div>
            </div>
            <div className=\"text-right\">
              <div className=\"text-2xl font-bold text-gray-900\">
                {formatCurrency(Number(order.totalAmount))}
              </div>
              <div className=\"text-gray-600\">
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Order Tracking */}
        <div className=\"p-6 border-b border-gray-200\">
          <h2 className=\"text-lg font-semibold text-gray-900 mb-4\">Order Status</h2>
          <OrderTrackingTimeline 
            status={order.status} 
            createdAt={order.createdAt}
            updatedAt={order.updatedAt}
          />
        </div>

        {/* Order Items */}
        <div className=\"p-6 border-b border-gray-200\">
          <h2 className=\"text-lg font-semibold text-gray-900 mb-4\">Items Ordered</h2>
          <div className=\"space-y-4\">
            {order.items.map((item) => (
              <div key={item.id} className=\"flex items-center gap-4 p-4 bg-gray-50 rounded-lg\">
                <div className=\"w-20 h-20 bg-white rounded-md overflow-hidden flex-shrink-0\">
                  {item.product.images[0] ? (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.images[0].alt || item.productName}
                      width={80}
                      height={80}
                      className=\"w-full h-full object-cover\"
                    />
                  ) : (
                    <div className=\"w-full h-full bg-gray-200 flex items-center justify-center\">
                      <span className=\"text-gray-400 text-xs\">No image</span>
                    </div>
                  )}
                </div>
                
                <div className=\"flex-1 min-w-0\">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className=\"text-lg font-medium text-gray-900 hover:text-blue-600 block\"
                  >
                    {item.productName}
                  </Link>
                  {item.variantName && (
                    <div className=\"text-sm text-gray-600 mt-1\">
                      Variant: {item.variantName}
                    </div>
                  )}
                  <div className=\"text-sm text-gray-600 mt-1\">
                    Quantity: {item.quantity}
                  </div>
                  <div className=\"text-sm text-gray-600 mt-1\">
                    Unit Price: {formatCurrency(Number(item.unitPrice))}
                  </div>
                </div>
                
                <div className=\"text-lg font-semibold text-gray-900\">
                  {formatCurrency(Number(item.totalPrice))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className=\"p-6 border-b border-gray-200\">
          <h2 className=\"text-lg font-semibold text-gray-900 mb-4\">Order Summary</h2>
          <div className=\"space-y-2 max-w-sm ml-auto\">
            <div className=\"flex justify-between text-gray-600\">
              <span>Subtotal:</span>
              <span>{formatCurrency(Number(order.subtotal))}</span>
            </div>
            <div className=\"flex justify-between text-gray-600\">
              <span>Shipping:</span>
              <span>{formatCurrency(Number(order.shippingAmount))}</span>
            </div>
            <div className=\"flex justify-between text-gray-600\">
              <span>Tax:</span>
              <span>{formatCurrency(Number(order.taxAmount))}</span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className=\"flex justify-between text-green-600\">
                <span>Discount:</span>
                <span>-{formatCurrency(Number(order.discountAmount))}</span>
              </div>
            )}
            <div className=\"border-t border-gray-200 pt-2\">
              <div className=\"flex justify-between text-lg font-semibold text-gray-900\">
                <span>Total:</span>
                <span>{formatCurrency(Number(order.totalAmount))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Info */}
        <div className=\"p-6\">
          <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-8\">
            {/* Shipping Address */}
            <div>
              <h3 className=\"text-lg font-semibold text-gray-900 mb-3\">Shipping Address</h3>
              <div className=\"text-gray-600 whitespace-pre-line\">
                {formatAddress(order.shippingAddress)}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h3 className=\"text-lg font-semibold text-gray-900 mb-3\">Payment Method</h3>
              <div className=\"text-gray-600\">
                {order.paymentMethod === 'credit_card' ? 'Credit Card' : 'Cash on Delivery'}
              </div>
              {order.paymentStatus && (
                <div className=\"mt-2\">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.paymentStatus === 'PAID' 
                      ? 'bg-green-100 text-green-800' 
                      : order.paymentStatus === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Actions */}
      <div className=\"flex flex-col sm:flex-row gap-4\">
        {order.status === 'DELIVERED' && (
          <button className=\"bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700\">
            Write a Review
          </button>
        )}
        {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
          <button className=\"bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700\">
            Cancel Order
          </button>
        )}
        <button className=\"border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50\">
          Contact Support
        </button>
      </div>
    </div>
  );
}
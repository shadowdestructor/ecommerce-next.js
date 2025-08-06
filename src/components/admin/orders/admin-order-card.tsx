'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { OrderWithItems } from '@/types/order';
import { OrderStatusBadge } from '@/components/orders/order-status-badge';
import { formatCurrency } from '@/lib/utils';
import { 
  EyeIcon, 
  EnvelopeIcon,
  ChevronDownIcon,
  ChevronUpIcon 
} from '@heroicons/react/24/outline';
import { OrderStatus, PaymentStatus } from '@prisma/client';

interface AdminOrderCardProps {
  order: OrderWithItems;
  onUpdate: () => void;
}

export function AdminOrderCard({ order, onUpdate }: AdminOrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const updateOrderStatus = async (newStatus: OrderStatus) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const updatePaymentStatus = async (newPaymentStatus: PaymentStatus) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canUpdateStatus = (currentStatus: OrderStatus, newStatus: OrderStatus) => {
    const statusFlow = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
      REFUNDED: [],
    };

    return statusFlow[currentStatus]?.includes(newStatus) || false;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Order Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <Link
                href={`/admin/orders/${order.orderNumber}`}
                className="text-lg font-semibold text-blue-600 hover:text-blue-800"
              >
                Order #{order.orderNumber}
              </Link>
              <OrderStatusBadge status={order.status} />
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                {order.paymentStatus}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Customer: {order.email}</div>
              <div>Placed: {formatDate(order.createdAt)}</div>
              <div>Payment: {order.paymentMethod === 'credit_card' ? 'Credit Card' : 'Cash on Delivery'}</div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xl font-semibold text-gray-900">
              {formatCurrency(Number(order.totalAmount))}
            </div>
            <div className="text-sm text-gray-600">
              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={order.status}
              onChange={(e) => updateOrderStatus(e.target.value as OrderStatus)}
              disabled={isUpdating}
              className="text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED" disabled={!canUpdateStatus(order.status, 'CONFIRMED')}>
                Confirmed
              </option>
              <option value="PROCESSING" disabled={!canUpdateStatus(order.status, 'PROCESSING')}>
                Processing
              </option>
              <option value="SHIPPED" disabled={!canUpdateStatus(order.status, 'SHIPPED')}>
                Shipped
              </option>
              <option value="DELIVERED" disabled={!canUpdateStatus(order.status, 'DELIVERED')}>
                Delivered
              </option>
              <option value="CANCELLED" disabled={!canUpdateStatus(order.status, 'CANCELLED')}>
                Cancelled
              </option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Payment:</label>
            <select
              value={order.paymentStatus}
              onChange={(e) => updatePaymentStatus(e.target.value as PaymentStatus)}
              disabled={isUpdating}
              className="text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Link
              href={`/admin/orders/${order.orderNumber}`}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              View Details
            </Link>
            
            <button
              onClick={() => {/* TODO: Send email */}}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              <EnvelopeIcon className="h-4 w-4 mr-1" />
              Email Customer
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              {isExpanded ? (
                <>
                  <ChevronUpIcon className="h-4 w-4 mr-1" />
                  Hide Items
                </>
              ) : (
                <>
                  <ChevronDownIcon className="h-4 w-4 mr-1" />
                  Show Items
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Order Items (Expandable) */}
      {isExpanded && (
        <div className="p-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Order Items</h4>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {item.product.images[0] ? (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.images[0].alt || item.productName}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {item.productName}
                  </div>
                  {item.variantName && (
                    <div className="text-xs text-gray-600 mt-1">
                      {item.variantName}
                    </div>
                  )}
                  <div className="text-xs text-gray-600 mt-1">
                    Qty: {item.quantity} × {formatCurrency(Number(item.unitPrice))}
                  </div>
                </div>
                
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(Number(item.totalPrice))}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="space-y-1 text-sm max-w-xs ml-auto">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>{formatCurrency(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span>{formatCurrency(Number(order.shippingAmount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span>{formatCurrency(Number(order.taxAmount))}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(Number(order.discountAmount))}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-200">
                <span>Total:</span>
                <span>{formatCurrency(Number(order.totalAmount))}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
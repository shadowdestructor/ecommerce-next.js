'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { OrderWithItems } from '@/types/order';
import { OrderStatusBadge } from './order-status-badge';
import { formatCurrency } from '@/lib/utils';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface OrderCardProps {
  order: OrderWithItems;
}

export function OrderCard({ order }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getItemsPreview = () => {
    const maxItems = 3;
    const visibleItems = order.items.slice(0, maxItems);
    const remainingCount = order.items.length - maxItems;

    return { visibleItems, remainingCount };
  };

  const { visibleItems, remainingCount } = getItemsPreview();

  return (
    <div className=\"bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow\">
      {/* Order Header */}
      <div className=\"p-6 border-b border-gray-200\">
        <div className=\"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4\">
          <div className=\"flex-1\">
            <div className=\"flex items-center gap-4 mb-2\">
              <Link
                href={`/orders/${order.orderNumber}`}
                className=\"text-lg font-semibold text-blue-600 hover:text-blue-800\"
              >
                Order #{order.orderNumber}
              </Link>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className=\"text-sm text-gray-600\">
              Placed on {formatDate(order.createdAt)}
            </div>
          </div>
          
          <div className=\"text-right\">
            <div className=\"text-lg font-semibold text-gray-900\">
              {formatCurrency(Number(order.totalAmount))}
            </div>
            <div className=\"text-sm text-gray-600\">
              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Items Preview */}
      <div className=\"p-6\">
        <div className=\"space-y-3\">
          {visibleItems.map((item) => (
            <div key={item.id} className=\"flex items-center gap-4\">
              <div className=\"w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0\">
                {item.product.images[0] ? (
                  <Image
                    src={item.product.images[0].url}
                    alt={item.product.images[0].alt || item.productName}
                    width={64}
                    height={64}
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
                  className=\"text-sm font-medium text-gray-900 hover:text-blue-600 truncate block\"
                >
                  {item.productName}
                </Link>
                {item.variantName && (
                  <div className=\"text-xs text-gray-600 mt-1\">
                    {item.variantName}
                  </div>
                )}
                <div className=\"text-xs text-gray-600 mt-1\">
                  Qty: {item.quantity}
                </div>
              </div>
              
              <div className=\"text-sm font-medium text-gray-900\">
                {formatCurrency(Number(item.totalPrice))}
              </div>
            </div>
          ))}

          {remainingCount > 0 && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className=\"flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mt-3\"
            >
              <span>Show {remainingCount} more item{remainingCount !== 1 ? 's' : ''}</span>
              <ChevronDownIcon className=\"w-4 h-4\" />
            </button>
          )}

          {isExpanded && (
            <>
              {order.items.slice(3).map((item) => (
                <div key={item.id} className=\"flex items-center gap-4\">
                  <div className=\"w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0\">
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.images[0].alt || item.productName}
                        width={64}
                        height={64}
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
                      className=\"text-sm font-medium text-gray-900 hover:text-blue-600 truncate block\"
                    >
                      {item.productName}
                    </Link>
                    {item.variantName && (
                      <div className=\"text-xs text-gray-600 mt-1\">
                        {item.variantName}
                      </div>
                    )}
                    <div className=\"text-xs text-gray-600 mt-1\">
                      Qty: {item.quantity}
                    </div>
                  </div>
                  
                  <div className=\"text-sm font-medium text-gray-900\">
                    {formatCurrency(Number(item.totalPrice))}
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => setIsExpanded(false)}
                className=\"flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mt-3\"
              >
                <span>Show less</span>
                <ChevronUpIcon className=\"w-4 h-4\" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Order Actions */}
      <div className=\"px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg\">
        <div className=\"flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center\">
          <div className=\"flex gap-3\">
            <Link
              href={`/orders/${order.orderNumber}`}
              className=\"text-sm text-blue-600 hover:text-blue-800 font-medium\"
            >
              View Details
            </Link>
            {order.status === 'DELIVERED' && (
              <button className=\"text-sm text-gray-600 hover:text-gray-800\">
                Write Review
              </button>
            )}
            {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
              <button className=\"text-sm text-red-600 hover:text-red-800\">
                Cancel Order
              </button>
            )}
          </div>
          
          {(order.status === 'SHIPPED' || order.status === 'PROCESSING') && (
            <div className=\"text-sm text-gray-600\">
              Track your package
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
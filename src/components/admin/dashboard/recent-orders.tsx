'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { OrderWithItems } from '@/types/order';
import { OrderStatusBadge } from '@/components/orders/order-status-badge';
import { formatCurrency } from '@/lib/utils';

export function RecentOrders() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/recent-orders');
        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders);
        }
      } catch (error) {
        console.error('Error fetching recent orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, []);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className=\"bg-white shadow rounded-lg\">
        <div className=\"px-4 py-5 sm:p-6\">
          <h3 className=\"text-lg leading-6 font-medium text-gray-900 mb-4\">
            Recent Orders
          </h3>
          <div className=\"space-y-4\">
            {[...Array(5)].map((_, i) => (
              <div key={i} className=\"flex items-center justify-between animate-pulse\">
                <div className=\"flex items-center space-x-4\">
                  <div className=\"h-4 bg-gray-200 rounded w-24\"></div>
                  <div className=\"h-4 bg-gray-200 rounded w-32\"></div>
                  <div className=\"h-6 bg-gray-200 rounded-full w-20\"></div>
                </div>
                <div className=\"h-4 bg-gray-200 rounded w-16\"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=\"bg-white shadow rounded-lg\">
      <div className=\"px-4 py-5 sm:p-6\">
        <div className=\"flex items-center justify-between mb-4\">
          <h3 className=\"text-lg leading-6 font-medium text-gray-900\">
            Recent Orders
          </h3>
          <Link
            href=\"/admin/orders\"
            className=\"text-sm font-medium text-blue-600 hover:text-blue-500\"
          >
            View all
          </Link>
        </div>
        
        {orders.length === 0 ? (
          <p className=\"text-gray-500 text-center py-4\">No recent orders</p>
        ) : (
          <div className=\"space-y-4\">
            {orders.map((order) => (
              <div
                key={order.id}
                className=\"flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50\"
              >
                <div className=\"flex items-center space-x-4\">
                  <div>
                    <Link
                      href={`/admin/orders/${order.orderNumber}`}
                      className=\"text-sm font-medium text-blue-600 hover:text-blue-500\"
                    >
                      #{order.orderNumber}
                    </Link>
                    <p className=\"text-xs text-gray-500\">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className=\"text-sm text-gray-900\">{order.email}</p>
                    <p className=\"text-xs text-gray-500\">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} size=\"sm\" />
                </div>
                <div className=\"text-right\">
                  <p className=\"text-sm font-medium text-gray-900\">
                    {formatCurrency(Number(order.totalAmount))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
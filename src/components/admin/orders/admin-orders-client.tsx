'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { AdminOrderCard } from './admin-order-card';
import { AdminOrdersFilter } from './admin-orders-filter';
import { AdminOrdersSearch } from './admin-orders-search';
import { Pagination } from '@/components/ui/pagination';
import { OrderWithItems } from '@/types/order';

interface OrdersResponse {
  orders: OrderWithItems[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function AdminOrdersClient() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [pagination, setPagination] = useState<OrdersResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentStatus = searchParams.get('status') || '';
  const currentPaymentStatus = searchParams.get('paymentStatus') || '';
  const currentSearch = searchParams.get('search') || '';

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '10');
      
      if (currentStatus) params.set('status', currentStatus);
      if (currentPaymentStatus) params.set('paymentStatus', currentPaymentStatus);
      if (currentSearch) params.set('search', currentSearch);

      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data: OrdersResponse = await response.json();
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, currentStatus, currentPaymentStatus, currentSearch]);

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    if (key !== 'page') {
      params.set('page', '1');
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleStatusFilter = (status: string) => {
    updateSearchParams('status', status);
  };

  const handlePaymentStatusFilter = (paymentStatus: string) => {
    updateSearchParams('paymentStatus', paymentStatus);
  };

  const handleSearch = (search: string) => {
    updateSearchParams('search', search);
  };

  const handlePageChange = (page: number) => {
    updateSearchParams('page', page.toString());
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse flex-1"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchOrders}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <AdminOrdersSearch
          value={currentSearch}
          onChange={handleSearch}
          className="flex-1"
        />
        <AdminOrdersFilter
          statusValue={currentStatus}
          paymentStatusValue={currentPaymentStatus}
          onStatusChange={handleStatusFilter}
          onPaymentStatusChange={handlePaymentStatusFilter}
        />
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {currentSearch || currentStatus || currentPaymentStatus
              ? 'No orders found matching your criteria.'
              : 'No orders found.'}
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <AdminOrderCard 
                key={order.id} 
                order={order} 
                onUpdate={fetchOrders}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              hasNext={pagination.hasNext}
              hasPrev={pagination.hasPrev}
            />
          )}
        </>
      )}
    </div>
  );
}
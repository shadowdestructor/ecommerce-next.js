'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { OrderCard } from './order-card';
import { OrdersFilter } from './orders-filter';
import { OrdersSearch } from './orders-search';
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

interface OrdersClientProps {
  userId: string;
}

export function OrdersClient({ userId }: OrdersClientProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [pagination, setPagination] = useState<OrdersResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentStatus = searchParams.get('status') || '';
  const currentSearch = searchParams.get('search') || '';

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '10');
      
      if (currentStatus) {
        params.set('status', currentStatus);
      }
      
      if (currentSearch) {
        params.set('search', currentSearch);
      }

      const response = await fetch(`/api/orders?${params.toString()}`);
      
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
  }, [currentPage, currentStatus, currentSearch]);

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to page 1 when filtering
    if (key !== 'page') {
      params.set('page', '1');
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleStatusFilter = (status: string) => {
    updateSearchParams('status', status);
  };

  const handleSearch = (search: string) => {
    updateSearchParams('search', search);
  };

  const handlePageChange = (page: number) => {
    updateSearchParams('page', page.toString());
  };

  if (loading) {
    return (
      <div className=\"space-y-6\">
        <div className=\"flex flex-col sm:flex-row gap-4\">
          <div className=\"h-10 bg-gray-200 rounded animate-pulse flex-1\"></div>
          <div className=\"h-10 bg-gray-200 rounded animate-pulse w-32\"></div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className=\"h-48 bg-gray-200 rounded-lg animate-pulse\"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className=\"text-center py-12\">
        <div className=\"text-red-600 mb-4\">{error}</div>
        <button
          onClick={fetchOrders}
          className=\"bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700\"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className=\"space-y-6\">
      {/* Filters and Search */}
      <div className=\"flex flex-col sm:flex-row gap-4\">
        <OrdersSearch
          value={currentSearch}
          onChange={handleSearch}
          className=\"flex-1\"
        />
        <OrdersFilter
          value={currentStatus}
          onChange={handleStatusFilter}
        />
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className=\"text-center py-12\">
          <div className=\"text-gray-500 mb-4\">
            {currentSearch || currentStatus
              ? 'No orders found matching your criteria.'
              : 'You haven\\'t placed any orders yet.'}
          </div>
          {!currentSearch && !currentStatus && (
            <button
              onClick={() => router.push('/products')}
              className=\"bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700\"
            >
              Start Shopping
            </button>
          )}
        </div>
      ) : (
        <>
          <div className=\"space-y-4\">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
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
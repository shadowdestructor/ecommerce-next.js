import { Suspense } from 'react';
import { AdminOrdersClient } from '@/components/admin/orders/admin-orders-client';
import { AdminOrdersLoading } from '@/components/admin/orders/admin-orders-loading';

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage customer orders, update status, and track fulfillment.
        </p>
      </div>

      <Suspense fallback={<AdminOrdersLoading />}>
        <AdminOrdersClient />
      </Suspense>
    </div>
  );
}
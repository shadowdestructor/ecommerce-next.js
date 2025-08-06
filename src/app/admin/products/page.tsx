import { Suspense } from 'react';
import Link from 'next/link';
import { AdminProductsClient } from '@/components/admin/products/admin-products-client';
import { AdminProductsLoading } from '@/components/admin/products/admin-products-loading';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your product catalog, inventory, and pricing.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Product
        </Link>
      </div>

      <Suspense fallback={<AdminProductsLoading />}>
        <AdminProductsClient />
      </Suspense>
    </div>
  );
}
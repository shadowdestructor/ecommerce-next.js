import { Suspense } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProductList } from '@/components/product/product-list';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function ProductsPage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">All Products</h1>
          <p className="text-gray-600">
            Discover our complete collection of high-quality products
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          <ProductList showPagination={true} />
        </Suspense>
      </div>
    </MainLayout>
  );
}
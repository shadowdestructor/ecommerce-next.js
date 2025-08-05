'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from './product-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { ProductWithRelations, ProductFilters } from '@/types/product';
import { ProductsAPI } from '@/services/api/products';

interface ProductListProps {
  initialProducts?: ProductWithRelations[];
  filters?: ProductFilters;
  showPagination?: boolean;
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  favoriteProductIds?: string[];
}

export function ProductList({
  initialProducts = [],
  filters = {},
  showPagination = true,
  onAddToCart,
  onToggleFavorite,
  favoriteProductIds = [],
}: ProductListProps) {
  const [products, setProducts] = useState<ProductWithRelations[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const fetchProducts = async (newFilters: ProductFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await ProductsAPI.getProducts({
        ...filters,
        ...newFilters,
      });

      setProducts(result.products);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialProducts.length === 0) {
      fetchProducts();
    }
  }, []);

  const handlePageChange = (newPage: number) => {
    fetchProducts({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (productId: string) => {
    onAddToCart?.(productId);
    // TODO: Show success toast
  };

  const handleToggleFavorite = (productId: string) => {
    onToggleFavorite?.(productId);
    // TODO: Show success toast
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => fetchProducts()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">No products found</p>
        <p className="text-gray-400">
          Try adjusting your search criteria or browse our categories
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={favoriteProductIds.includes(product.id)}
          />
        ))}
      </div>

      {/* Loading Overlay */}
      {loading && products.length > 0 && (
        <div className="flex justify-center py-4">
          <LoadingSpinner />
        </div>
      )}

      {/* Pagination */}
      {showPagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrev || loading}
          >
            Previous
          </Button>

          <div className="flex space-x-1">
            {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
              const pageNumber = Math.max(
                1,
                Math.min(
                  pagination.page - 2 + index,
                  pagination.totalPages - 4 + index
                )
              );

              if (pageNumber > pagination.totalPages) return null;

              return (
                <Button
                  key={pageNumber}
                  variant={pageNumber === pagination.page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNumber)}
                  disabled={loading}
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNext || loading}
          >
            Next
          </Button>
        </div>
      )}

      {/* Results Info */}
      <div className="text-center text-sm text-gray-500">
        Showing {products.length} of {pagination.total} products
      </div>
    </div>
  );
}
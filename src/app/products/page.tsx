'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Filter, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductGrid } from '@/components/product/product-grid';
import { ProductFilters } from '@/components/product/product-filters';
import { Product } from '@/types/product';

interface ProductsPageData {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filterOptions: {
    categories: Array<{ id: string; name: string; count: number }>;
    brands: Array<{ name: string; count: number }>;
    priceRange: { min: number; max: number };
  };
}

export default function ProductsPage() {
  const [data, setData] = useState<ProductsPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const searchParams = useSearchParams();
  const router = useRouter();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams);
      const response = await fetch(`/api/products?${params.toString()}`);
      
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    const [sortBy, sortOrder] = value.split('-');
    
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    params.delete('page'); // Reset to first page
    
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleFiltersChange = (filters: any) => {
    // This is handled by the ProductFilters component
  };

  const getCurrentSort = () => {
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    return `${sortBy}-${sortOrder}`;
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchParams.get('categories')) count++;
    if (searchParams.get('brands')) count++;
    if (searchParams.get('minPrice') || searchParams.get('maxPrice')) count++;
    if (searchParams.get('rating')) count++;
    if (searchParams.get('inStock')) count++;
    if (searchParams.get('onSale')) count++;
    return count;
  };

  const searchQuery = searchParams.get('search');
  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {searchQuery ? `"${searchQuery}" için sonuçlar` : 'Tüm Ürünler'}
            </h1>
            {data && (
              <p className="text-gray-600 mt-1">
                {data.pagination.totalCount} ürün bulundu
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="hidden md:flex border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-3"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Sort Dropdown */}
            <Select value={getCurrentSort()} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sırala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">En Yeni</SelectItem>
                <SelectItem value="createdAt-asc">En Eski</SelectItem>
                <SelectItem value="price-asc">Fiyat: Düşükten Yükseğe</SelectItem>
                <SelectItem value="price-desc">Fiyat: Yüksekten Düşüğe</SelectItem>
                <SelectItem value="name-asc">İsim: A-Z</SelectItem>
                <SelectItem value="name-desc">İsim: Z-A</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtreler
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Active Search Query */}
        {searchQuery && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-500">Aranan:</span>
            <Badge variant="secondary" className="gap-1">
              {searchQuery}
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.delete('search');
                  router.push(`?${params.toString()}`);
                }}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                ×
              </button>
            </Badge>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
          <div className="sticky top-4">
            {data?.filterOptions && (
              <ProductFilters
                options={data.filterOptions}
                onFiltersChange={handleFiltersChange}
              />
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <ProductGrid products={[]} loading={true} />
          ) : data?.products ? (
            <>
              <ProductGrid products={data.products} />
              
              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <Card className="mt-8">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Sayfa {data.pagination.page} / {data.pagination.totalPages}
                        {' '}({data.pagination.totalCount} ürün)
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(data.pagination.page - 1)}
                          disabled={!data.pagination.hasPrev}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Önceki
                        </Button>
                        
                        {/* Page Numbers */}
                        <div className="hidden sm:flex items-center gap-1">
                          {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                            const pageNum = Math.max(1, data.pagination.page - 2) + i;
                            if (pageNum > data.pagination.totalPages) return null;
                            
                            return (
                              <Button
                                key={pageNum}
                                variant={pageNum === data.pagination.page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                className="w-10"
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(data.pagination.page + 1)}
                          disabled={!data.pagination.hasNext}
                        >
                          Sonraki
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ürün bulunamadı
              </h3>
              <p className="text-gray-600">
                Arama kriterlerinizi değiştirmeyi deneyin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
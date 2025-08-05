'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProductFilters } from '@/types/product';

interface ProductFiltersProps {
  onFiltersChange: (filters: ProductFilters) => void;
  initialFilters?: ProductFilters;
  className?: string;
}

export function ProductFiltersComponent({ 
  onFiltersChange, 
  initialFilters = {},
  className = '' 
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    minPrice: undefined,
    maxPrice: undefined,
    brand: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [brands] = useState([
    'Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG', 'BasicWear'
  ]); // TODO: Fetch from API

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters: ProductFilters = {
      search: searchParams.get('search') || '',
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      brand: searchParams.get('brand') || '',
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    };

    setFilters(urlFilters);
    onFiltersChange(urlFilters);
  }, [searchParams]);

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Update URL
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });
    
    router.push(`?${params.toString()}`, { scroll: false });
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters: ProductFilters = {
      search: '',
      minPrice: undefined,
      maxPrice: undefined,
      brand: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    
    setFilters(clearedFilters);
    router.push(window.location.pathname, { scroll: false });
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.minPrice !== undefined) count++;
    if (filters.maxPrice !== undefined) count++;
    if (filters.brand) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={className}>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <X className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-45' : ''}`} />
        </Button>
      </div>

      {/* Filters Panel */}
      <div className={`space-y-6 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        {/* Search */}
        <div>
          <Label htmlFor="search" className="text-sm font-medium mb-2 block">
            Search Products
          </Label>
          <Input
            id="search"
            type="text"
            placeholder="Search by name, description..."
            value={filters.search || ''}
            onChange={(e) => updateFilters({ search: e.target.value })}
          />
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Price Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={(e) => updateFilters({ 
                  minPrice: e.target.value ? Number(e.target.value) : undefined 
                })}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={(e) => updateFilters({ 
                  maxPrice: e.target.value ? Number(e.target.value) : undefined 
                })}
              />
            </div>
          </div>
        </div>

        {/* Brand */}
        <div>
          <Label htmlFor="brand" className="text-sm font-medium mb-2 block">
            Brand
          </Label>
          <Select
            value={filters.brand || ''}
            onChange={(e) => updateFilters({ brand: e.target.value })}
          >
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </Select>
        </div>

        {/* Sort */}
        <div>
          <Label htmlFor="sort" className="text-sm font-medium mb-2 block">
            Sort By
          </Label>
          <Select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              updateFilters({ 
                sortBy: sortBy as any, 
                sortOrder: sortOrder as any 
              });
            }}
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="price-asc">Price Low to High</option>
            <option value="price-desc">Price High to Low</option>
            <option value="featured-desc">Featured First</option>
          </Select>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Active Filters</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {filters.search}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilters({ search: '' })}
                  />
                </Badge>
              )}
              {filters.minPrice !== undefined && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Min: ${filters.minPrice}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilters({ minPrice: undefined })}
                  />
                </Badge>
              )}
              {filters.maxPrice !== undefined && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Max: ${filters.maxPrice}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilters({ maxPrice: undefined })}
                  />
                </Badge>
              )}
              {filters.brand && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Brand: {filters.brand}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilters({ brand: '' })}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Clear Filters Button */}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full"
          >
            Clear All Filters
          </Button>
        )}
      </div>
    </div>
  );
}
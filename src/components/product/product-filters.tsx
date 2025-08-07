'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Filter, Star } from 'lucide-react';

interface FilterOptions {
  categories: Array<{ id: string; name: string; count: number }>;
  brands: Array<{ name: string; count: number }>;
  priceRange: { min: number; max: number };
}

interface ProductFiltersProps {
  options: FilterOptions;
  onFiltersChange: (filters: any) => void;
  className?: string;
}

export function ProductFilters({ options, onFiltersChange, className }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState({
    categories: [] as string[],
    brands: [] as string[],
    priceRange: [options.priceRange.min, options.priceRange.max],
    rating: 0,
    inStock: false,
    onSale: false,
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    // Initialize filters from URL params
    const categories = searchParams.get('categories')?.split(',') || [];
    const brands = searchParams.get('brands')?.split(',') || [];
    const minPrice = parseInt(searchParams.get('minPrice') || options.priceRange.min.toString());
    const maxPrice = parseInt(searchParams.get('maxPrice') || options.priceRange.max.toString());
    const rating = parseInt(searchParams.get('rating') || '0');
    const inStock = searchParams.get('inStock') === 'true';
    const onSale = searchParams.get('onSale') === 'true';

    setFilters({
      categories,
      brands,
      priceRange: [minPrice, maxPrice],
      rating,
      inStock,
      onSale,
    });
  }, [searchParams, options.priceRange]);

  useEffect(() => {
    // Count active filters
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.brands.length > 0) count++;
    if (filters.priceRange[0] !== options.priceRange.min || filters.priceRange[1] !== options.priceRange.max) count++;
    if (filters.rating > 0) count++;
    if (filters.inStock) count++;
    if (filters.onSale) count++;
    
    setActiveFiltersCount(count);
    onFiltersChange(filters);
  }, [filters, options.priceRange, onFiltersChange]);

  const updateURL = (newFilters: typeof filters) => {
    const params = new URLSearchParams(searchParams);
    
    // Update URL parameters
    if (newFilters.categories.length > 0) {
      params.set('categories', newFilters.categories.join(','));
    } else {
      params.delete('categories');
    }
    
    if (newFilters.brands.length > 0) {
      params.set('brands', newFilters.brands.join(','));
    } else {
      params.delete('brands');
    }
    
    if (newFilters.priceRange[0] !== options.priceRange.min) {
      params.set('minPrice', newFilters.priceRange[0].toString());
    } else {
      params.delete('minPrice');
    }
    
    if (newFilters.priceRange[1] !== options.priceRange.max) {
      params.set('maxPrice', newFilters.priceRange[1].toString());
    } else {
      params.delete('maxPrice');
    }
    
    if (newFilters.rating > 0) {
      params.set('rating', newFilters.rating.toString());
    } else {
      params.delete('rating');
    }
    
    if (newFilters.inStock) {
      params.set('inStock', 'true');
    } else {
      params.delete('inStock');
    }
    
    if (newFilters.onSale) {
      params.set('onSale', 'true');
    } else {
      params.delete('onSale');
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, categoryId]
      : filters.categories.filter(id => id !== categoryId);
    
    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked
      ? [...filters.brands, brand]
      : filters.brands.filter(b => b !== brand);
    
    const newFilters = { ...filters, brands: newBrands };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handlePriceRangeChange = (value: number[]) => {
    const newFilters = { ...filters, priceRange: value };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handleRatingChange = (rating: number) => {
    const newFilters = { ...filters, rating };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const clearAllFilters = () => {
    const newFilters = {
      categories: [],
      brands: [],
      priceRange: [options.priceRange.min, options.priceRange.max],
      rating: 0,
      inStock: false,
      onSale: false,
    };
    setFilters(newFilters);
    router.push(window.location.pathname);
  };

  const removeFilter = (type: string, value?: string) => {
    let newFilters = { ...filters };
    
    switch (type) {
      case 'category':
        newFilters.categories = filters.categories.filter(c => c !== value);
        break;
      case 'brand':
        newFilters.brands = filters.brands.filter(b => b !== value);
        break;
      case 'price':
        newFilters.priceRange = [options.priceRange.min, options.priceRange.max];
        break;
      case 'rating':
        newFilters.rating = 0;
        break;
      case 'inStock':
        newFilters.inStock = false;
        break;
      case 'onSale':
        newFilters.onSale = false;
        break;
    }
    
    setFilters(newFilters);
    updateURL(newFilters);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          <h3 className="font-semibold">Filtreler</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount}</Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Temizle
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Aktif Filtreler</Label>
          <div className="flex flex-wrap gap-2">
            {filters.categories.map(categoryId => {
              const category = options.categories.find(c => c.id === categoryId);
              return category ? (
                <Badge key={categoryId} variant="secondary" className="gap-1">
                  {category.name}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeFilter('category', categoryId)}
                  />
                </Badge>
              ) : null;
            })}
            
            {filters.brands.map(brand => (
              <Badge key={brand} variant="secondary" className="gap-1">
                {brand}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeFilter('brand', brand)}
                />
              </Badge>
            ))}
            
            {(filters.priceRange[0] !== options.priceRange.min || filters.priceRange[1] !== options.priceRange.max) && (
              <Badge variant="secondary" className="gap-1">
                {filters.priceRange[0]}₺ - {filters.priceRange[1]}₺
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeFilter('price')}
                />
              </Badge>
            )}
            
            {filters.rating > 0 && (
              <Badge variant="secondary" className="gap-1">
                {filters.rating}+ Yıldız
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeFilter('rating')}
                />
              </Badge>
            )}
            
            {filters.inStock && (
              <Badge variant="secondary" className="gap-1">
                Stokta Var
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeFilter('inStock')}
                />
              </Badge>
            )}
            
            {filters.onSale && (
              <Badge variant="secondary" className="gap-1">
                İndirimde
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeFilter('onSale')}
                />
              </Badge>
            )}
          </div>
        </div>
      )}

      <Separator />

      {/* Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Kategoriler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {options.categories.map(category => (
            <div key={category.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={filters.categories.includes(category.id)}
                  onCheckedChange={(checked) => 
                    handleCategoryChange(category.id, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`category-${category.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {category.name}
                </Label>
              </div>
              <span className="text-xs text-gray-500">({category.count})</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Fiyat Aralığı</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            value={filters.priceRange}
            onValueChange={handlePriceRangeChange}
            max={options.priceRange.max}
            min={options.priceRange.min}
            step={10}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm">
            <span>{filters.priceRange[0]}₺</span>
            <span>{filters.priceRange[1]}₺</span>
          </div>
        </CardContent>
      </Card>

      {/* Brands */}
      {options.brands.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Markalar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {options.brands.map(brand => (
              <div key={brand.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand.name}`}
                    checked={filters.brands.includes(brand.name)}
                    onCheckedChange={(checked) => 
                      handleBrandChange(brand.name, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`brand-${brand.name}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {brand.name}
                  </Label>
                </div>
                <span className="text-xs text-gray-500">({brand.count})</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Rating */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Değerlendirme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[4, 3, 2, 1].map(rating => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={filters.rating === rating}
                onCheckedChange={(checked) => 
                  handleRatingChange(checked ? rating : 0)
                }
              />
              <Label 
                htmlFor={`rating-${rating}`}
                className="flex items-center space-x-1 cursor-pointer"
              >
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm">ve üzeri</span>
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Other Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Diğer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="inStock"
              checked={filters.inStock}
              onCheckedChange={(checked) => {
                const newFilters = { ...filters, inStock: checked as boolean };
                setFilters(newFilters);
                updateURL(newFilters);
              }}
            />
            <Label htmlFor="inStock" className="text-sm font-normal cursor-pointer">
              Stokta var
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="onSale"
              checked={filters.onSale}
              onCheckedChange={(checked) => {
                const newFilters = { ...filters, onSale: checked as boolean };
                setFilters(newFilters);
                updateURL(newFilters);
              }}
            />
            <Label htmlFor="onSale" className="text-sm font-normal cursor-pointer">
              İndirimde
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ProductGrid } from '@/components/product/product-grid';
import { ProductFilters } from '@/components/product/product-filters';
import { Product } from '@/types/product';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parent?: {
    id: string;
    name: string;
    slug: string;
  };
  children: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

interface CategoryPageData {
  category: Category;
  products: Product[];
  filterOptions: {
    categories: Array<{ id: string; name: string; count: number }>;
    brands: Array<{ name: string; count: number }>;
    priceRange: { min: number; max: number };
  };
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [data, setData] = useState<CategoryPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const response = await fetch(`/api/categories/${slug}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategoryData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <ProductGrid products={[]} loading={true} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Kategori bulunamadı</h1>
        <p className="text-gray-600">Aradığınız kategori mevcut değil.</p>
      </div>
    );
  }

  const { category, products, filterOptions } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-700">Ana Sayfa</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/categories" className="hover:text-gray-700">Kategoriler</Link>
        {category.parent && (
          <>
            <ChevronRight className="w-4 h-4" />
            <Link 
              href={`/categories/${category.parent.slug}`} 
              className="hover:text-gray-700"
            >
              {category.parent.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-gray-600 text-lg leading-relaxed">
            {category.description}
          </p>
        )}
        
        {/* Subcategories */}
        {category.children.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Alt Kategoriler</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/categories/${child.slug}`}
                  className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow text-center"
                >
                  <h3 className="font-medium text-gray-900">{child.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Products Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:block hidden">
          <div className="sticky top-4">
            <ProductFilters
              options={filterOptions}
              onFiltersChange={() => {}}
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              Ürünler ({products.length})
            </h2>
          </div>
          
          <ProductGrid products={products} />
          
          {products.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Bu kategoride henüz ürün yok
              </h3>
              <p className="text-gray-600">
                Yakında yeni ürünler eklenecek.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
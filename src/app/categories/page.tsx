'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  productCount: number;
  children: Array<{
    id: string;
    name: string;
    slug: string;
    productCount: number;
  }>;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Tüm Kategoriler
        </h1>
        <p className="text-gray-600 text-lg">
          Geniş ürün yelpazemizde aradığınızı bulun
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
            <Link href={`/categories/${category.slug}`}>
              <div className="relative aspect-video bg-gray-100">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <div className="text-4xl">📦</div>
                  </div>
                )}
                
                {/* Product Count Badge */}
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-white/90">
                    {category.productCount} ürün
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                
                {category.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {category.description}
                  </p>
                )}

                {/* Subcategories */}
                {category.children.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Alt Kategoriler:</h4>
                    <div className="flex flex-wrap gap-2">
                      {category.children.slice(0, 3).map((child) => (
                        <Badge key={child.id} variant="outline" className="text-xs">
                          {child.name}
                        </Badge>
                      ))}
                      {category.children.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{category.children.length - 3} daha
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Henüz kategori eklenmemiş
          </h3>
          <p className="text-gray-600">
            Yakında kategoriler eklenecek.
          </p>
        </div>
      )}
    </div>
  );
}
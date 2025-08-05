'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryWithChildren } from '@/types/product';
import { CategoriesAPI } from '@/services/api/categories';

interface CategoryNavigationProps {
  className?: string;
  onCategorySelect?: (categoryId: string) => void;
  selectedCategoryId?: string;
}

export function CategoryNavigation({ 
  className = '', 
  onCategorySelect,
  selectedCategoryId 
}: CategoryNavigationProps) {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const rootCategories = await CategoriesAPI.getRootCategories();
        setCategories(rootCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryClick = (categoryId: string) => {
    onCategorySelect?.(categoryId);
  };

  const renderCategory = (category: CategoryWithChildren, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategoryId === category.id;
    const productCount = category._count?.products || 0;

    return (
      <div key={category.id} className="space-y-1">
        <div
          className={`flex items-center justify-between p-2 rounded-md transition-colors ${
            isSelected 
              ? 'bg-blue-100 text-blue-900' 
              : 'hover:bg-gray-100'
          }`}
          style={{ paddingLeft: `${(level * 16) + 8}px` }}
        >
          <div className="flex items-center flex-1 min-w-0">
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto mr-2"
                onClick={() => toggleCategory(category.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            
            <Link
              href={`/categories/${category.slug}`}
              className="flex-1 min-w-0 text-sm font-medium truncate hover:text-blue-600"
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </Link>
          </div>
          
          {productCount > 0 && (
            <span className="text-xs text-gray-500 ml-2">
              ({productCount})
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {category.children.map((child) => 
              renderCategory(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <nav className={`space-y-1 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
      </div>
      
      {/* All Products Link */}
      <div
        className={`flex items-center justify-between p-2 rounded-md transition-colors ${
          !selectedCategoryId 
            ? 'bg-blue-100 text-blue-900' 
            : 'hover:bg-gray-100'
        }`}
      >
        <Link
          href="/products"
          className="flex-1 text-sm font-medium hover:text-blue-600"
          onClick={() => handleCategoryClick('')}
        >
          All Products
        </Link>
      </div>

      {categories.map((category) => renderCategory(category))}
    </nav>
  );
}
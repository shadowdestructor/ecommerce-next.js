'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface TopProduct {
  id: string;
  name: string;
  slug: string;
  totalSold: number;
  revenue: number;
  image?: {
    url: string;
    altText?: string;
  };
}

export function TopProducts() {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/top-products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Error fetching top products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  if (loading) {
    return (
      <div className=\"bg-white shadow rounded-lg p-6\">
        <h3 className=\"text-lg leading-6 font-medium text-gray-900 mb-4\">
          Top Products
        </h3>
        <div className=\"space-y-4\">
          {[...Array(5)].map((_, i) => (
            <div key={i} className=\"flex items-center space-x-4 animate-pulse\">
              <div className=\"w-12 h-12 bg-gray-200 rounded\"></div>
              <div className=\"flex-1\">
                <div className=\"h-4 bg-gray-200 rounded w-3/4 mb-2\"></div>
                <div className=\"h-3 bg-gray-200 rounded w-1/2\"></div>
              </div>
              <div className=\"text-right\">
                <div className=\"h-4 bg-gray-200 rounded w-16 mb-1\"></div>
                <div className=\"h-3 bg-gray-200 rounded w-12\"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className=\"bg-white shadow rounded-lg p-6\">
      <div className=\"flex items-center justify-between mb-4\">
        <h3 className=\"text-lg leading-6 font-medium text-gray-900\">
          Top Products
        </h3>
        <Link
          href=\"/admin/products\"
          className=\"text-sm font-medium text-blue-600 hover:text-blue-500\"
        >
          View all
        </Link>
      </div>

      {products.length === 0 ? (
        <p className=\"text-gray-500 text-center py-4\">No product data available</p>
      ) : (
        <div className=\"space-y-4\">
          {products.map((product, index) => (
            <div key={product.id} className=\"flex items-center space-x-4\">
              <div className=\"flex-shrink-0\">
                <span className=\"inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-gray-500 bg-gray-100 rounded-full\">
                  {index + 1}
                </span>
              </div>
              
              <div className=\"w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0\">
                {product.image ? (
                  <Image
                    src={product.image.url}
                    alt={product.image.altText || product.name}
                    width={48}
                    height={48}
                    className=\"w-full h-full object-cover\"
                  />
                ) : (
                  <div className=\"w-full h-full bg-gray-200 flex items-center justify-center\">
                    <span className=\"text-gray-400 text-xs\">No image</span>
                  </div>
                )}
              </div>
              
              <div className=\"flex-1 min-w-0\">
                <Link
                  href={`/admin/products/${product.id}`}
                  className=\"text-sm font-medium text-gray-900 hover:text-blue-600 truncate block\"
                >
                  {product.name}
                </Link>
                <p className=\"text-xs text-gray-500\">
                  {product.totalSold} sold
                </p>
              </div>
              
              <div className=\"text-right flex-shrink-0\">
                <p className=\"text-sm font-medium text-gray-900\">
                  ${product.revenue.toLocaleString()}
                </p>
                <p className=\"text-xs text-gray-500\">revenue</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
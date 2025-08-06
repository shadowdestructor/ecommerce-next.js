'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductWithImages } from '@/types/product';
import { formatCurrency } from '@/lib/utils';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

interface AdminProductCardProps {
  product: ProductWithImages;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onUpdate: () => void;
}

export function AdminProductCard({ 
  product, 
  selected, 
  onSelect, 
  onUpdate 
}: AdminProductCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleStatus = async () => {
    try {
      const newStatus = product.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isLowStock = product.trackInventory && product.inventoryQuantity < 10;

  return (
    <div className={`bg-white rounded-lg shadow-sm border-2 transition-colors ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      {/* Selection checkbox */}
      <div className="p-3 border-b border-gray-100">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>

      {/* Product image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {product.images[0] ? (
          <Image
            src={product.images[0].url}
            alt={product.images[0].altText || product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-sm">No image</span>
          </div>
        )}
        
        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
            {product.status}
          </span>
        </div>

        {/* Low stock warning */}
        {isLowStock && (
          <div className="absolute top-2 right-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" title="Low stock" />
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
          {product.name}
        </h3>
        
        <p className="text-xs text-gray-500 mb-2">
          SKU: {product.sku}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(Number(product.price))}
            </p>
            {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
              <p className="text-sm text-gray-500 line-through">
                {formatCurrency(Number(product.comparePrice))}
              </p>
            )}
          </div>
          
          {product.trackInventory && (
            <div className="text-right">
              <p className={`text-sm font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                {product.inventoryQuantity} in stock
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <Link
              href={`/products/${product.slug}`}
              target="_blank"
              className="p-1.5 text-gray-400 hover:text-gray-600"
              title="View product"
            >
              <EyeIcon className="h-4 w-4" />
            </Link>
            
            <Link
              href={`/admin/products/${product.id}/edit`}
              className="p-1.5 text-gray-400 hover:text-blue-600"
              title="Edit product"
            >
              <PencilIcon className="h-4 w-4" />
            </Link>
            
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 text-gray-400 hover:text-red-600 disabled:opacity-50"
              title="Delete product"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={toggleStatus}
            className={`text-xs px-2 py-1 rounded ${
              product.status === 'ACTIVE'
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            {product.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>
    </div>
  );
}
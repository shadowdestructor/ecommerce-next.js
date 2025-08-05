'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartItem as CartItemType } from '@/types/cart';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  isUpdating?: boolean;
}

export function CartItem({ 
  item, 
  onUpdateQuantity, 
  onRemove, 
  isUpdating = false 
}: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  
  const price = item.variant?.price || item.product.price;
  const maxStock = item.variant?.inventoryQuantity || item.product.inventoryQuantity;
  const primaryImage = item.product.images[0];

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > maxStock) return;
    
    setQuantity(newQuantity);
    onUpdateQuantity(item.id, newQuantity);
  };

  const handleRemove = () => {
    onRemove(item.id);
  };

  return (
    <div className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <Link href={`/products/${item.product.slug}`}>
          <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.altText || item.product.name}
                fill
                className="object-cover hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                No Image
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link 
          href={`/products/${item.product.slug}`}
          className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
        >
          {item.product.name}
        </Link>
        
        {item.variant && (
          <div className="mt-1 text-xs text-gray-500">
            {item.variant.option1Name && item.variant.option1Value && (
              <span>{item.variant.option1Name}: {item.variant.option1Value}</span>
            )}
            {item.variant.option2Name && item.variant.option2Value && (
              <span className="ml-2">{item.variant.option2Name}: {item.variant.option2Value}</span>
            )}
          </div>
        )}

        <div className="mt-1 text-sm text-gray-600">
          SKU: {item.variant?.sku || item.product.sku}
        </div>

        {/* Stock Warning */}
        {maxStock <= 5 && maxStock > 0 && (
          <div className="mt-1 text-xs text-orange-600">
            Only {maxStock} left in stock
          </div>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={quantity <= 1 || isUpdating}
          className="h-8 w-8 p-0"
        >
          <Minus className="h-3 w-3" />
        </Button>
        
        <span className="w-8 text-center text-sm font-medium">
          {quantity}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={quantity >= maxStock || isUpdating}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Price */}
      <div className="text-right">
        <div className="text-sm font-medium text-gray-900">
          ${(Number(price) * quantity).toFixed(2)}
        </div>
        <div className="text-xs text-gray-500">
          ${Number(price).toFixed(2)} each
        </div>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        disabled={isUpdating}
        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
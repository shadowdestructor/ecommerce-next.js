'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FavoriteButton } from '@/components/favorites/favorite-button';
import { ProductWithRelations } from '@/types/product';

interface ProductCardProps {
  product: ProductWithRelations;
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
}

export function ProductCard({ 
  product, 
  onAddToCart, 
  onToggleFavorite, 
  isFavorite = false 
}: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const primaryImage = product.images[0];
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100)
    : 0;

  const averageRating = 4.5; // TODO: Calculate from actual reviews
  const reviewCount = product._count?.reviews || 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product.id);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(product.id);
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {/* Discount Badge */}
          {hasDiscount && (
            <Badge 
              variant="destructive" 
              className="absolute top-2 left-2 z-10"
            >
              -{discountPercentage}%
            </Badge>
          )}

          {/* Featured Badge */}
          {product.featured && (
            <Badge 
              className="absolute top-2 right-2 z-10"
            >
              Featured
            </Badge>
          )}

          {/* Product Image */}
          {primaryImage && !imageError ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText || product.name}
              fill
              className={`object-cover transition-all duration-300 group-hover:scale-105 ${
                imageLoading ? 'blur-sm' : 'blur-0'
              }`}
              onLoad={() => setImageLoading(false)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-200">
              <span className="text-gray-400">No Image</span>
            </div>
          )}

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/20">
            <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
              <Button
                size="sm"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.inventoryQuantity === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.inventoryQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <FavoriteButton
                productId={product.id}
                variant="outline"
                size="sm"
                className="bg-white/90 hover:bg-white"
              />
            </div>
          </div>

          {/* Stock Status */}
          {product.inventoryQuantity === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Category */}
          <p className="text-xs text-gray-500 mb-1">{product.category.name}</p>

          {/* Product Name */}
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                ({reviewCount})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">
              ${Number(product.price).toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ${Number(product.comparePrice).toFixed(2)}
              </span>
            )}
          </div>

          {/* Brand */}
          {product.brand && (
            <p className="text-xs text-gray-500 mt-1">{product.brand}</p>
          )}

          {/* Stock Indicator */}
          {product.trackInventory && product.inventoryQuantity > 0 && product.inventoryQuantity <= 10 && (
            <p className="text-xs text-orange-600 mt-1">
              Only {product.inventoryQuantity} left in stock
            </p>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
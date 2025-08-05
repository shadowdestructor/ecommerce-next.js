'use client';

import { useState } from 'react';
import { Heart, ShoppingCart, Share2, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { FavoriteButton } from '@/components/favorites/favorite-button';
import { ProductImageGallery } from './product-image-gallery';
import { ProductWithRelations } from '@/types/product';

interface ProductDetailProps {
  product: ProductWithRelations;
  onAddToCart?: (productId: string, variantId?: string, quantity?: number) => void;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
}

export function ProductDetail({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
}: ProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants.length > 0 ? product.variants[0].id : null
  );
  const [quantity, setQuantity] = useState(1);

  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100)
    : 0;

  const selectedVariantData = product.variants.find(v => v.id === selectedVariant);
  const currentPrice = selectedVariantData?.price || product.price;
  const currentStock = selectedVariantData?.inventoryQuantity || product.inventoryQuantity;

  const averageRating = 4.5; // TODO: Calculate from actual reviews
  const reviewCount = product._count?.reviews || 0;

  const handleAddToCart = () => {
    onAddToCart?.(product.id, selectedVariant || undefined, quantity);
  };

  const handleToggleFavorite = () => {
    onToggleFavorite?.(product.id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.shortDescription || product.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  // Group variants by option names for better display
  const variantOptions = product.variants.reduce((acc, variant) => {
    if (variant.option1Name && variant.option1Value) {
      if (!acc[variant.option1Name]) {
        acc[variant.option1Name] = new Set();
      }
      acc[variant.option1Name].add(variant.option1Value);
    }
    if (variant.option2Name && variant.option2Value) {
      if (!acc[variant.option2Name]) {
        acc[variant.option2Name] = new Set();
      }
      acc[variant.option2Name].add(variant.option2Value);
    }
    return acc;
  }, {} as Record<string, Set<string>>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Product Images */}
      <div>
        <ProductImageGallery images={product.images} productName={product.name} />
      </div>

      {/* Product Information */}
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{product.category.name}</Badge>
            {product.featured && <Badge>Featured</Badge>}
            {hasDiscount && <Badge variant="destructive">-{discountPercentage}% OFF</Badge>}
          </div>
          
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          {product.brand && (
            <p className="text-gray-600">by {product.brand}</p>
          )}

          {/* Rating */}
          {reviewCount > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {averageRating} ({reviewCount} reviews)
              </span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold">
              ${Number(currentPrice).toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xl text-gray-500 line-through">
                ${Number(product.comparePrice).toFixed(2)}
              </span>
            )}
          </div>
          {hasDiscount && (
            <p className="text-green-600 font-medium">
              You save ${(Number(product.comparePrice) - Number(currentPrice)).toFixed(2)}
            </p>
          )}
        </div>

        {/* Description */}
        {product.shortDescription && (
          <p className="text-gray-600 text-lg">{product.shortDescription}</p>
        )}

        {/* Variants */}
        {Object.keys(variantOptions).length > 0 && (
          <div className="space-y-4">
            {Object.entries(variantOptions).map(([optionName, values]) => (
              <div key={optionName}>
                <label className="block text-sm font-medium mb-2">
                  {optionName}
                </label>
                <div className="flex flex-wrap gap-2">
                  {Array.from(values).map((value) => {
                    const variant = product.variants.find(
                      v => v.option1Value === value || v.option2Value === value
                    );
                    const isSelected = selectedVariant === variant?.id;
                    
                    return (
                      <Button
                        key={value}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedVariant(variant?.id || null)}
                        disabled={variant?.inventoryQuantity === 0}
                      >
                        {value}
                        {variant?.inventoryQuantity === 0 && ' (Out of Stock)'}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium mb-2">Quantity</label>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              -
            </Button>
            <span className="w-12 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
              disabled={quantity >= currentStock}
            >
              +
            </Button>
          </div>
        </div>

        {/* Stock Status */}
        <div>
          {currentStock > 0 ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-600 font-medium">In Stock</span>
              {currentStock <= 10 && (
                <span className="text-orange-600">
                  (Only {currentStock} left)
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-red-600 font-medium">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            size="lg"
            className="flex-1"
            onClick={handleAddToCart}
            disabled={currentStock === 0}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Add to Cart
          </Button>
          <FavoriteButton
            productId={product.id}
            variant="outline"
            size="lg"
          />
          <Button
            variant="outline"
            size="lg"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Features */}
        <div className="border-t pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">Free Shipping</p>
                <p className="text-xs text-gray-500">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-sm">Secure Payment</p>
                <p className="text-xs text-gray-500">100% protected</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-sm">Easy Returns</p>
                <p className="text-xs text-gray-500">30-day policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        {product.description && (
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">Product Details</h3>
            <div className="prose prose-sm max-w-none">
              <p>{product.description}</p>
            </div>
          </div>
        )}

        {/* Specifications */}
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-3">Specifications</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="font-medium">SKU:</dt>
              <dd className="text-gray-600">{product.sku}</dd>
            </div>
            {product.weight && (
              <div>
                <dt className="font-medium">Weight:</dt>
                <dd className="text-gray-600">{Number(product.weight)} kg</dd>
              </div>
            )}
            <div>
              <dt className="font-medium">Category:</dt>
              <dd className="text-gray-600">{product.category.name}</dd>
            </div>
            {product.brand && (
              <div>
                <dt className="font-medium">Brand:</dt>
                <dd className="text-gray-600">{product.brand}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
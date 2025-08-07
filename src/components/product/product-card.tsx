'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingCart, Star, Eye, Zap } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/hooks/use-cart';
import { useFavorites } from '@/hooks/use-favorites';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  className?: string;
  showQuickView?: boolean;
}

export function ProductCard({ product, className, showQuickView = true }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { addItem } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.inventoryQuantity <= 0) {
      toast.error('Ürün stokta yok');
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || '/placeholder-product.jpg',
      slug: product.slug,
      inventoryQuantity: product.inventoryQuantity,
    }, 1);
    
    toast.success('Ürün sepete eklendi');
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
      toast.success('Favorilerden çıkarıldı');
    } else {
      addToFavorites(product);
      toast.success('Favorilere eklendi');
    }
  };

  const discountPercentage = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const averageRating = 4.5; // This would come from reviews
  const reviewCount = 23; // This would come from reviews

  return (
    <Card 
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {/* Product Image */}
          <Image
            src={product.images[0]?.url || '/placeholder-product.jpg'}
            alt={product.images[0]?.altText || product.name}
            fill
            className={`object-cover transition-all duration-500 group-hover:scale-110 ${
              imageLoading ? 'blur-sm' : 'blur-0'
            }`}
            onLoad={() => setImageLoading(false)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Overlay on hover */}
          <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.featured && (
              <Badge className="bg-yellow-500 text-white">
                <Zap className="w-3 h-3 mr-1" />
                Öne Çıkan
              </Badge>
            )}
            {discountPercentage > 0 && (
              <Badge variant="destructive">
                %{discountPercentage} İndirim
              </Badge>
            )}
            {product.inventoryQuantity <= 5 && product.inventoryQuantity > 0 && (
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                Son {product.inventoryQuantity} adet
              </Badge>
            )}
            {product.inventoryQuantity <= 0 && (
              <Badge variant="secondary" className="bg-gray-500 text-white">
                Stokta Yok
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
          }`}>
            <Button
              size="sm"
              variant="secondary"
              className="w-10 h-10 rounded-full p-0 bg-white/90 hover:bg-white shadow-lg"
              onClick={handleToggleFavorite}
            >
              <Heart 
                className={`w-4 h-4 ${
                  isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`} 
              />
            </Button>
            
            {showQuickView && (
              <Button
                size="sm"
                variant="secondary"
                className="w-10 h-10 rounded-full p-0 bg-white/90 hover:bg-white shadow-lg"
              >
                <Eye className="w-4 h-4 text-gray-600" />
              </Button>
            )}
          </div>

          {/* Quick Add to Cart Button */}
          <div className={`absolute bottom-3 left-3 right-3 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <Button
              onClick={handleAddToCart}
              disabled={product.inventoryQuantity <= 0}
              className="w-full bg-white/90 hover:bg-white text-gray-900 shadow-lg"
              size="sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.inventoryQuantity <= 0 ? 'Stokta Yok' : 'Sepete Ekle'}
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Category */}
          <p className="text-sm text-gray-500 mb-1">{product.category.name}</p>
          
          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">({reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-gray-900">
              {product.price.toLocaleString('tr-TR')}₺
            </span>
            {product.comparePrice && (
              <span className="text-sm text-gray-500 line-through">
                {product.comparePrice.toLocaleString('tr-TR')}₺
              </span>
            )}
          </div>

          {/* Variants Preview */}
          {product.variants && product.variants.length > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs text-gray-500">Seçenekler:</span>
              <div className="flex gap-1">
                {product.variants.slice(0, 3).map((variant) => (
                  <div
                    key={variant.id}
                    className="w-4 h-4 rounded-full border border-gray-300 bg-gray-100"
                    title={variant.name}
                  />
                ))}
                {product.variants.length > 3 && (
                  <span className="text-xs text-gray-500">+{product.variants.length - 3}</span>
                )}
              </div>
            </div>
          )}

          {/* Brand */}
          {product.brand && (
            <p className="text-xs text-gray-400">{product.brand}</p>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { ProductCard } from '@/components/product/product-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { ProductWithRelations } from '@/types/product';
import { useFavorites } from '@/hooks/use-favorites';
import { useCart } from '@/hooks/use-cart';
import { ProductsAPI } from '@/services/api/products';

export function FavoritesList() {
  const { favorites, isLoading: favoritesLoading } = useFavorites();
  const { addItem } = useCart();
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      if (favorites.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch products for each favorite ID
        const productPromises = favorites.map(productId => 
          ProductsAPI.getProduct(productId).catch(() => null)
        );
        
        const fetchedProducts = await Promise.all(productPromises);
        const validProducts = fetchedProducts.filter(Boolean) as ProductWithRelations[];
        
        setProducts(validProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load favorite products');
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteProducts();
  }, [favorites]);

  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      addItem(product);
      // TODO: Show success toast
    }
  };

  const handleToggleFavorite = (productId: string) => {
    // This will be handled by the ProductCard's FavoriteButton
  };

  if (favoritesLoading || loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          No favorites yet
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Start browsing and add products to your favorites to see them here.
        </p>
        <div className="space-x-4">
          <Button asChild size="lg">
            <a href="/products">Browse Products</a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="/categories">Shop by Category</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Your Favorites ({products.length})
        </h2>
        
        {products.length > 0 && (
          <Button
            variant="outline"
            onClick={() => {
              // Add all favorites to cart
              products.forEach(product => {
                addItem(product);
              });
              // TODO: Show success toast
            }}
            className="flex items-center space-x-2"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Add All to Cart</span>
          </Button>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={true} // All products in this list are favorites
          />
        ))}
      </div>
    </div>
  );
}
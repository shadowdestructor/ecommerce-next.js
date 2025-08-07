'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Truck, 
  Shield, 
  RotateCcw,
  Plus,
  Minus,
  Share2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/hooks/use-cart';
import { useFavorites } from '@/hooks/use-favorites';
import { toast } from 'sonner';
import { ProductGrid } from '@/components/product/product-grid';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  
  const { addItem } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data.product);
          setRelatedProducts(data.relatedProducts || []);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Ürün yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.inventoryQuantity <= 0) {
      toast.error('Ürün stokta yok');
      return;
    }

    if (quantity > product.inventoryQuantity) {
      toast.error('Stokta yeterli ürün yok');
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || '/placeholder-product.jpg',
      slug: product.slug,
      inventoryQuantity: product.inventoryQuantity,
      variantId: selectedVariant,
    }, quantity);
    
    toast.success('Ürün sepete eklendi');
  };

  const handleToggleFavorite = () => {
    if (!product) return;
    
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
      toast.success('Favorilerden çıkarıldı');
    } else {
      addToFavorites(product);
      toast.success('Favorilere eklendi');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.shortDescription,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link kopyalandı');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 animate-pulse rounded" />
            <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4" />
            <div className="h-10 bg-gray-200 animate-pulse rounded w-1/2" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6" />
              <div className="h-4 bg-gray-200 animate-pulse rounded w-4/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Ürün bulunamadı</h1>
        <p className="text-gray-600">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
      </div>
    );
  }

  const discountPercentage = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const averageRating = 4.5; // This would come from reviews
  const reviewCount = 23; // This would come from reviews

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
        <a href="/" className="hover:text-gray-700">Ana Sayfa</a>
        <ChevronRight className="w-4 h-4" />
        <a href="/products" className="hover:text-gray-700">Ürünler</a>
        <ChevronRight className="w-4 h-4" />
        <a href={`/categories/${product.category.slug}`} className="hover:text-gray-700">
          {product.category.name}
        </a>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={product.images[selectedImageIndex]?.url || '/placeholder-product.jpg'}
              alt={product.images[selectedImageIndex]?.altText || product.name}
              fill
              className="object-cover"
              priority
            />
            
            {/* Navigation arrows */}
            {product.images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full p-0"
                  onClick={() => setSelectedImageIndex(
                    selectedImageIndex === 0 ? product.images.length - 1 : selectedImageIndex - 1
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full p-0"
                  onClick={() => setSelectedImageIndex(
                    selectedImageIndex === product.images.length - 1 ? 0 : selectedImageIndex + 1
                  )}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.featured && (
                <Badge className="bg-yellow-500 text-white">Öne Çıkan</Badge>
              )}
              {discountPercentage > 0 && (
                <Badge variant="destructive">%{discountPercentage} İndirim</Badge>
              )}
              {product.inventoryQuantity <= 5 && product.inventoryQuantity > 0 && (
                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                  Son {product.inventoryQuantity} adet
                </Badge>
              )}
            </div>
          </div>

          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square overflow-hidden rounded border-2 transition-colors ${
                    selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.altText || product.name}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category */}
          <div className="text-sm text-gray-500">
            {product.category.name}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {averageRating} ({reviewCount} değerlendirme)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-gray-900">
              {product.price.toLocaleString('tr-TR')}₺
            </span>
            {product.comparePrice && (
              <span className="text-xl text-gray-500 line-through">
                {product.comparePrice.toLocaleString('tr-TR')}₺
              </span>
            )}
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-gray-600 leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Seçenekler</h3>
              <div className="grid grid-cols-2 gap-2">
                {product.variants.map((variant) => (
                  <Button
                    key={variant.id}
                    variant={selectedVariant === variant.id ? "default" : "outline"}
                    onClick={() => setSelectedVariant(variant.id)}
                    className="justify-start"
                  >
                    {variant.name}
                    {variant.price && (
                      <span className="ml-auto">
                        +{variant.price.toLocaleString('tr-TR')}₺
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-3">
            <h3 className="font-semibold">Adet</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.inventoryQuantity, quantity + 1))}
                  disabled={quantity >= product.inventoryQuantity}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <span className="text-sm text-gray-500">
                Stokta {product.inventoryQuantity} adet
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              disabled={product.inventoryQuantity <= 0}
              className="flex-1"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {product.inventoryQuantity <= 0 ? 'Stokta Yok' : 'Sepete Ekle'}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={handleToggleFavorite}
              className="px-4"
            >
              <Heart 
                className={`w-5 h-5 ${
                  isFavorite(product.id) ? 'fill-red-500 text-red-500' : ''
                }`} 
              />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={handleShare}
              className="px-4"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-4 pt-6 border-t">
            <div className="flex items-center gap-3 text-sm">
              <Truck className="w-5 h-5 text-green-600" />
              <span>Ücretsiz kargo (150₺ ve üzeri)</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>2 yıl garanti</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <RotateCcw className="w-5 h-5 text-purple-600" />
              <span>30 gün iade garantisi</span>
            </div>
          </div>

          {/* Brand */}
          {product.brand && (
            <div className="pt-4 border-t">
              <span className="text-sm text-gray-500">Marka: </span>
              <span className="font-semibold">{product.brand}</span>
            </div>
          )}
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="description">Açıklama</TabsTrigger>
          <TabsTrigger value="specifications">Özellikler</TabsTrigger>
          <TabsTrigger value="reviews">Değerlendirmeler ({reviewCount})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="description" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                {product.description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                  <p>Bu ürün için detaylı açıklama henüz eklenmemiş.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="specifications" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Genel Bilgiler</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">SKU:</dt>
                      <dd>{product.sku}</dd>
                    </div>
                    {product.weight && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Ağırlık:</dt>
                        <dd>{product.weight} kg</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Kategori:</dt>
                      <dd>{product.category.name}</dd>
                    </div>
                    {product.brand && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Marka:</dt>
                        <dd>{product.brand}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <p className="text-gray-500">Değerlendirmeler yakında eklenecek.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Benzer Ürünler</h2>
          <ProductGrid products={relatedProducts.slice(0, 4)} />
        </div>
      )}
    </div>
  );
}
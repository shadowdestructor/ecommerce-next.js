'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, Truck, Shield, RotateCcw, Zap } from 'lucide-react';
import { ProductGrid } from '@/components/product/product-grid';
import { Product } from '@/types/product';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [featuredRes, newRes] = await Promise.all([
          fetch('/api/products?featured=true&limit=8'),
          fetch('/api/products?sortBy=createdAt&sortOrder=desc&limit=8')
        ]);

        if (featuredRes.ok && newRes.ok) {
          const [featuredData, newData] = await Promise.all([
            featuredRes.json(),
            newRes.json()
          ]);
          
          setFeaturedProducts(featuredData.products);
          setNewProducts(newData.products);
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Modern
                <span className="block text-yellow-400">E-Ticaret</span>
                Deneyimi
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                Binlerce ürün, hızlı teslimat ve güvenli alışveriş. 
                En iyi fiyatlarla kaliteli ürünlere ulaşın.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold" asChild>
                  <Link href="/products" className="flex items-center">
                    Alışverişe Başla
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                  <Link href="/categories">
                    Kategorileri Keşfet
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-2xl bg-gray-200">
                {/* Placeholder for hero image */}
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🛍️</div>
                    <p className="text-white text-lg">Alışveriş Deneyimi</p>
                  </div>
                </div>
              </div>
              {/* Floating Cards */}
              <div className="absolute -top-4 -left-4 bg-white text-gray-900 p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold">Hızlı Teslimat</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white text-gray-900 p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">Güvenli Ödeme</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Truck className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">Ücretsiz Kargo</h3>
                <p className="text-gray-600">150₺ ve üzeri alışverişlerde ücretsiz kargo</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold">Güvenli Ödeme</h3>
                <p className="text-gray-600">256-bit SSL şifreleme ile güvenli ödeme</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <RotateCcw className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold">Kolay İade</h3>
                <p className="text-gray-600">30 gün içinde koşulsuz iade garantisi</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Öne Çıkan Ürünler</h2>
              <p className="text-gray-600">En popüler ve özel seçilmiş ürünler</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/products?featured=true">
                Tümünü Gör
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
          
          <ProductGrid products={featuredProducts} loading={loading} />
        </div>
      </section>

      {/* Categories Banner */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Kategorileri Keşfedin</h2>
          <p className="text-xl text-purple-100 mb-8">
            Geniş ürün yelpazemizde aradığınızı bulun
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { name: 'Elektronik', icon: '📱', href: '/categories/elektronik' },
              { name: 'Moda', icon: '👕', href: '/categories/moda' },
              { name: 'Ev & Yaşam', icon: '🏠', href: '/categories/ev-yasam' },
              { name: 'Spor', icon: '⚽', href: '/categories/spor' }
            ].map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-colors"
              >
                <div className="text-4xl mb-2">{category.icon}</div>
                <h3 className="font-semibold">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Yeni Ürünler</h2>
              <p className="text-gray-600">En son eklenen ürünleri keşfedin</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/products?sortBy=createdAt&sortOrder=desc">
                Tümünü Gör
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
          
          <ProductGrid products={newProducts} loading={loading} />
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Kampanyalardan Haberdar Olun</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Özel indirimler, yeni ürünler ve kampanyalar hakkında ilk siz haberdar olun.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Email adresiniz"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <Button className="bg-blue-600 hover:bg-blue-700">
              Abone Ol
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
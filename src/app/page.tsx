import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function Home() {
  return (
    <MainLayout>
      <div className="bg-gray-50">
        {/* Hero Section */}
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                Welcome to Our Store
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Discover amazing products at unbeatable prices. Shop with confidence
                and enjoy fast, secure delivery.
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <Link href="/products">
                    <Button size="lg" className="w-full sm:w-auto">
                      Shop Now
                    </Button>
                  </Link>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <Link href="/categories">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Browse Categories
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Why Choose Us?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                We provide the best shopping experience with these amazing features
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Fast Delivery</CardTitle>
                  <CardDescription>
                    Get your orders delivered quickly and safely to your doorstep
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    We offer same-day delivery in select areas and free shipping
                    on orders over $50.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Secure Payment</CardTitle>
                  <CardDescription>
                    Your payment information is always safe and secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    We use industry-standard encryption to protect your personal
                    and payment information.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>24/7 Support</CardTitle>
                  <CardDescription>
                    Our customer service team is always here to help
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Get assistance anytime through chat, email, or phone support
                    from our friendly team.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-indigo-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white">
                Ready to Start Shopping?
              </h2>
              <p className="mt-4 text-lg text-indigo-200">
                Join thousands of satisfied customers and discover your new favorite products
              </p>
              <div className="mt-8">
                <Link href="/auth/register">
                  <Button size="lg" variant="secondary">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
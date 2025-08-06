'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductSearch } from '@/components/product/product-search';
import { CartIcon } from '@/components/cart/cart-icon';
import { CartDrawer } from '@/components/cart/cart-drawer';

export function Header() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              E-Commerce
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/products"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Products
            </Link>
            <Link
              href="/categories"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Categories
            </Link>
            {session && (
              <Link
                href="/orders"
                className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                My Orders
              </Link>
            )}
            <Link
              href="/blog"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Blog
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <ProductSearch className="w-full" />
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <CartIcon onClick={() => setIsCartOpen(true)} />

            {/* User Menu */}
            {session ? (
              <div className="relative">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Hello, {session.user?.name}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/products"
                className="text-gray-500 hover:text-gray-900 block px-3 py-2 text-base font-medium"
              >
                Products
              </Link>
              <Link
                href="/categories"
                className="text-gray-500 hover:text-gray-900 block px-3 py-2 text-base font-medium"
              >
                Categories
              </Link>
              {session && (
                <Link
                  href="/orders"
                  className="text-gray-500 hover:text-gray-900 block px-3 py-2 text-base font-medium"
                >
                  My Orders
                </Link>
              )}
              <Link
                href="/blog"
                className="text-gray-500 hover:text-gray-900 block px-3 py-2 text-base font-medium"
              >
                Blog
              </Link>
            </div>
            {/* Mobile search */}
            <div className="px-2 pb-3">
              <ProductSearch />
            </div>
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchResult {
  suggestions: string[];
  products: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    category: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  showRecentSearches?: boolean;
}

export function SearchBar({ 
  className, 
  placeholder = "Ürün, kategori veya marka ara...",
  showRecentSearches = true 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult>({
    suggestions: [],
    products: [],
    categories: []
  });
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    if (showRecentSearches) {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    }
  }, [showRecentSearches]);

  // Search API call
  useEffect(() => {
    const searchProducts = async () => {
      if (debouncedQuery.length < 2) {
        setResults({ suggestions: [], products: [], categories: [] });
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=6`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [debouncedQuery]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Add to recent searches
    if (showRecentSearches) {
      const newRecentSearches = [
        searchQuery,
        ...recentSearches.filter(s => s !== searchQuery)
      ].slice(0, 5);
      
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
    }

    // Navigate to search results
    router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    setIsOpen(false);
    setQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const removeRecentSearch = (searchTerm: string) => {
    const newRecentSearches = recentSearches.filter(s => s !== searchTerm);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
  };

  const hasResults = results.suggestions.length > 0 || results.products.length > 0 || results.categories.length > 0;
  const showRecentInDropdown = showRecentSearches && recentSearches.length > 0 && query.length === 0;

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="pl-10 pr-10 h-11"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Search Dropdown */}
      {isOpen && (showRecentInDropdown || hasResults || loading) && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {loading && (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Aranıyor...</p>
              </div>
            )}

            {/* Recent Searches */}
            {showRecentInDropdown && (
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Son Aramalar</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Temizle
                  </Button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between group hover:bg-gray-50 rounded px-2 py-1"
                    >
                      <button
                        onClick={() => handleSearch(search)}
                        className="flex-1 text-left text-sm text-gray-600 hover:text-gray-900"
                      >
                        {search}
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRecentSearch(search)}
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Suggestions */}
            {results.suggestions.length > 0 && (
              <div className="p-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Öneriler</span>
                </div>
                <div className="space-y-1">
                  {results.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(suggestion)}
                      className="block w-full text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded px-2 py-1"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {results.categories.length > 0 && (
              <div className="p-4 border-b">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Kategoriler</h4>
                <div className="space-y-1">
                  {results.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="block text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded px-2 py-1"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            {results.products.length > 0 && (
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Ürünler</h4>
                <div className="space-y-3">
                  {results.products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 hover:bg-gray-50 rounded p-2 -m-2"
                    >
                      <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {product.price.toLocaleString('tr-TR')}₺
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {product.category}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                
                {results.products.length >= 6 && (
                  <div className="mt-3 pt-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSearch(query)}
                      className="w-full"
                    >
                      Tüm sonuçları gör
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* No Results */}
            {!loading && query.length >= 2 && !hasResults && (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">
                  "{query}" için sonuç bulunamadı
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
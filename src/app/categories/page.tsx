import { MainLayout } from '@/components/layout/main-layout';
import { CategoryNavigation } from '@/components/category/category-navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryService } from '@/services/category';
import Link from 'next/link';

export default async function CategoriesPage() {
  const rootCategories = await CategoryService.getRootCategories();

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h1>
          <p className="text-gray-600">
            Browse our wide selection of products organized by category
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {rootCategories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                {category.imageUrl && (
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </CardTitle>
                  {category.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {category._count?.products || 0} products
                    </span>
                    {category.children.length > 0 && (
                      <span className="text-sm text-gray-500">
                        {category.children.length} subcategories
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Category Tree Navigation */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">All Categories</h2>
          <CategoryNavigation />
        </div>
      </div>
    </MainLayout>
  );
}
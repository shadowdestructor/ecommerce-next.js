import { notFound } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { ProductList } from '@/components/product/product-list';
import { ProductFiltersComponent } from '@/components/product/product-filters';
import { CategoryService } from '@/services/category';
import { ProductService } from '@/services/product';
import Link from 'next/link';

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = await CategoryService.getCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  // Get breadcrumbs
  const breadcrumbs = await CategoryService.getBreadcrumbs(category.id);

  // Get initial products for this category
  const initialProducts = await ProductService.getProducts({
    categoryId: category.id,
    page: 1,
    limit: 12,
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-gray-700">Categories</Link>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.id} className="flex items-center space-x-2">
              <span>/</span>
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-900">{crumb.name}</span>
              ) : (
                <Link 
                  href={`/categories/${crumb.slug}`} 
                  className="hover:text-gray-700"
                >
                  {crumb.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-gray-600 max-w-3xl">
                  {category.description}
                </p>
              )}
            </div>
            {category.imageUrl && (
              <div className="hidden md:block">
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Subcategories */}
          {category.children.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Subcategories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {category.children.map((subcategory) => (
                  <Link
                    key={subcategory.id}
                    href={`/categories/${subcategory.slug}`}
                    className="group"
                  >
                    <div className="bg-white border rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                      {subcategory.imageUrl && (
                        <div className="aspect-square mb-2 overflow-hidden rounded">
                          <img
                            src={subcategory.imageUrl}
                            alt={subcategory.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                      <h3 className="font-medium text-sm group-hover:text-blue-600 transition-colors">
                        {subcategory.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {subcategory._count?.products || 0} products
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Products Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-4">
              <ProductFiltersComponent
                onFiltersChange={() => {}} // Will be handled by ProductList
                initialFilters={{ categoryId: category.id }}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                {initialProducts.pagination.total} products found
              </p>
            </div>

            <ProductList
              initialProducts={initialProducts.products}
              filters={{ categoryId: category.id }}
              showPagination={true}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const category = await CategoryService.getCategoryBySlug(params.slug);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: category.metaTitle || `${category.name} - Shop Now`,
    description: category.metaDescription || category.description || `Browse our ${category.name} collection`,
    openGraph: {
      title: category.name,
      description: category.description,
      images: category.imageUrl ? [{ url: category.imageUrl, alt: category.name }] : [],
    },
  };
}
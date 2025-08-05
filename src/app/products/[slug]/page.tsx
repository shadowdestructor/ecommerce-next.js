import { notFound } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { ProductDetail } from '@/components/product/product-detail';
import { ProductService } from '@/services/product';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await ProductService.getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <a href="/" className="hover:text-gray-700">Home</a>
          <span>/</span>
          <a href="/products" className="hover:text-gray-700">Products</a>
          <span>/</span>
          <a href={`/categories/${product.category.slug}`} className="hover:text-gray-700">
            {product.category.name}
          </a>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <ProductDetail product={product} />
      </div>
    </MainLayout>
  );
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await ProductService.getProductBySlug(params.slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDescription || product.description,
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description,
      images: product.images.map(image => ({
        url: image.url,
        alt: image.altText || product.name,
      })),
    },
  };
}
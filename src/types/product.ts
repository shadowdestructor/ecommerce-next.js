import { Product, Category, ProductImage, ProductVariant, ProductStatus } from '@prisma/client';

export type ProductWithRelations = Product & {
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  _count?: {
    reviews: number;
    favorites: number;
  };
};

export type CategoryWithChildren = Category & {
  children: Category[];
  parent?: Category;
  _count?: {
    products: number;
  };
};

export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  status?: ProductStatus;
  featured?: boolean;
  search?: string;
  sortBy?: 'name' | 'price' | 'createdAt' | 'featured';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductPage {
  products: ProductWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateProductData {
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  sku: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  trackInventory?: boolean;
  inventoryQuantity?: number;
  weight?: number;
  categoryId: string;
  brand?: string;
  status?: ProductStatus;
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  images?: Array<{
    url: string;
    altText?: string;
    sortOrder?: number;
  }>;
  variants?: Array<{
    name: string;
    sku: string;
    price?: number;
    inventoryQuantity?: number;
    option1Name?: string;
    option1Value?: string;
    option2Name?: string;
    option2Value?: string;
    option3Name?: string;
    option3Value?: string;
  }>;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export interface CategoryFilters {
  parentId?: string | null;
  isActive?: boolean;
  search?: string;
  sortBy?: 'name' | 'sortOrder' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCategoryData {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
  sortOrder?: number;
}
import { prisma } from '@/lib/db';
import { 
  ProductFilters, 
  ProductPage, 
  CreateProductData, 
  UpdateProductData,
  ProductWithRelations 
} from '@/types/product';
import { ProductStatus } from '@prisma/client';

export class ProductService {
  static async getProducts(filters: ProductFilters = {}): Promise<ProductPage> {
    const {
      categoryId,
      minPrice,
      maxPrice,
      brand,
      status,
      featured,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (brand) {
      where.brand = {
        contains: brand,
        mode: 'insensitive',
      };
    }

    if (status) {
      where.status = status;
    } else {
      // Default to only show active products for public
      where.status = ProductStatus.ACTIVE;
    }

    if (featured !== undefined) {
      where.featured = featured;
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          sku: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'featured') {
      orderBy.featured = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          variants: true,
          _count: {
            select: {
              reviews: true,
              favorites: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      products: products as ProductWithRelations[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  static async getProductById(id: string): Promise<ProductWithRelations | null> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          where: {
            isApproved: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
    }) as Promise<ProductWithRelations | null>;
  }

  static async getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          where: {
            isApproved: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
    }) as Promise<ProductWithRelations | null>;
  }

  static async createProduct(data: CreateProductData): Promise<ProductWithRelations> {
    const { images, variants, ...productData } = data;

    // Generate slug if not provided
    if (!productData.slug) {
      productData.slug = this.generateSlug(productData.name);
    }

    // Ensure slug is unique
    productData.slug = await this.ensureUniqueSlug(productData.slug);

    const product = await prisma.product.create({
      data: {
        ...productData,
        images: images ? {
          create: images,
        } : undefined,
        variants: variants ? {
          create: variants,
        } : undefined,
      },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: true,
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
    });

    return product as ProductWithRelations;
  }

  static async updateProduct(data: UpdateProductData): Promise<ProductWithRelations> {
    const { id, images, variants, ...productData } = data;

    // Generate slug if name is being updated and slug is not provided
    if (productData.name && !productData.slug) {
      productData.slug = this.generateSlug(productData.name);
      productData.slug = await this.ensureUniqueSlug(productData.slug, id);
    }

    const product = await prisma.product.update({
      where: { id },
      data: productData,
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: true,
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
    });

    return product as ProductWithRelations;
  }

  static async deleteProduct(id: string): Promise<void> {
    await prisma.product.delete({
      where: { id },
    });
  }

  static async updateStock(id: string, quantity: number): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: {
        inventoryQuantity: quantity,
      },
    });
  }

  static async getFeaturedProducts(limit: number = 8): Promise<ProductWithRelations[]> {
    return prisma.product.findMany({
      where: {
        featured: true,
        status: ProductStatus.ACTIVE,
      },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: true,
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    }) as Promise<ProductWithRelations[]>;
  }

  static async getRelatedProducts(productId: string, categoryId: string, limit: number = 4): Promise<ProductWithRelations[]> {
    return prisma.product.findMany({
      where: {
        categoryId,
        status: ProductStatus.ACTIVE,
        NOT: {
          id: productId,
        },
      },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: true,
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    }) as Promise<ProductWithRelations[]>;
  }

  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private static async ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const existing = await prisma.product.findFirst({
        where: {
          slug: uniqueSlug,
          ...(excludeId && { NOT: { id: excludeId } }),
        },
      });

      if (!existing) {
        break;
      }

      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }
}
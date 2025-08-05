import { ProductService } from '@/services/product';
import { prisma } from '@/lib/db';
import { ProductStatus } from '@prisma/client';

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('ProductService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return products with pagination', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          price: 99.99,
          status: ProductStatus.ACTIVE,
          category: { id: '1', name: 'Test Category' },
          images: [],
          variants: [],
          _count: { reviews: 0, favorites: 0 },
        },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts as any);
      mockPrisma.product.count.mockResolvedValue(1);

      const result = await ProductService.getProducts({
        page: 1,
        limit: 12,
      });

      expect(result.products).toEqual(mockProducts);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 12,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: { status: ProductStatus.ACTIVE },
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
          _count: { select: { reviews: true, favorites: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 12,
      });
    });

    it('should filter products by category', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await ProductService.getProducts({
        categoryId: 'category-1',
      });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            categoryId: 'category-1',
            status: ProductStatus.ACTIVE,
          },
        })
      );
    });

    it('should filter products by price range', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await ProductService.getProducts({
        minPrice: 10,
        maxPrice: 100,
      });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            price: { gte: 10, lte: 100 },
            status: ProductStatus.ACTIVE,
          },
        })
      );
    });

    it('should search products by name and description', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await ProductService.getProducts({
        search: 'test',
      });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { name: { contains: 'test', mode: 'insensitive' } },
              { description: { contains: 'test', mode: 'insensitive' } },
              { sku: { contains: 'test', mode: 'insensitive' } },
            ],
            status: ProductStatus.ACTIVE,
          },
        })
      );
    });
  });

  describe('getProductById', () => {
    it('should return product by id', async () => {
      const mockProduct = {
        id: '1',
        name: 'Test Product',
        category: { id: '1', name: 'Test Category' },
        images: [],
        variants: [],
        reviews: [],
        _count: { reviews: 0, favorites: 0 },
      };

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct as any);

      const result = await ProductService.getProductById('1');

      expect(result).toEqual(mockProduct);
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
          reviews: {
            include: { user: { select: { id: true, name: true } } },
            where: { isApproved: true },
            orderBy: { createdAt: 'desc' },
          },
          _count: { select: { reviews: true, favorites: true } },
        },
      });
    });
  });

  describe('createProduct', () => {
    it('should create product with generated slug', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        price: 99.99,
        categoryId: 'category-1',
      };

      const mockCreatedProduct = {
        id: '1',
        ...productData,
        slug: 'test-product',
        category: { id: 'category-1', name: 'Test Category' },
        images: [],
        variants: [],
        _count: { reviews: 0, favorites: 0 },
      };

      mockPrisma.product.findFirst.mockResolvedValue(null); // No existing slug
      mockPrisma.product.create.mockResolvedValue(mockCreatedProduct as any);

      const result = await ProductService.createProduct(productData);

      expect(result).toEqual(mockCreatedProduct);
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: {
          ...productData,
          slug: 'test-product',
        },
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
          _count: { select: { reviews: true, favorites: true } },
        },
      });
    });
  });

  describe('updateStock', () => {
    it('should update product inventory quantity', async () => {
      mockPrisma.product.update.mockResolvedValue({} as any);

      await ProductService.updateStock('product-1', 50);

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: { inventoryQuantity: 50 },
      });
    });
  });

  describe('getFeaturedProducts', () => {
    it('should return featured products', async () => {
      const mockFeaturedProducts = [
        {
          id: '1',
          name: 'Featured Product',
          featured: true,
          status: ProductStatus.ACTIVE,
        },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockFeaturedProducts as any);

      const result = await ProductService.getFeaturedProducts(8);

      expect(result).toEqual(mockFeaturedProducts);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: {
          featured: true,
          status: ProductStatus.ACTIVE,
        },
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
          _count: { select: { reviews: true, favorites: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      });
    });
  });
});
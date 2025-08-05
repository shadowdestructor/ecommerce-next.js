import { CategoryService } from '@/services/category';
import { prisma } from '@/lib/db';

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    product: {
      count: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('CategoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should return categories with default sorting', async () => {
      const mockCategories = [
        {
          id: '1',
          name: 'Electronics',
          slug: 'electronics',
          children: [],
          parent: null,
          _count: { products: 5 },
        },
      ];

      mockPrisma.category.findMany.mockResolvedValue(mockCategories as any);

      const result = await CategoryService.getCategories();

      expect(result).toEqual(mockCategories);
      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
          parent: true,
          _count: {
            select: {
              products: {
                where: { status: 'ACTIVE' },
              },
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      });
    });

    it('should filter categories by parent', async () => {
      mockPrisma.category.findMany.mockResolvedValue([]);

      await CategoryService.getCategories({
        parentId: 'parent-1',
      });

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { parentId: 'parent-1' },
        })
      );
    });

    it('should search categories by name', async () => {
      mockPrisma.category.findMany.mockResolvedValue([]);

      await CategoryService.getCategories({
        search: 'electronics',
      });

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { name: { contains: 'electronics', mode: 'insensitive' } },
              { description: { contains: 'electronics', mode: 'insensitive' } },
            ],
          },
        })
      );
    });
  });

  describe('getRootCategories', () => {
    it('should return only root categories', async () => {
      const mockRootCategories = [
        {
          id: '1',
          name: 'Electronics',
          parentId: null,
          children: [
            { id: '2', name: 'Phones' },
          ],
        },
      ];

      mockPrisma.category.findMany.mockResolvedValue(mockRootCategories as any);

      const result = await CategoryService.getRootCategories();

      expect(result).toEqual(mockRootCategories);
      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: {
          parentId: null,
          isActive: true,
        },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
          _count: {
            select: {
              products: {
                where: { status: 'ACTIVE' },
              },
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('createCategory', () => {
    it('should create category with generated slug', async () => {
      const categoryData = {
        name: 'Test Category',
        description: 'Test description',
      };

      const mockCreatedCategory = {
        id: '1',
        ...categoryData,
        slug: 'test-category',
        children: [],
        parent: null,
        _count: { products: 0 },
      };

      mockPrisma.category.findFirst.mockResolvedValue(null); // No existing slug
      mockPrisma.category.create.mockResolvedValue(mockCreatedCategory as any);

      const result = await CategoryService.createCategory(categoryData);

      expect(result).toEqual(mockCreatedCategory);
      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          ...categoryData,
          slug: 'test-category',
        },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
          parent: true,
          _count: {
            select: {
              products: {
                where: { status: 'ACTIVE' },
              },
            },
          },
        },
      });
    });
  });

  describe('deleteCategory', () => {
    it('should delete category if no products or children', async () => {
      mockPrisma.product.count.mockResolvedValue(0);
      mockPrisma.category.count.mockResolvedValue(0);
      mockPrisma.category.delete.mockResolvedValue({} as any);

      await CategoryService.deleteCategory('category-1');

      expect(mockPrisma.product.count).toHaveBeenCalledWith({
        where: { categoryId: 'category-1' },
      });
      expect(mockPrisma.category.count).toHaveBeenCalledWith({
        where: { parentId: 'category-1' },
      });
      expect(mockPrisma.category.delete).toHaveBeenCalledWith({
        where: { id: 'category-1' },
      });
    });

    it('should throw error if category has products', async () => {
      mockPrisma.product.count.mockResolvedValue(5);

      await expect(CategoryService.deleteCategory('category-1')).rejects.toThrow(
        'Cannot delete category with products'
      );
    });

    it('should throw error if category has children', async () => {
      mockPrisma.product.count.mockResolvedValue(0);
      mockPrisma.category.count.mockResolvedValue(2);

      await expect(CategoryService.deleteCategory('category-1')).rejects.toThrow(
        'Cannot delete category with subcategories'
      );
    });
  });

  describe('getBreadcrumbs', () => {
    it('should return category breadcrumbs', async () => {
      const mockChild = {
        id: '3',
        name: 'Smartphones',
        parentId: '2',
        children: [],
        parent: null,
        _count: { products: 10 },
      };

      const mockParent = {
        id: '2',
        name: 'Electronics',
        parentId: '1',
        children: [],
        parent: null,
        _count: { products: 50 },
      };

      const mockRoot = {
        id: '1',
        name: 'All Categories',
        parentId: null,
        children: [],
        parent: null,
        _count: { products: 100 },
      };

      mockPrisma.category.findUnique
        .mockResolvedValueOnce(mockChild as any)
        .mockResolvedValueOnce(mockParent as any)
        .mockResolvedValueOnce(mockRoot as any);

      const result = await CategoryService.getBreadcrumbs('3');

      expect(result).toEqual([mockRoot, mockParent, mockChild]);
    });
  });
});
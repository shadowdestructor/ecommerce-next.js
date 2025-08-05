import { prisma } from '@/lib/db';
import { CategoryWithChildren, CategoryFilters, CreateCategoryData } from '@/types/product';

export class CategoryService {
  static async getCategories(filters: CategoryFilters = {}): Promise<CategoryWithChildren[]> {
    const {
      parentId,
      isActive,
      search,
      sortBy = 'sortOrder',
      sortOrder = 'asc',
    } = filters;

    const where: any = {};

    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
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
      ];
    }

    const orderBy: any = {};
    if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else {
      orderBy.sortOrder = sortOrder;
    }

    return prisma.category.findMany({
      where,
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        parent: true,
        _count: {
          select: {
            products: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
      orderBy,
    }) as Promise<CategoryWithChildren[]>;
  }

  static async getCategoryById(id: string): Promise<CategoryWithChildren | null> {
    return prisma.category.findUnique({
      where: { id },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        parent: true,
        _count: {
          select: {
            products: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
    }) as Promise<CategoryWithChildren | null>;
  }

  static async getCategoryBySlug(slug: string): Promise<CategoryWithChildren | null> {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        parent: true,
        _count: {
          select: {
            products: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
    }) as Promise<CategoryWithChildren | null>;
  }

  static async getRootCategories(): Promise<CategoryWithChildren[]> {
    return prisma.category.findMany({
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
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    }) as Promise<CategoryWithChildren[]>;
  }

  static async createCategory(data: CreateCategoryData): Promise<CategoryWithChildren> {
    // Generate slug if not provided
    if (!data.slug) {
      data.slug = this.generateSlug(data.name);
    }

    // Ensure slug is unique
    data.slug = await this.ensureUniqueSlug(data.slug);

    const category = await prisma.category.create({
      data,
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        parent: true,
        _count: {
          select: {
            products: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
    });

    return category as CategoryWithChildren;
  }

  static async updateCategory(id: string, data: Partial<CreateCategoryData>): Promise<CategoryWithChildren> {
    // Generate slug if name is being updated and slug is not provided
    if (data.name && !data.slug) {
      data.slug = this.generateSlug(data.name);
      data.slug = await this.ensureUniqueSlug(data.slug, id);
    }

    const category = await prisma.category.update({
      where: { id },
      data,
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        parent: true,
        _count: {
          select: {
            products: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
    });

    return category as CategoryWithChildren;
  }

  static async deleteCategory(id: string): Promise<void> {
    // Check if category has products
    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      throw new Error('Cannot delete category with products');
    }

    // Check if category has children
    const childrenCount = await prisma.category.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      throw new Error('Cannot delete category with subcategories');
    }

    await prisma.category.delete({
      where: { id },
    });
  }

  static async getCategoryHierarchy(): Promise<CategoryWithChildren[]> {
    const rootCategories = await this.getRootCategories();
    
    // Recursively load all children
    const loadChildren = async (categories: CategoryWithChildren[]): Promise<CategoryWithChildren[]> => {
      for (const category of categories) {
        if (category.children.length > 0) {
          category.children = await loadChildren(category.children);
        }
      }
      return categories;
    };

    return loadChildren(rootCategories);
  }

  static async getBreadcrumbs(categoryId: string): Promise<CategoryWithChildren[]> {
    const breadcrumbs: CategoryWithChildren[] = [];
    let currentCategory = await this.getCategoryById(categoryId);

    while (currentCategory) {
      breadcrumbs.unshift(currentCategory);
      if (currentCategory.parentId) {
        currentCategory = await this.getCategoryById(currentCategory.parentId);
      } else {
        break;
      }
    }

    return breadcrumbs;
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
      const existing = await prisma.category.findFirst({
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
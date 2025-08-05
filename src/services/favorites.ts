import { prisma } from '@/lib/db';

export class FavoritesService {
  static async getFavorites(userId: string) {
    return prisma.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async addToFavorites(userId: string, productId: string) {
    // Check if already exists
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      return existing;
    }

    return prisma.favorite.create({
      data: {
        userId,
        productId,
      },
      include: {
        product: {
          include: {
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  }

  static async removeFromFavorites(userId: string, productId: string) {
    await prisma.favorite.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }

  static async isFavorite(userId: string, productId: string): Promise<boolean> {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return !!favorite;
  }

  static async getFavoriteIds(userId: string): Promise<string[]> {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      select: { productId: true },
    });

    return favorites.map(f => f.productId);
  }

  static async getFavoriteCount(userId: string): Promise<number> {
    return prisma.favorite.count({
      where: { userId },
    });
  }

  static async clearFavorites(userId: string) {
    await prisma.favorite.deleteMany({
      where: { userId },
    });
  }

  static async getPopularProducts(limit: number = 10) {
    // Get products with most favorites
    const popularProducts = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
      orderBy: {
        favorites: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return popularProducts;
  }
}
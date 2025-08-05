import { PrismaClient, UserRole, ProductStatus, OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecommerce.com' },
    update: {},
    create: {
      email: 'admin@ecommerce.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });

  // Create test customer
  const customerPassword = await bcrypt.hash('customer123', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      passwordHash: customerPassword,
      name: 'Test Customer',
      role: UserRole.CUSTOMER,
      emailVerified: true,
    },
  });

  // Create categories
  const electronicsCategory = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets',
      isActive: true,
      sortOrder: 1,
    },
  });

  const phonesCategory = await prisma.category.upsert({
    where: { slug: 'smartphones' },
    update: {},
    create: {
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Mobile phones and accessories',
      parentId: electronicsCategory.id,
      isActive: true,
      sortOrder: 1,
    },
  });

  const clothingCategory = await prisma.category.upsert({
    where: { slug: 'clothing' },
    update: {},
    create: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion and apparel',
      isActive: true,
      sortOrder: 2,
    },
  });

  // Create sample products
  const iphone = await prisma.product.upsert({
    where: { slug: 'iphone-15-pro' },
    update: {},
    create: {
      name: 'iPhone 15 Pro',
      slug: 'iphone-15-pro',
      description: 'The latest iPhone with advanced features and powerful performance.',
      shortDescription: 'Latest iPhone with Pro features',
      sku: 'IPHONE-15-PRO',
      price: 999.99,
      comparePrice: 1099.99,
      inventoryQuantity: 50,
      categoryId: phonesCategory.id,
      brand: 'Apple',
      status: ProductStatus.ACTIVE,
      featured: true,
      metaTitle: 'iPhone 15 Pro - Latest Apple Smartphone',
      metaDescription: 'Buy the latest iPhone 15 Pro with advanced features and powerful performance.',
    },
  });

  const tshirt = await prisma.product.upsert({
    where: { slug: 'cotton-t-shirt' },
    update: {},
    create: {
      name: 'Premium Cotton T-Shirt',
      slug: 'cotton-t-shirt',
      description: 'High-quality cotton t-shirt perfect for everyday wear.',
      shortDescription: 'Comfortable cotton t-shirt',
      sku: 'TSHIRT-COTTON-001',
      price: 29.99,
      inventoryQuantity: 100,
      categoryId: clothingCategory.id,
      brand: 'BasicWear',
      status: ProductStatus.ACTIVE,
      featured: false,
    },
  });

  // Create product images
  await prisma.productImage.createMany({
    data: [
      {
        productId: iphone.id,
        url: 'https://example.com/iphone-15-pro-1.jpg',
        altText: 'iPhone 15 Pro front view',
        sortOrder: 1,
      },
      {
        productId: iphone.id,
        url: 'https://example.com/iphone-15-pro-2.jpg',
        altText: 'iPhone 15 Pro back view',
        sortOrder: 2,
      },
      {
        productId: tshirt.id,
        url: 'https://example.com/cotton-tshirt-1.jpg',
        altText: 'Cotton T-Shirt front view',
        sortOrder: 1,
      },
    ],
  });

  // Create product variants for t-shirt
  await prisma.productVariant.createMany({
    data: [
      {
        productId: tshirt.id,
        name: 'Small - Black',
        sku: 'TSHIRT-COTTON-001-S-BLACK',
        inventoryQuantity: 25,
        option1Name: 'Size',
        option1Value: 'S',
        option2Name: 'Color',
        option2Value: 'Black',
      },
      {
        productId: tshirt.id,
        name: 'Medium - Black',
        sku: 'TSHIRT-COTTON-001-M-BLACK',
        inventoryQuantity: 30,
        option1Name: 'Size',
        option1Value: 'M',
        option2Name: 'Color',
        option2Value: 'Black',
      },
      {
        productId: tshirt.id,
        name: 'Large - White',
        sku: 'TSHIRT-COTTON-001-L-WHITE',
        inventoryQuantity: 20,
        option1Name: 'Size',
        option1Value: 'L',
        option2Name: 'Color',
        option2Value: 'White',
      },
    ],
  });

  // Create sample discount
  await prisma.discount.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      type: 'PERCENTAGE',
      value: 10,
      minimumAmount: 50,
      usageLimit: 100,
      usedCount: 0,
      isActive: true,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  // Create sample blog post
  await prisma.blogPost.upsert({
    where: { slug: 'welcome-to-our-store' },
    update: {},
    create: {
      title: 'Welcome to Our Store',
      slug: 'welcome-to-our-store',
      content: 'Welcome to our amazing e-commerce store! We offer the best products at competitive prices.',
      excerpt: 'Welcome to our amazing e-commerce store!',
      authorId: admin.id,
      category: 'News',
      tags: ['welcome', 'announcement'],
      status: 'PUBLISHED',
      publishedAt: new Date(),
      metaTitle: 'Welcome to Our Store - Latest News',
      metaDescription: 'Welcome to our amazing e-commerce store with the best products.',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin user: admin@ecommerce.com / admin123');
  console.log('👤 Customer user: customer@example.com / customer123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
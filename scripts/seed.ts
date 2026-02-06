import { db, testConnection, runMigrations } from '../src/lib/db/index.js';
import { 
  brands, 
  categories, 
  products, 
  variants, 
  images,
  users,
  addresses,
  productCategories
} from '../src/lib/db/schema.js';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Starting database seeding...');
  
  // Test connection
  if (!testConnection()) {
    console.error('❌ Database connection failed');
    process.exit(1);
  }

  try {
    // Run migrations first
    runMigrations();

    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Clearing existing data...');
    await db.delete(images);
    await db.delete(variants);
    await db.delete(products);
    await db.delete(categories);
    await db.delete(brands);
    await db.delete(addresses);
    await db.delete(users);

    // Seed brands
    console.log('👟 Seeding brands...');
    const brandData = [
      {
        name: 'Dr. Martens',
        description: 'Iconic British footwear brand known for their distinctive boots',
        logoUrl: 'https://example.com/logos/dr-martens.png',
        website: 'https://www.drmartens.com'
      },
      {
        name: 'Timberland',
        description: 'American outdoor lifestyle brand specializing in boots and outdoor gear',
        logoUrl: 'https://example.com/logos/timberland.png',
        website: 'https://www.timberland.com'
      },
      {
        name: 'Red Wing',
        description: 'American heritage work boot manufacturer',
        logoUrl: 'https://example.com/logos/red-wing.png',
        website: 'https://www.redwingshoes.com'
      },
      {
        name: 'Blundstone',
        description: 'Australian footwear company known for elastic-sided boots',
        logoUrl: 'https://example.com/logos/blundstone.png',
        website: 'https://www.blundstone.com'
      }
    ];

    const insertedBrands = await db.insert(brands).values(brandData).returning();
    console.log(`✅ Inserted ${insertedBrands.length} brands`);

    // Seed categories
    console.log('📂 Seeding categories...');
    const categoryData = [
      {
        name: 'Work Boots',
        slug: 'work-boots',
        description: 'Durable boots designed for professional work environments'
      },
      {
        name: 'Steel Toe',
        slug: 'steel-toe',
        description: 'Safety boots with steel toe protection'
      },
      {
        name: 'Vegan',
        slug: 'vegan',
        description: 'Animal-free footwear options'
      },
      {
        name: 'Heritage',
        slug: 'heritage',
        description: 'Classic, timeless boot designs'
      },
      {
        name: 'Hiking',
        slug: 'hiking',
        description: 'Boots designed for outdoor adventures'
      }
    ];

    const insertedCategories = await db.insert(categories).values(categoryData).returning();
    console.log(`✅ Inserted ${insertedCategories.length} categories`);

    // Seed products
    console.log('👢 Seeding products...');
    const productData = [
      {
        name: 'Dr. Martens 1460 Smooth Leather Boots',
        slug: 'dr-martens-1460-smooth',
        description: 'The iconic 1460 8-eye boot in smooth leather. Features the classic Dr. Martens silhouette with yellow stitching, grooved sides, and a distinctive heel loop.',
        shortDescription: 'Iconic 8-eye boot in smooth leather',
        brandId: insertedBrands[0].id,
        price: 150.00,
        compareAtPrice: 180.00,
        sku: 'DM-1460-SMOOTH',
        isVegan: false,
        hasSteelToe: false,
        isActive: true,
        metaTitle: 'Dr. Martens 1460 Smooth Leather Boots | Sheos',
        metaDescription: 'Shop the iconic Dr. Martens 1460 boots in smooth leather. Classic 8-eye design with yellow stitching.'
      },
      {
        name: 'Timberland PRO Steel Toe Work Boots',
        slug: 'timberland-pro-steel-toe',
        description: 'Professional work boots with steel toe protection. Features waterproof leather, anti-fatigue technology, and electrical hazard protection.',
        shortDescription: 'Professional steel toe work boots',
        brandId: insertedBrands[1].id,
        price: 180.00,
        compareAtPrice: 220.00,
        sku: 'TB-PRO-STEEL',
        isVegan: false,
        hasSteelToe: true,
        isActive: true,
        metaTitle: 'Timberland PRO Steel Toe Work Boots | Sheos',
        metaDescription: 'Professional steel toe work boots with waterproof protection and anti-fatigue technology.'
      },
      {
        name: 'Red Wing Iron Ranger Heritage Boots',
        slug: 'red-wing-iron-ranger',
        description: 'Classic heritage work boots in premium leather. Handcrafted construction with Goodyear welt for durability and resoleability.',
        shortDescription: 'Classic heritage work boots',
        brandId: insertedBrands[2].id,
        price: 320.00,
        compareAtPrice: 350.00,
        sku: 'RW-IRON-RANGER',
        isVegan: false,
        hasSteelToe: false,
        isActive: true,
        metaTitle: 'Red Wing Iron Ranger Heritage Boots | Sheos',
        metaDescription: 'Classic heritage work boots in premium leather with Goodyear welt construction.'
      },
      {
        name: 'Blundstone Original 500 Series',
        slug: 'blundstone-500-original',
        description: 'Elastic-sided Chelsea boots perfect for everyday wear. Features premium leather construction and slip-resistant sole.',
        shortDescription: 'Elastic-sided Chelsea boots',
        brandId: insertedBrands[3].id,
        price: 200.00,
        compareAtPrice: 240.00,
        sku: 'BL-500-ORIGINAL',
        isVegan: false,
        hasSteelToe: false,
        isActive: true,
        metaTitle: 'Blundstone Original 500 Series | Sheos',
        metaDescription: 'Elastic-sided Chelsea boots in premium leather with slip-resistant sole.'
      }
    ];

    const insertedProducts = await db.insert(products).values(productData).returning();
    console.log(`✅ Inserted ${insertedProducts.length} products`);

    // Link products to categories
    console.log('🔗 Linking products to categories...');
    const productCategoryLinks = [
      { productId: insertedProducts[0].id, categoryId: insertedCategories[3].id }, // Dr. Martens -> Heritage
      { productId: insertedProducts[1].id, categoryId: insertedCategories[0].id }, // Timberland -> Work Boots
      { productId: insertedProducts[1].id, categoryId: insertedCategories[1].id }, // Timberland -> Steel Toe
      { productId: insertedProducts[2].id, categoryId: insertedCategories[0].id }, // Red Wing -> Work Boots
      { productId: insertedProducts[2].id, categoryId: insertedCategories[3].id }, // Red Wing -> Heritage
      { productId: insertedProducts[3].id, categoryId: insertedCategories[3].id }, // Blundstone -> Heritage
    ];

    await db.insert(productCategories).values(productCategoryLinks);
    console.log(`✅ Linked products to categories`);

    // Seed variants
    console.log('📏 Seeding variants...');
    const variantData = [
      // Dr. Martens 1460 variants
      { productId: insertedProducts[0].id, size: 40, color: 'Black', sku: 'DM-1460-SMOOTH-40-BLK', price: 150.00, stock: 10, onHand: 12, reserved: 2 },
      { productId: insertedProducts[0].id, size: 41, color: 'Black', sku: 'DM-1460-SMOOTH-41-BLK', price: 150.00, stock: 8, onHand: 10, reserved: 2 },
      { productId: insertedProducts[0].id, size: 42, color: 'Black', sku: 'DM-1460-SMOOTH-42-BLK', price: 150.00, stock: 12, onHand: 15, reserved: 3 },
      { productId: insertedProducts[0].id, size: 40, color: 'Brown', sku: 'DM-1460-SMOOTH-40-BRN', price: 150.00, stock: 5, onHand: 7, reserved: 2 },
      { productId: insertedProducts[0].id, size: 41, color: 'Brown', sku: 'DM-1460-SMOOTH-41-BRN', price: 150.00, stock: 7, onHand: 9, reserved: 2 },
      
      // Timberland PRO variants
      { productId: insertedProducts[1].id, size: 41, color: 'Brown', sku: 'TB-PRO-STEEL-41-BRN', price: 180.00, stock: 15, onHand: 18, reserved: 3 },
      { productId: insertedProducts[1].id, size: 42, color: 'Brown', sku: 'TB-PRO-STEEL-42-BRN', price: 180.00, stock: 18, onHand: 22, reserved: 4 },
      { productId: insertedProducts[1].id, size: 43, color: 'Brown', sku: 'TB-PRO-STEEL-43-BRN', price: 180.00, stock: 12, onHand: 15, reserved: 3 },
      { productId: insertedProducts[1].id, size: 44, color: 'Brown', sku: 'TB-PRO-STEEL-44-BRN', price: 180.00, stock: 10, onHand: 12, reserved: 2 },
      
      // Red Wing Iron Ranger variants
      { productId: insertedProducts[2].id, size: 40, color: 'Amber Harness', sku: 'RW-IRON-RANGER-40-AMBER', price: 320.00, stock: 6, onHand: 8, reserved: 2 },
      { productId: insertedProducts[2].id, size: 41, color: 'Amber Harness', sku: 'RW-IRON-RANGER-41-AMBER', price: 320.00, stock: 8, onHand: 10, reserved: 2 },
      { productId: insertedProducts[2].id, size: 42, color: 'Amber Harness', sku: 'RW-IRON-RANGER-42-AMBER', price: 320.00, stock: 5, onHand: 7, reserved: 2 },
      { productId: insertedProducts[2].id, size: 43, color: 'Amber Harness', sku: 'RW-IRON-RANGER-43-AMBER', price: 320.00, stock: 7, onHand: 9, reserved: 2 },
      
      // Blundstone 500 variants
      { productId: insertedProducts[3].id, size: 40, color: 'Brown', sku: 'BL-500-ORIGINAL-40-BRN', price: 200.00, stock: 20, onHand: 25, reserved: 5 },
      { productId: insertedProducts[3].id, size: 41, color: 'Brown', sku: 'BL-500-ORIGINAL-41-BRN', price: 200.00, stock: 25, onHand: 30, reserved: 5 },
      { productId: insertedProducts[3].id, size: 42, color: 'Brown', sku: 'BL-500-ORIGINAL-42-BRN', price: 200.00, stock: 22, onHand: 27, reserved: 5 },
      { productId: insertedProducts[3].id, size: 43, color: 'Brown', sku: 'BL-500-ORIGINAL-43-BRN', price: 200.00, stock: 18, onHand: 22, reserved: 4 },
      { productId: insertedProducts[3].id, size: 40, color: 'Black', sku: 'BL-500-ORIGINAL-40-BLK', price: 200.00, stock: 15, onHand: 18, reserved: 3 },
      { productId: insertedProducts[3].id, size: 41, color: 'Black', sku: 'BL-500-ORIGINAL-41-BLK', price: 200.00, stock: 12, onHand: 15, reserved: 3 },
    ];

    const insertedVariants = await db.insert(variants).values(variantData).returning();
    console.log(`✅ Inserted ${insertedVariants.length} variants`);

    // Seed images
    console.log('🖼️ Seeding images...');
    const imageData = [
      // Dr. Martens 1460 images
      { productId: insertedProducts[0].id, url: 'https://example.com/images/dm-1460-1.jpg', alt: 'Dr. Martens 1460 front view', sortOrder: 1, isPrimary: true },
      { productId: insertedProducts[0].id, url: 'https://example.com/images/dm-1460-2.jpg', alt: 'Dr. Martens 1460 side view', sortOrder: 2, isPrimary: false },
      { productId: insertedProducts[0].id, url: 'https://example.com/images/dm-1460-3.jpg', alt: 'Dr. Martens 1460 detail view', sortOrder: 3, isPrimary: false },
      
      // Timberland PRO images
      { productId: insertedProducts[1].id, url: 'https://example.com/images/tb-pro-1.jpg', alt: 'Timberland PRO front view', sortOrder: 1, isPrimary: true },
      { productId: insertedProducts[1].id, url: 'https://example.com/images/tb-pro-2.jpg', alt: 'Timberland PRO side view', sortOrder: 2, isPrimary: false },
      
      // Red Wing Iron Ranger images
      { productId: insertedProducts[2].id, url: 'https://example.com/images/rw-iron-1.jpg', alt: 'Red Wing Iron Ranger front view', sortOrder: 1, isPrimary: true },
      { productId: insertedProducts[2].id, url: 'https://example.com/images/rw-iron-2.jpg', alt: 'Red Wing Iron Ranger side view', sortOrder: 2, isPrimary: false },
      { productId: insertedProducts[2].id, url: 'https://example.com/images/rw-iron-3.jpg', alt: 'Red Wing Iron Ranger detail view', sortOrder: 3, isPrimary: false },
      
      // Blundstone 500 images
      { productId: insertedProducts[3].id, url: 'https://example.com/images/bl-500-1.jpg', alt: 'Blundstone 500 front view', sortOrder: 1, isPrimary: true },
      { productId: insertedProducts[3].id, url: 'https://example.com/images/bl-500-2.jpg', alt: 'Blundstone 500 side view', sortOrder: 2, isPrimary: false },
    ];

    const insertedImages = await db.insert(images).values(imageData).returning();
    console.log(`✅ Inserted ${insertedImages.length} images`);

    // Seed a test user
    console.log('👤 Seeding test user...');
    const testUser = {
      id: 'test-user-123',
      email: 'test@sheos.com',
      firstName: 'Test',
      lastName: 'User',
      phone: '+33123456789',
      role: 'CUSTOMER',
      isActive: true
    };

    const insertedUser = await db.insert(users).values(testUser).returning();
    console.log(`✅ Inserted test user: ${insertedUser[0].email}`);

    // Seed test address
    console.log('🏠 Seeding test address...');
    const testAddress = {
      userId: insertedUser[0].id,
      type: 'SHIPPING',
      firstName: 'Test',
      lastName: 'User',
      address1: '123 Test Street',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
      isDefault: true
    };

    const insertedAddress = await db.insert(addresses).values(testAddress).returning();
    console.log(`✅ Inserted test address`);

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - ${insertedBrands.length} brands`);
    console.log(`   - ${insertedCategories.length} categories`);
    console.log(`   - ${insertedProducts.length} products`);
    console.log(`   - ${insertedVariants.length} variants`);
    console.log(`   - ${insertedImages.length} images`);
    console.log(`   - 1 test user`);
    console.log(`   - 1 test address`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seed function
seed().catch(console.error);

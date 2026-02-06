import { db } from '../src/lib/db';
import { products, variants } from '../src/lib/db/schema';
import { sql } from 'drizzle-orm';

async function checkAndAddVariants() {
  console.log('🔍 Checking products and variants...');
  
  try {
    // Count products
    const productCount = await db.select({ count: sql`count(*)` }).from(products);
    console.log(`Total products: ${productCount[0].count}`);
    
    // Count variants
    const variantCount = await db.select({ count: sql`count(*)` }).from(variants);
    console.log(`Total variants: ${variantCount[0].count}`);
    
    // Get products without variants using a different approach
    const allProducts = await db.select({ id: products.id, name: products.name, brandId: products.brandId }).from(products);
    const allVariants = await db.select({ productId: variants.productId }).from(variants);
    const variantProductIds = new Set(allVariants.map(v => v.productId));
    const productsWithoutVariants = allProducts.filter(p => !variantProductIds.has(p.id));
    
    console.log(`Products without variants: ${productsWithoutVariants.length}`);
    
    if (productsWithoutVariants.length > 0) {
      console.log('Adding variants to products without them...');
      
      const sizes = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46];
      const colors = ['Noir', 'Blanc', 'Marron', 'Gris'];
      
      for (const product of productsWithoutVariants) {
        const numVariants = Math.floor(Math.random() * 3) + 2; // 2-4 variants
        const selectedSizes = sizes.sort(() => 0.5 - Math.random()).slice(0, numVariants);
        const selectedColors = colors.sort(() => 0.5 - Math.random()).slice(0, Math.min(2, numVariants));
        
        for (let i = 0; i < numVariants; i++) {
          const size = selectedSizes[i];
          const color = i < selectedColors.length ? selectedColors[i] : null;
          const onHand = Math.floor(Math.random() * 20) + 5; // 5-24 in stock
          const reserved = Math.floor(Math.random() * 3); // 0-2 reserved
          
          await db.insert(variants).values({
            productId: product.id,
            size,
            color,
            sku: `${product.name.toLowerCase().replace(/\s+/g, '-')}-${size}${color ? `-${color.toLowerCase()}` : ''}`,
            price: null,
            stock: onHand - reserved,
            onHand,
            reserved,
            isActive: true
          });
        }
      }
      
      console.log('✅ Added variants to products');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAndAddVariants().catch(console.error);

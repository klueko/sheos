import { db } from '../src/lib/db';
import { products, variants, brands } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

async function addVariantsToImportedProducts() {
  console.log('🔄 Adding variants to imported products...');
  
  try {
    // Get all products that don't have variants yet
    const productsWithoutVariants = await db
      .select({ id: products.id, name: products.name, brandId: products.brandId })
      .from(products)
      .leftJoin(variants, eq(products.id, variants.productId))
      .where(eq(variants.id, null));

    console.log(`Found ${productsWithoutVariants.length} products without variants`);

    const variantData = [];
    const sizes = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46];
    const colors = ['Noir', 'Blanc', 'Marron', 'Gris'];

    for (const product of productsWithoutVariants) {
      // Add 2-4 variants per product
      const numVariants = Math.floor(Math.random() * 3) + 2;
      const selectedSizes = sizes.sort(() => 0.5 - Math.random()).slice(0, numVariants);
      const selectedColors = colors.sort(() => 0.5 - Math.random()).slice(0, Math.min(2, numVariants));

      for (let i = 0; i < numVariants; i++) {
        const size = selectedSizes[i];
        const color = i < selectedColors.length ? selectedColors[i] : null;
        const onHand = Math.floor(Math.random() * 20) + 5; // 5-24 in stock
        const reserved = Math.floor(Math.random() * 3); // 0-2 reserved
        
        variantData.push({
          productId: product.id,
          size,
          color,
          sku: `${product.name.toLowerCase().replace(/\s+/g, '-')}-${size}${color ? `-${color.toLowerCase()}` : ''}`,
          price: null, // Use product price
          stock: onHand - reserved,
          onHand,
          reserved,
          isActive: true
        });
      }
    }

    if (variantData.length > 0) {
      await db.insert(variants).values(variantData);
      console.log(`✅ Added ${variantData.length} variants to imported products`);
    } else {
      console.log('ℹ️ No products need variants added');
    }

  } catch (error) {
    console.error('❌ Error adding variants:', error);
  }
}

addVariantsToImportedProducts().catch(console.error);

import { db } from '../src/lib/db/index.js';
import { 
  brands, 
  products, 
  variants, 
  categories,
  users,
  orders
} from '../src/lib/db/schema.js';
import { count, desc, eq } from 'drizzle-orm';

async function inspectDatabase() {
  console.log('🔍 Inspection de la base de données Sheos\n');

  try {
    // Compter les enregistrements par table
    console.log('📊 Statistiques générales :');
    const brandCount = await db.select({ count: count() }).from(brands);
    const productCount = await db.select({ count: count() }).from(products);
    const variantCount = await db.select({ count: count() }).from(variants);
    const categoryCount = await db.select({ count: count() }).from(categories);
    const userCount = await db.select({ count: count() }).from(users);
    const orderCount = await db.select({ count: count() }).from(orders);

    console.log(`   - Marques: ${brandCount[0].count}`);
    console.log(`   - Produits: ${productCount[0].count}`);
    console.log(`   - Variantes: ${variantCount[0].count}`);
    console.log(`   - Catégories: ${categoryCount[0].count}`);
    console.log(`   - Utilisateurs: ${userCount[0].count}`);
    console.log(`   - Commandes: ${orderCount[0].count}\n`);

    // Top 10 des marques par nombre de produits
    console.log('🏆 Top 10 des marques par nombre de produits :');
    const topBrands = await db
      .select({
        brandName: brands.name,
        productCount: count(products.id)
      })
      .from(brands)
      .leftJoin(products, eq(brands.id, products.brandId))
      .groupBy(brands.id)
      .orderBy(desc(count(products.id)))
      .limit(10);

    topBrands.forEach((brand, index) => {
      console.log(`   ${index + 1}. ${brand.brandName}: ${brand.productCount} produits`);
    });

    console.log('\n✅ Inspection terminée !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'inspection:', error);
  }
}

inspectDatabase();

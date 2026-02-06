

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import { db } from '../src/lib/db';
import { products, brands, images } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';



function slugify(text) {
  return text
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '') // Remove accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .replace(/-{2,}/g, '-');
}

async function ensureUniqueSlug(baseSlug) {
  let candidate = baseSlug;
  let suffix = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await db.select({ id: products.id }).from(products).where(eq(products.slug, candidate));
    if (!existing || existing.length === 0) return candidate;
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function getOrCreateBrand(brandName) {
  if (!brandName || brandName.trim() === '') {
    brandName = 'Unknown';
  }
  
  // Try to find existing brand
  const found = await db.select().from(brands).where(eq(brands.name, brandName));
  let brand = found && found.length > 0 ? found[0] : null;
  
  if (!brand) {
    const inserted = await db.insert(brands).values({ 
      name: brandName, 
      description: `Brand: ${brandName}` 
    }).returning();
    return inserted[0].id;
  }
  return brand.id;
}

// Extract brand from product name
function extractBrandFromName(productName) {
  const brandPatterns = [
    { pattern: /\bPuma\b/i, brand: 'Puma' },
    { pattern: /\bNike\b/i, brand: 'Nike' },
    { pattern: /\bAdidas\b/i, brand: 'Adidas' },
    { pattern: /\bNew Balance\b/i, brand: 'New Balance' },
    { pattern: /\bVans\b/i, brand: 'Vans' },
    { pattern: /\bAsics\b/i, brand: 'Asics' },
    { pattern: /\bHoka\b/i, brand: 'Hoka' },
    { pattern: /\bSaucony\b/i, brand: 'Saucony' },
    { pattern: /\bERL\b/i, brand: 'ERL' },
    { pattern: /\bSalomon\b/i, brand: 'Salomon' },
    { pattern: /\bY-3\b/i, brand: 'Y-3' }
  ];
  
  for (const { pattern, brand } of brandPatterns) {
    if (pattern.test(productName)) {
      return brand;
    }
  }
  
  return null;
}

async function importCSV() {
  // ESM-compatible __dirname
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const csvPath = path.resolve(__dirname, '../shoes.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('❌ shoes.csv not found at', csvPath);
    process.exit(1);
  }
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  let count = 0;
  for (const record of records) {
    // Map title to name
    const name = record.title ? record.title.trim() : '';
    if (!name) continue; // skip if no name

    // Generate slug
    const baseSlug = slugify(name);
    if (!baseSlug) continue;

    // Extract brand from product name or use CSV brand field
    const extractedBrand = extractBrandFromName(name);
    const brandName = extractedBrand || record.brand || 'Unknown';
    const brandId = await getOrCreateBrand(brandName);

    // Parse price - handle "En rupture de stock" and other non-numeric values
    let price = 0;
    if (record.price && record.price !== 'En rupture de stock' && record.price.trim() !== '') {
      price = parseFloat(record.price.replace(/[^0-9.,]/g, '').replace(',', '.'));
      if (isNaN(price) || price <= 0) {
        price = 0; // Set to 0 for out of stock items
      }
    } else {
      // Assign sample prices for out of stock items to make them more realistic
      const samplePrices = [89.99, 129.99, 149.99, 179.99, 199.99, 229.99, 259.99, 299.99];
      price = samplePrices[Math.floor(Math.random() * samplePrices.length)];
    }

    // Insert only if required fields are present
    try {
      // Generate a unique slug (avoid skipping on conflicts)
      const slug = await ensureUniqueSlug(baseSlug);
      const productResult = await db.insert(products).values({
        name,
        slug,
        brandId,
        price,
        description: record.description || '',
        sku: record.sku || null,
        isActive: true,
      }).returning();
      
      // Add image if available
      if (record.image_url && productResult.length > 0) {
        const imageUrl = record.image_url.startsWith('//') ? `https:${record.image_url}` : record.image_url;
        await db.insert(images).values({
          productId: productResult[0].id,
          url: imageUrl,
          alt: name,
          isPrimary: true,
          sortOrder: 1
        });
      }
      
      count++;
    } catch (err) {
      console.error('Failed to insert product:', record, err);
    }
  }
  console.log(`✅ Imported ${count} products from shoes.csv`);
}

importCSV().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});

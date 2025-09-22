import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { products, brands, images, variants } from '$lib/db/schema';
import { and, eq, desc, sql } from 'drizzle-orm';

function toSlug(input: string): string {
  return (input || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function parsePrice(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  const cleaned = value
    .replace(/\s/g, '')
    .replace(/€/g, '')
    .replace(/[^0-9.,-]/g, '')
    .replace(/,(?=\d{3}\b)/g, '');
  const withDot = cleaned.replace(',', '.');
  const num = Number(withDot);
  return isFinite(num) ? num : 0;
}

// Returns rows from local DB; keeps the same response shape as before when mapped=true
export const GET: RequestHandler = async ({ url }) => {
  try {
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const mapped = (url.searchParams.get('mapped') || 'false').toLowerCase() === 'true';

    // Query local products with primary image and brand
    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        sku: products.sku,
        isVegan: products.isVegan,
        hasSteelToe: products.hasSteelToe,
        createdAt: products.createdAt,
        brandId: brands.id,
        brandName: brands.name,
        brandLogoUrl: brands.logoUrl,
        imageUrl: images.url,
        imageAlt: images.alt,
        stock: sql<number>`COALESCE(SUM(${variants.stock}), 0)`.as('stock')
      })
      .from(products)
      .innerJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(images, and(eq(images.productId, products.id), eq(images.isPrimary, true)))
      .leftJoin(variants, eq(variants.productId, products.id))
      .groupBy(products.id, brands.id, images.id)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    if (!mapped) {
      return json({ rows, count: rows.length });
    }

    const mappedProducts = rows.map((r) => ({
      id: String(r.id),
      name: r.name,
      slug: r.slug,
      description: r.description,
      shortDescription: r.shortDescription,
      price: r.price,
      compareAtPrice: r.compareAtPrice,
      sku: r.sku,
      isVegan: r.isVegan,
      hasSteelToe: r.hasSteelToe,
      createdAt: r.createdAt,
      brand: { id: r.brandId, name: r.brandName, logoUrl: r.brandLogoUrl },
      image: r.imageUrl ? { url: r.imageUrl, alt: r.imageAlt || r.name } : null,
      stock: r.stock || 0
    }));

    return json({ products: mappedProducts, pagination: { limit, offset, count: mappedProducts.length } });
  } catch (error) {
    console.error('Asphaltgold API error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};



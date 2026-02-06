// en haut du fichier
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { products, brands, images, variants, productCategories, categories } from '$lib/db/schema';
import { eq, and, gte, lte, desc, asc, sql, count } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const page = parseInt(url.searchParams.get('page') || '1', 10);

    // ⬇️ supporte "all" (sinon borne haute)
    const rawLimit = url.searchParams.get('limit') || '20';
    const limit = rawLimit === 'all' ? 10000 : parseInt(rawLimit, 10);

    const search = url.searchParams.get('search') || '';
    const brandId = url.searchParams.get('brand');
    const categoryId = url.searchParams.get('category');
    const gender = url.searchParams.get('gender');
    const isVegan = url.searchParams.get('vegan') === 'true';
    const hasSteelToe = url.searchParams.get('steel_toe') === 'true';
    const minPrice = url.searchParams.get('min_price');
    const maxPrice = url.searchParams.get('max_price');
    const sortBy = url.searchParams.get('sort') || 'created_at';
    const sortOrder = (url.searchParams.get('order') || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const offset = (page - 1) * limit;

    // WHERE
    const whereConditions = [eq(products.isActive, true)];
    if (search) {
      whereConditions.push(
        sql`(${products.name} LIKE ${`%${search}%`} OR ${products.description} LIKE ${`%${search}%`} OR ${products.shortDescription} LIKE ${`%${search}%`} OR ${brands.name} LIKE ${`%${search}%`})`
      );
    }
    if (brandId) whereConditions.push(eq(products.brandId, parseInt(brandId, 10)));
    if (isVegan) whereConditions.push(eq(products.isVegan, true));
    if (hasSteelToe) whereConditions.push(eq(products.hasSteelToe, true));
    if (minPrice) whereConditions.push(gte(products.price, parseFloat(minPrice)));
    if (maxPrice) whereConditions.push(lte(products.price, parseFloat(maxPrice)));
    
    // Filtre par genre basé sur les tailles des variantes
    if (gender) {
      let sizeConditions;
      switch (gender) {
        case 'homme':
          sizeConditions = sql`EXISTS (SELECT 1 FROM ${variants} v WHERE v.product_id = ${products.id} AND v.size >= 42 AND v.size <= 50)`;
          break;
        case 'femme':
          sizeConditions = sql`EXISTS (SELECT 1 FROM ${variants} v WHERE v.product_id = ${products.id} AND v.size >= 36 AND v.size <= 41)`;
          break;
        case 'enfant':
          sizeConditions = sql`EXISTS (SELECT 1 FROM ${variants} v WHERE v.product_id = ${products.id} AND v.size >= 20 AND v.size <= 35)`;
          break;
        default:
          sizeConditions = null;
      }
      if (sizeConditions) {
        whereConditions.push(sizeConditions);
      }
    }

    // ORDER
    let orderBy;
    switch (sortBy) {
      case 'price':
        orderBy = sortOrder === 'ASC' ? asc(products.price) : desc(products.price);
        break;
      case 'name':
        orderBy = sortOrder === 'ASC' ? asc(products.name) : desc(products.name);
        break;
      default:
        orderBy = desc(products.createdAt);
    }

    // ⬇️ Sous-requêtes image & stock (plus besoin de LEFT JOIN images/variants)
    const firstImageUrl = sql<string>`(
      SELECT i.url FROM ${images} i
      WHERE i.product_id = ${products.id}
      ORDER BY i.is_primary DESC, i.sort_order ASC, i.id ASC
      LIMIT 1
    )`.as('imageUrl');

    const firstImageAlt = sql<string>`(
      SELECT i.alt FROM ${images} i
      WHERE i.product_id = ${products.id}
      ORDER BY i.is_primary DESC, i.sort_order ASC, i.id ASC
      LIMIT 1
    )`.as('imageAlt');

    const totalStock = sql<number>`COALESCE((
      SELECT SUM(v.stock) FROM ${variants} v
      WHERE v.product_id = ${products.id}
    ), 0)`.as('stock');

    // Requête principale
    let query = db
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
        imageUrl: firstImageUrl,   // ✅ assure une image si elle existe
        imageAlt: firstImageAlt,
        stock: totalStock          // ✅ sans dupliquer les lignes
      })
      .from(products)
      .innerJoin(brands, eq(products.brandId, brands.id))
      .where(and(...whereConditions))               // ✅ corrige le spread
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Filtre catégorie (on garde les champs sélectionnés inchangés)
    if (categoryId) {
      query = query
        .innerJoin(productCategories, eq(productCategories.productId, products.id))
        .innerJoin(categories, eq(productCategories.categoryId, categories.id))
        .where(and(...whereConditions, eq(categories.id, parseInt(categoryId, 10))));
    }

    // Count
    let countQuery = db
      .select({ count: count() })
      .from(products)
      .innerJoin(brands, eq(products.brandId, brands.id))
      .where(and(...whereConditions));

    if (categoryId) {
      countQuery = countQuery
        .innerJoin(productCategories, eq(productCategories.productId, products.id))
        .innerJoin(categories, eq(productCategories.categoryId, categories.id))
        .where(and(...whereConditions, eq(categories.id, parseInt(categoryId, 10))));
    }

    const [productsResult, countResult] = await Promise.all([query, countQuery]);
    const total = countResult[0]?.count || 0;
    const totalPages = Math.ceil(total / Math.max(1, limit));

    return json({
      products: productsResult,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Products API error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

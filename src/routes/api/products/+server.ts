import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { products, brands, images, variants, productCategories, categories } from '$lib/db/schema';
import { eq, and, like, gte, lte, desc, asc, sql, count } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';
    const brandId = url.searchParams.get('brand');
    const categoryId = url.searchParams.get('category');
    const isVegan = url.searchParams.get('vegan');
    const hasSteelToe = url.searchParams.get('steel_toe');
    const minPrice = url.searchParams.get('min_price');
    const maxPrice = url.searchParams.get('max_price');
    const sortBy = url.searchParams.get('sort') || 'created_at';
    const sortOrder = (url.searchParams.get('order') || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [eq(products.isActive, true)];

    if (search) {
      whereConditions.push(
        sql`(${products.name} LIKE ${`%${search}%`} OR ${products.description} LIKE ${`%${search}%`} OR ${products.shortDescription} LIKE ${`%${search}%`})`
      );
    }
    
    if (brandId) {
      whereConditions.push(eq(products.brandId, parseInt(brandId)));
    }
    
    if (isVegan === 'true') {
      whereConditions.push(eq(products.isVegan, true));
    }
    
    if (hasSteelToe === 'true') {
      whereConditions.push(eq(products.hasSteelToe, true));
    }
    
    if (minPrice) {
      whereConditions.push(gte(products.price, parseFloat(minPrice)));
    }
    
    if (maxPrice) {
      whereConditions.push(lte(products.price, parseFloat(maxPrice)));
    }

    // Build order by
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

    // Main query with joins
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
        imageUrl: images.url,
        imageAlt: images.alt,
        stock: sql<number>`COALESCE(SUM(${variants.stock}), 0)`.as('stock')
      })
      .from(products)
      .innerJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(images, and(
        eq(images.productId, products.id),
        eq(images.isPrimary, true)
      ))
      .leftJoin(variants, eq(variants.productId, products.id))
      .where(and(...whereConditions))
      .groupBy(products.id, brands.id, images.id)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Add category filter if specified
    if (categoryId) {
      query = query
        .innerJoin(productCategories, eq(productCategories.productId, products.id))
        .innerJoin(categories, eq(productCategories.categoryId, categories.id))
        .where(and(...whereConditions, eq(categories.id, parseInt(categoryId))));
    }

    // Count query
    let countQuery = db
      .select({ count: count() })
      .from(products)
      .innerJoin(brands, eq(products.brandId, brands.id))
      .where(and(...whereConditions));

    if (categoryId) {
      countQuery = countQuery
        .innerJoin(productCategories, eq(productCategories.productId, products.id))
        .innerJoin(categories, eq(productCategories.categoryId, categories.id))
        .where(and(...whereConditions, eq(categories.id, parseInt(categoryId))));
    }

    const [productsResult, countResult] = await Promise.all([
      query,
      countQuery
    ]);

    const total = countResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

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

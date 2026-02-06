import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { products, brands, variants, images, productCategories, categories } from '$lib/db/schema';
import { eq, and, like, desc, count, inArray } from 'drizzle-orm';
import { broadcastStockUpdate } from '$lib/realtime/stock';

export const GET: RequestHandler = async ({ url, locals }) => {
  // Check admin access
  if (!locals.user || (locals.user.role !== 'ADMIN' && locals.user.role !== 'STAFF')) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';
    const brandId = url.searchParams.get('brand');
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];
    
    if (search) {
      whereConditions.push(like(products.name, `%${search}%`));
    }
    
    if (brandId) {
      whereConditions.push(eq(products.brandId, parseInt(brandId)));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get products with pagination
    const productsResult = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        sku: products.sku,
        isVegan: products.isVegan,
        hasSteelToe: products.hasSteelToe,
        isActive: products.isActive,
        createdAt: products.createdAt,
        brandId: brands.id,
        brandName: brands.name
      })
      .from(products)
      .innerJoin(brands, eq(products.brandId, brands.id))
      .where(whereClause)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    // Map to include nested brand object expected by frontend
    const productsPayload = productsResult.map((p) => ({
      ...p,
      brand: { id: p.brandId, name: p.brandName }
    }));

    // Get total count
    const countResult = await db
      .select({ count: count() })
      .from(products)
      .innerJoin(brands, eq(products.brandId, brands.id))
      .where(whereClause);

    const total = countResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return json({
      products: productsPayload,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Admin products API error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user || (locals.user.role !== 'ADMIN' && locals.user.role !== 'STAFF')) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      product: productInput,
      variants: variantInputs = [],
      images: imageInputs = [],
      categoryIds = []
    } = body;

    if (!productInput?.name || !productInput?.slug || !productInput?.brandId || !productInput?.price) {
      return json({ error: 'Missing required product fields' }, { status: 400 });
    }

    const [createdProduct] = await db
      .insert(products)
      .values({
        name: productInput.name,
        slug: productInput.slug,
        description: productInput.description ?? null,
        shortDescription: productInput.shortDescription ?? null,
        brandId: productInput.brandId,
        price: productInput.price,
        compareAtPrice: productInput.compareAtPrice ?? null,
        sku: productInput.sku ?? null,
        isVegan: productInput.isVegan ?? false,
        hasSteelToe: productInput.hasSteelToe ?? false,
        isActive: productInput.isActive ?? true,
        metaTitle: productInput.metaTitle ?? null,
        metaDescription: productInput.metaDescription ?? null
      })
      .returning();

    if (!createdProduct) {
      return json({ error: 'Failed to create product' }, { status: 500 });
    }

    // Categories
    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      // Optional: validate categories exist
      const existingCats = await db.select({ id: categories.id }).from(categories).where(inArray(categories.id, categoryIds));
      const validIds = new Set(existingCats.map((c) => c.id));
      const values = categoryIds.filter((id: number) => validIds.has(id)).map((id: number) => ({ productId: createdProduct.id, categoryId: id }));
      if (values.length > 0) {
        await db.insert(productCategories).values(values);
      }
    }

    // Images
    if (Array.isArray(imageInputs) && imageInputs.length > 0) {
      const values = imageInputs.map((img: any, index: number) => ({
        productId: createdProduct.id,
        url: img.url,
        alt: img.alt ?? null,
        sortOrder: typeof img.sortOrder === 'number' ? img.sortOrder : index,
        isPrimary: img.isPrimary ?? index === 0
      }));
      await db.insert(images).values(values);
    }

    // Variants
    let createdVariants: any[] = [];
    if (Array.isArray(variantInputs) && variantInputs.length > 0) {
      const values = variantInputs.map((v: any) => ({
        productId: createdProduct.id,
        size: v.size,
        color: v.color ?? null,
        sku: v.sku ?? null,
        price: typeof v.price === 'number' ? v.price : null,
        stock: typeof v.stock === 'number' ? v.stock : 0,
        onHand: typeof v.onHand === 'number' ? v.onHand : (typeof v.stock === 'number' ? v.stock : 0),
        reserved: typeof v.reserved === 'number' ? v.reserved : 0,
        isActive: v.isActive ?? true
      }));
      createdVariants = await db.insert(variants).values(values).returning();
    }

    // Broadcast initial stock
    for (const v of createdVariants) {
      broadcastStockUpdate({ productId: createdProduct.id, variantId: v.id, stock: v.stock });
    }

    return json({ product: createdProduct, variants: createdVariants }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const PATCH: RequestHandler = async ({ request, locals }) => {
  if (!locals.user || (locals.user.role !== 'ADMIN' && locals.user.role !== 'STAFF')) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { productId, product: productInput, variants: variantInputs, images: imageInputs, categoryIds } = body;

    if (!productId) {
      return json({ error: 'Missing productId' }, { status: 400 });
    }

    // Update product
    if (productInput) {
      await db
        .update(products)
        .set({
          name: productInput.name,
          slug: productInput.slug,
          description: productInput.description,
          shortDescription: productInput.shortDescription,
          brandId: productInput.brandId,
          price: productInput.price,
          compareAtPrice: productInput.compareAtPrice,
          sku: productInput.sku,
          isVegan: productInput.isVegan,
          hasSteelToe: productInput.hasSteelToe,
          isActive: productInput.isActive,
          metaTitle: productInput.metaTitle,
          metaDescription: productInput.metaDescription,
          updatedAt: new Date().toISOString()
        })
        .where(eq(products.id, productId));
    }

    // Update categories (replace)
    if (Array.isArray(categoryIds)) {
      await db.delete(productCategories).where(eq(productCategories.productId, productId));
      if (categoryIds.length > 0) {
        const existingCats = await db.select({ id: categories.id }).from(categories).where(inArray(categories.id, categoryIds));
        const validIds = new Set(existingCats.map((c) => c.id));
        const values = categoryIds.filter((id: number) => validIds.has(id)).map((id: number) => ({ productId, categoryId: id }));
        if (values.length > 0) {
          await db.insert(productCategories).values(values);
        }
      }
    }

    // Update images (replace)
    if (Array.isArray(imageInputs)) {
      await db.delete(images).where(eq(images.productId, productId));
      if (imageInputs.length > 0) {
        const values = imageInputs.map((img: any, index: number) => ({
          productId,
          url: img.url,
          alt: img.alt ?? null,
          sortOrder: typeof img.sortOrder === 'number' ? img.sortOrder : index,
          isPrimary: img.isPrimary ?? index === 0
        }));
        await db.insert(images).values(values);
      }
    }

    // Update variants: upsert simplistic (replace all)
    let updatedVariants: any[] = [];
    if (Array.isArray(variantInputs)) {
      await db.delete(variants).where(eq(variants.productId, productId));
      if (variantInputs.length > 0) {
        const values = variantInputs.map((v: any) => ({
          productId,
          size: v.size,
          color: v.color ?? null,
          sku: v.sku ?? null,
          price: typeof v.price === 'number' ? v.price : null,
          stock: typeof v.stock === 'number' ? v.stock : 0,
          onHand: typeof v.onHand === 'number' ? v.onHand : (typeof v.stock === 'number' ? v.stock : 0),
          reserved: typeof v.reserved === 'number' ? v.reserved : 0,
          isActive: v.isActive ?? true
        }));
        updatedVariants = await db.insert(variants).values(values).returning();
      }
    }

    for (const v of updatedVariants) {
      broadcastStockUpdate({ productId, variantId: v.id, stock: v.stock });
    }

    return json({ success: true });
  } catch (error) {
    console.error('Update product error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url, locals }) => {
  if (!locals.user || (locals.user.role !== 'ADMIN' && locals.user.role !== 'STAFF')) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const idParam = url.searchParams.get('productId');
    if (!idParam) {
      return json({ error: 'Missing productId' }, { status: 400 });
    }
    const productId = parseInt(idParam);
    await db.delete(products).where(eq(products.id, productId));
    return json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

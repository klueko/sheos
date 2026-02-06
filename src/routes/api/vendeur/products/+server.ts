import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { products, brands, variants, images, productCategories, categories } from '$lib/db/schema';
import { eq, and, like, desc, count, inArray } from 'drizzle-orm';
import { broadcastStockUpdate } from '$lib/realtime/stock';
import { saveUpload } from '$lib/server/uploads';

function requireVendorOrAdmin(locals: App.Locals) {
  if (!locals.user || !(locals.user.role === 'VENDEUR' || locals.user.role === 'ADMIN')) {
    return false;
  }
  return true;
}

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!requireVendorOrAdmin(locals)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';
    const brandId = url.searchParams.get('brand');
    const offset = (page - 1) * limit;

    const whereConditions = [] as any[];
    if (search) whereConditions.push(like(products.name, `%${search}%`));
    if (brandId) whereConditions.push(eq(products.brandId, parseInt(brandId)));
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

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

    // Get variants with stock info for each product
    const productIds = productsResult.map(p => p.id);
    const variantsResult = productIds.length > 0 ? await db
      .select({
        productId: variants.productId,
        id: variants.id,
        size: variants.size,
        color: variants.color,
        stock: variants.stock,
        onHand: variants.onHand,
        reserved: variants.reserved,
        isActive: variants.isActive
      })
      .from(variants)
      .where(inArray(variants.productId, productIds))
      .orderBy(variants.size) : [];

    // Get images for each product
    const imagesResult = productIds.length > 0 ? await db
      .select({
        productId: images.productId,
        id: images.id,
        url: images.url,
        alt: images.alt,
        sortOrder: images.sortOrder,
        isPrimary: images.isPrimary
      })
      .from(images)
      .where(inArray(images.productId, productIds))
      .orderBy(images.sortOrder, images.id) : [];

    // Group variants by product
    const variantsByProduct = variantsResult.reduce((acc, variant) => {
      if (!acc[variant.productId]) acc[variant.productId] = [];
      acc[variant.productId].push(variant);
      return acc;
    }, {} as Record<number, typeof variantsResult>);

    // Group images by product
    const imagesByProduct = imagesResult.reduce((acc, image) => {
      if (!acc[image.productId]) acc[image.productId] = [];
      acc[image.productId].push(image);
      return acc;
    }, {} as Record<number, typeof imagesResult>);

    const productsPayload = productsResult.map((p) => ({
      ...p,
      brand: { id: p.brandId, name: p.brandName },
      variants: variantsByProduct[p.id] || [],
      images: imagesByProduct[p.id] || [],
      totalStock: (variantsByProduct[p.id] || []).reduce((sum, v) => sum + (v.stock || 0), 0),
      totalOnHand: (variantsByProduct[p.id] || []).reduce((sum, v) => sum + (v.onHand || 0), 0)
    }));

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
    console.error('Vendor products API error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!requireVendorOrAdmin(locals)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    let productInput: any;
    let variantInputs: any[] = [];
    let categoryIds: number[] = [];
    let imageUrl: string | undefined;
    let imageFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      // Send product/variants/categoryIds as JSON string in form
      productInput = JSON.parse(String(form.get('product') || '{}'));
      variantInputs = JSON.parse(String(form.get('variants') || '[]'));
      categoryIds = JSON.parse(String(form.get('categoryIds') || '[]'));

      // Two possible fields from UI:
      imageUrl = String(form.get('imageUrl') || '').trim() || undefined;
      const f = form.get('imageFile');
      imageFile = f instanceof File ? f : null;
    } else {
      const body = await request.json();
      productInput = body.product;
      variantInputs = body.variants ?? [];
      categoryIds = body.categoryIds ?? [];
      // JSON compatibility: array of images [{url,...}]
      imageUrl = body.images?.[0]?.url;
    }

    if (!productInput?.name || !productInput?.slug || (!productInput?.brandId && !productInput?.brandName) || !productInput?.price) {
      return json({ error: 'Missing required product fields' }, { status: 400 });
    }

    // Resolve brand by name if provided
    let resolvedBrandId = productInput.brandId;
    if (!resolvedBrandId && productInput.brandName) {
      const existing = await db.select().from(brands).where(like(brands.name, productInput.brandName)).limit(1);
      if (existing[0]) {
        resolvedBrandId = existing[0].id;
      } else {
        const [createdBrand] = await db.insert(brands).values({ name: productInput.brandName }).returning();
        resolvedBrandId = createdBrand.id;
      }
    }

    const [createdProduct] = await db
      .insert(products)
      .values({
        name: productInput.name,
        slug: productInput.slug,
        description: productInput.description ?? null,
        shortDescription: productInput.shortDescription ?? null,
        brandId: resolvedBrandId!,
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

    if (!createdProduct) return json({ error: 'Failed to create product' }, { status: 500 });

    // Categories (unchanged)
    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      const existingCats = await db.select({ id: categories.id }).from(categories).where(inArray(categories.id, categoryIds));
      const validIds = new Set(existingCats.map((c) => c.id));
      const values = categoryIds.filter((id: number) => validIds.has(id)).map((id: number) => ({ productId: createdProduct.id, categoryId: id }));
      if (values.length > 0) await db.insert(productCategories).values(values);
    }

    // Variants (unchanged)
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

    for (const v of createdVariants) {
      broadcastStockUpdate({ productId: createdProduct.id, variantId: v.id, stock: v.stock });
    }

    // IMAGES — NEW
    let finalUrl: string | undefined = imageUrl;

    // If no URL provided but file is uploaded → save file and generate local URL
    if (!finalUrl && imageFile) {
      try {
        finalUrl = await saveUpload(imageFile, 'products');
      } catch (error) {
        console.error('Failed to save uploaded image:', error);
        // Continue without image rather than failing the whole request
      }
    }

    if (finalUrl) {
      await db.insert(images).values({
        productId: createdProduct.id,
        url: finalUrl,
        alt: productInput.name,
        sortOrder: 0,
        isPrimary: true
      });
    }

    return json({ product: createdProduct, variants: createdVariants }, { status: 201 });
  } catch (error) {
    console.error('Vendor create product error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const PATCH: RequestHandler = async ({ request, locals }) => {
  if (!requireVendorOrAdmin(locals)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { productId, product: productInput, variants: variantInputs, images: imageInputs, categoryIds } = body;
    if (!productId) return json({ error: 'Missing productId' }, { status: 400 });

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

    if (Array.isArray(categoryIds)) {
      await db.delete(productCategories).where(eq(productCategories.productId, productId));
      if (categoryIds.length > 0) {
        const existingCats = await db.select({ id: categories.id }).from(categories).where(inArray(categories.id, categoryIds));
        const validIds = new Set(existingCats.map((c) => c.id));
        const values = categoryIds.filter((id: number) => validIds.has(id)).map((id: number) => ({ productId, categoryId: id }));
        if (values.length > 0) await db.insert(productCategories).values(values);
      }
    }

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
    console.error('Vendor update product error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url, locals }) => {
  if (!requireVendorOrAdmin(locals)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const idParam = url.searchParams.get('productId');
    if (!idParam) return json({ error: 'Missing productId' }, { status: 400 });
    const productId = parseInt(idParam);
    await db.delete(products).where(eq(products.id, productId));
    return json({ success: true });
  } catch (error) {
    console.error('Vendor delete product error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};



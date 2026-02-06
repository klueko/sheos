import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import {
  products,
  brands,
  variants,
  images,
  productCategories,
  orders,
  orderItems,
  users
} from '$lib/db/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';

function requireVendorOrAdmin(locals: App.Locals) {
  if (!locals.user || !(locals.user.role === 'VENDEUR' || locals.user.role === 'ADMIN')) {
    return false;
  }
  return true;
}

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!requireVendorOrAdmin(locals)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const productId = parseInt(params.id);
    if (!productId) return json({ error: 'Invalid product ID' }, { status: 400 });

    const productRows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        brandId: products.brandId,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        sku: products.sku,
        isVegan: products.isVegan,
        hasSteelToe: products.hasSteelToe,
        isActive: products.isActive,
        metaTitle: products.metaTitle,
        metaDescription: products.metaDescription,
        createdAt: products.createdAt,
        brandName: brands.name
      })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(eq(products.id, productId))
      .limit(1);

    const product = productRows[0];
    if (!product) return json({ error: 'Not found' }, { status: 404 });

    const variantRows = await db
      .select({
        id: variants.id,
        size: variants.size,
        color: variants.color,
        sku: variants.sku,
        price: variants.price,
        stock: variants.stock,
        onHand: variants.onHand,
        reserved: variants.reserved,
        isActive: variants.isActive
      })
      .from(variants)
      .where(eq(variants.productId, productId));

    const imageRows = await db
      .select({
        id: images.id,
        url: images.url,
        alt: images.alt,
        sortOrder: images.sortOrder,
        isPrimary: images.isPrimary
      })
      .from(images)
      .where(eq(images.productId, productId));

    const catRows = await db
      .select({ categoryId: productCategories.categoryId })
      .from(productCategories)
      .where(eq(productCategories.productId, productId));

    // Customer stats: number of orders and total quantity per client for this product
    const customerStatsRaw = await db
      .select({
        userId: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        orderCount: sql<number>`COUNT(DISTINCT ${orders.id})`.as('orderCount'),
        totalQuantity: sql<number>`IFNULL(SUM(${orderItems.quantity}), 0)`.as('totalQuantity')
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(variants, eq(orderItems.variantId, variants.id))
      .innerJoin(users, eq(orders.userId, users.id))
      .where(
        and(
          eq(variants.productId, productId),
          inArray(orders.status, ['PAID', 'SHIPPED', 'DELIVERED'])
        )
      )
      .groupBy(users.id);

    const customerStats = customerStatsRaw.map((row) => ({
      userId: row.userId,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      orderCount: row.orderCount,
      totalQuantity: row.totalQuantity
    }));

    return json({
      product: {
        ...product,
        brand: product.brandName ? { id: product.brandId, name: product.brandName } : undefined
      },
      variants: variantRows,
      images: imageRows,
      categoryIds: catRows.map((c) => c.categoryId),
      customerStats
    });
  } catch (error) {
    console.error('Vendor product details error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};



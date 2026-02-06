import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { variants } from '$lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const productId = parseInt(params.id);
    if (Number.isNaN(productId)) {
      return json({ error: 'Invalid product id' }, { status: 400 });
    }

    const productVariants = await db
      .select({
        id: variants.id,
        productId: variants.productId,
        size: variants.size,
        color: variants.color,
        sku: variants.sku,
        price: variants.price,
        stock: variants.stock,
        onHand: variants.onHand,
        reserved: variants.reserved,
        isActive: variants.isActive,
        createdAt: variants.createdAt,
        updatedAt: variants.updatedAt
      })
      .from(variants)
      .where(and(eq(variants.productId, productId), eq(variants.isActive, true)))
      .orderBy(asc(variants.size));

    return json({ variants: productVariants });
  } catch (error) {
    console.error('Product variants API error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

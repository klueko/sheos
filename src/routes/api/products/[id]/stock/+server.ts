import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { variants } from '$lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const productId = parseInt(params.id);
    if (Number.isNaN(productId)) {
      return json({ error: 'Invalid product id' }, { status: 400 });
    }

    const [row] = await db
      .select({ stock: sql<number>`COALESCE(SUM(${variants.stock}), 0)` })
      .from(variants)
      .where(eq(variants.productId, productId));

    return json({ stock: row?.stock ?? 0 });
  } catch (error) {
    console.error('Product stock API error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};



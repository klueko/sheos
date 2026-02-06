import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { variants } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { broadcastStockUpdate } from '$lib/realtime/stock';

function requireVendorOrAdmin(locals: App.Locals) {
  if (!locals.user || !(locals.user.role === 'VENDEUR' || locals.user.role === 'ADMIN')) {
    return false;
  }
  return true;
}

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  if (!requireVendorOrAdmin(locals)) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const productId = parseInt(params.id);
    if (!productId) return json({ error: 'Invalid product ID' }, { status: 400 });

    const body = await request.json();
    const { variantId, stock, onHand, reserved } = body;

    if (!variantId) return json({ error: 'Missing variantId' }, { status: 400 });

    // Verify variant belongs to product
    const existingVariant = await db
      .select()
      .from(variants)
      .where(and(eq(variants.id, variantId), eq(variants.productId, productId)))
      .limit(1);

    if (!existingVariant[0]) {
      return json({ error: 'Variant not found or does not belong to product' }, { status: 404 });
    }

    const updateData: any = {};
    if (typeof stock === 'number') updateData.stock = stock;
    if (typeof onHand === 'number') updateData.onHand = onHand;
    if (typeof reserved === 'number') updateData.reserved = reserved;
    updateData.updatedAt = new Date().toISOString();

    if (Object.keys(updateData).length === 1) { // Only updatedAt
      return json({ error: 'No valid stock data provided' }, { status: 400 });
    }

    const [updatedVariant] = await db
      .update(variants)
      .set(updateData)
      .where(eq(variants.id, variantId))
      .returning();

    if (!updatedVariant) {
      return json({ error: 'Failed to update variant' }, { status: 500 });
    }

    // Broadcast stock update
    broadcastStockUpdate({ 
      productId, 
      variantId: updatedVariant.id, 
      stock: updatedVariant.stock 
    });

    return json({ variant: updatedVariant });
  } catch (error) {
    console.error('Vendor stock update error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

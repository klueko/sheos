import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { carts, cartItems, variants, products, brands, images } from '$lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    let cart;
    
    if (locals.user) {
      // Get user's cart
      cart = await db
        .select()
        .from(carts)
        .where(eq(carts.userId, locals.user.id))
        .orderBy(desc(carts.createdAt))
        .limit(1);
    } else {
      // For guest users, we'd need to implement session-based cart
      // For now, return empty cart
      return json({ items: [], total: 0 });
    }

    if (!cart || cart.length === 0) {
      return json({ items: [], total: 0 });
    }

    // Get cart items with product details
    const items = await db
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        variantId: cartItems.variantId,
        size: variants.size,
        color: variants.color,
        // Always use base product price
        price: products.price,
        productId: products.id,
        productName: products.name,
        productSlug: products.slug,
        brandName: brands.name,
        imageUrl: images.url
      })
      .from(cartItems)
      .innerJoin(variants, eq(cartItems.variantId, variants.id))
      .innerJoin(products, eq(variants.productId, products.id))
      .innerJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(images, and(
        eq(images.productId, products.id),
        eq(images.isPrimary, true)
      ))
      .where(eq(cartItems.cartId, cart[0].id));

    const total = items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);

    return json({ items, total });
  } catch (error) {
    console.error('Cart API error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const { variantId, quantity } = await request.json();

    if (!variantId || !quantity) {
      return json({ error: 'Missing variantId or quantity' }, { status: 400 });
    }

    // Check if variant exists and is active
    const variant = await db
      .select()
      .from(variants)
      .where(and(eq(variants.id, variantId), eq(variants.isActive, true)))
      .limit(1);

    if (!variant || variant.length === 0) {
      return json({ error: 'Variant not found' }, { status: 404 });
    }

    let cart;
    
    if (locals.user) {
      // Get or create user's cart
      cart = await db
        .select()
        .from(carts)
        .where(eq(carts.userId, locals.user.id))
        .orderBy(desc(carts.createdAt))
        .limit(1);

      if (!cart || cart.length === 0) {
        const newCart = await db
          .insert(carts)
          .values({ userId: locals.user.id })
          .returning();
        cart = newCart;
      }
    } else {
      // For guest users, we'd need to implement session-based cart
      return json({ error: 'Guest cart not implemented' }, { status: 501 });
    }

    // Check if item already exists in cart
    const existingItem = await db
      .select()
      .from(cartItems)
      .where(and(
        eq(cartItems.cartId, cart[0].id),
        eq(cartItems.variantId, variantId)
      ))
      .limit(1);

    if (existingItem && existingItem.length > 0) {
      // Update quantity
      await db
        .update(cartItems)
        .set({ quantity: existingItem[0].quantity + quantity })
        .where(eq(cartItems.id, existingItem[0].id));
    } else {
      // Add new item
      await db
        .insert(cartItems)
        .values({
          cartId: cart[0].id,
          variantId,
          quantity
        });
    }

    return json({ success: true });
  } catch (error) {
    console.error('Add to cart error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ request, locals }) => {
  try {
    const { itemId, quantity } = await request.json();

    if (!itemId || !quantity || quantity < 1) {
      return json({ error: 'Missing itemId or invalid quantity' }, { status: 400 });
    }

    if (!locals.user) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get user's cart
    const cart = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, locals.user.id))
      .orderBy(desc(carts.createdAt))
      .limit(1);

    if (!cart || cart.length === 0) {
      return json({ error: 'Cart not found' }, { status: 404 });
    }

    // Check if item belongs to user's cart
    const item = await db
      .select()
      .from(cartItems)
      .where(and(
        eq(cartItems.id, itemId),
        eq(cartItems.cartId, cart[0].id)
      ))
      .limit(1);

    if (!item || item.length === 0) {
      return json({ error: 'Item not found' }, { status: 404 });
    }

    // Update quantity
    await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, itemId));

    return json({ success: true });
  } catch (error) {
    console.error('Update cart item error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
  try {
    const { itemId } = await request.json();

    if (!itemId) {
      return json({ error: 'Missing itemId' }, { status: 400 });
    }

    if (!locals.user) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get user's cart
    const cart = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, locals.user.id))
      .orderBy(desc(carts.createdAt))
      .limit(1);

    if (!cart || cart.length === 0) {
      return json({ error: 'Cart not found' }, { status: 404 });
    }

    // Check if item belongs to user's cart
    const item = await db
      .select()
      .from(cartItems)
      .where(and(
        eq(cartItems.id, itemId),
        eq(cartItems.cartId, cart[0].id)
      ))
      .limit(1);

    if (!item || item.length === 0) {
      return json({ error: 'Item not found' }, { status: 404 });
    }

    // Delete item
    await db
      .delete(cartItems)
      .where(eq(cartItems.id, itemId));

    return json({ success: true });
  } catch (error) {
    console.error('Delete cart item error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
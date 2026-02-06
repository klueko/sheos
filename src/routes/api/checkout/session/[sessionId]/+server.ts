import { json } from '@sveltejs/kit';
import { stripe } from '$lib/stripe';
import { db } from '$lib/db';
import { orders, orderItems, addresses, variants, products, brands, images } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return json({ error: 'Session ID required' }, { status: 400 });
    }

    if (!locals.user) {
      return json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return json({ error: 'Session not found' }, { status: 404 });
    }

    // Get order from database
    const order = await db
      .select()
      .from(orders)
      .where(and(
        eq(orders.stripeSessionId, sessionId),
        eq(orders.userId, locals.user.id)
      ))
      .limit(1);

    if (!order || order.length === 0) {
      return json({ error: 'Order not found' }, { status: 404 });
    }

    // Get order items with product details
    const orderItemsData = await db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        price: orderItems.price,
        size: variants.size,
        color: variants.color,
        productId: products.id,
        productName: products.name,
        productSlug: products.slug,
        brandName: brands.name,
        imageUrl: images.url
      })
      .from(orderItems)
      .innerJoin(variants, eq(orderItems.variantId, variants.id))
      .innerJoin(products, eq(variants.productId, products.id))
      .innerJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(images, and(
        eq(images.productId, products.id),
        eq(images.isPrimary, true)
      ))
      .where(eq(orderItems.orderId, order[0].id));

    // Get shipping address
    let shippingAddress = null;
    if (order[0].shippingAddressId) {
      const address = await db
        .select()
        .from(addresses)
        .where(and(
          eq(addresses.id, order[0].shippingAddressId),
          eq(addresses.userId, locals.user.id)
        ))
        .limit(1);
      
      if (address && address.length > 0) {
        shippingAddress = address[0];
      }
    }

    return json({
      order: order[0],
      items: orderItemsData,
      shippingAddress,
      customer: {
        name: session.customer_details?.name,
        email: session.customer_details?.email
      }
    });
  } catch (error) {
    console.error('Get session details error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
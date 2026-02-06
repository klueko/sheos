import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { orders, orderItems, variants, products, addresses, users, images, brands } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params, locals }) => {
  // Check admin access
  if (!locals.user || (locals.user.role !== 'ADMIN' && locals.user.role !== 'STAFF')) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const orderId = parseInt(params.id);
    if (!orderId) {
      return json({ error: 'Invalid order ID' }, { status: 400 });
    }

    // Get order with user info
    const orderData = await db
      .select({
        order: {
          id: orders.id,
          orderNumber: orders.orderNumber,
          status: orders.status,
          subtotal: orders.subtotal,
          tax: orders.tax,
          shipping: orders.shipping,
          total: orders.total,
          currency: orders.currency,
          notes: orders.notes,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
          billingAddressId: orders.billingAddressId,
          shippingAddressId: orders.shippingAddressId
        },
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone
        }
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.id, orderId))
      .limit(1);

    if (orderData.length === 0) {
      return json({ error: 'Order not found' }, { status: 404 });
    }

    const { order, user } = orderData[0];

    // Get order items with product and variant details
    const items = await db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        price: orderItems.price,
        variant: {
          id: variants.id,
          size: variants.size,
          color: variants.color
        },
        product: {
          id: products.id,
          name: products.name,
          slug: products.slug
        },
        brand: {
          id: brands.id,
          name: brands.name
        },
        image: {
          url: images.url,
          alt: images.alt
        }
      })
      .from(orderItems)
      .innerJoin(variants, eq(orderItems.variantId, variants.id))
      .innerJoin(products, eq(variants.productId, products.id))
      .innerJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(images, and(
        eq(images.productId, products.id),
        eq(images.isPrimary, true)
      ))
      .where(eq(orderItems.orderId, orderId));

    // Get billing address
    let billingAddress = null;
    if (order.billingAddressId) {
      const [billing] = await db
        .select()
        .from(addresses)
        .where(eq(addresses.id, order.billingAddressId))
        .limit(1);
      billingAddress = billing || null;
    }

    // Get shipping address
    let shippingAddress = null;
    if (order.shippingAddressId) {
      const [shipping] = await db
        .select()
        .from(addresses)
        .where(eq(addresses.id, order.shippingAddressId))
        .limit(1);
      shippingAddress = shipping || null;
    }

    return json({
      order: {
        ...order,
        user
      },
      items: items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant,
        product: item.product,
        brand: item.brand,
        image: item.image
      })),
      billingAddress,
      shippingAddress
    });
  } catch (error) {
    console.error('Get order details error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

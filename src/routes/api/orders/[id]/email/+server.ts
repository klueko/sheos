import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { orders, orderItems, variants, products, addresses, users } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    return json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const orderId = parseInt(params.id);
    
    // Get order with items and addresses
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
          createdAt: orders.createdAt
        },
        user: {
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName
        },
        shippingAddress: {
          firstName: addresses.firstName,
          lastName: addresses.lastName,
          address1: addresses.address1,
          address2: addresses.address2,
          city: addresses.city,
          postalCode: addresses.postalCode,
          country: addresses.country
        }
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .leftJoin(addresses, eq(orders.shippingAddressId, addresses.id))
      .where(and(
        eq(orders.id, orderId),
        eq(orders.userId, locals.user.id)
      ))
      .limit(1);

    if (orderData.length === 0) {
      return json({ error: 'Order not found' }, { status: 404 });
    }

    const { order, user, shippingAddress } = orderData[0];

    // Get order items
    const items = await db
      .select({
        quantity: orderItems.quantity,
        price: orderItems.price,
        product: {
          name: products.name,
          images: products.images
        },
        variant: {
          size: variants.size,
          color: variants.color
        }
      })
      .from(orderItems)
      .innerJoin(variants, eq(orderItems.variantId, variants.id))
      .innerJoin(products, eq(variants.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    // Simulate email sending
    const emailData = {
      to: user.email,
      subject: `Confirmation de commande - ${order.orderNumber}`,
      order,
      items,
      shippingAddress,
      user: {
        firstName: user.firstName,
        lastName: user.lastName
      },
      sentAt: new Date().toISOString()
    };

    // Store the simulated email in localStorage (client-side simulation)
    // In a real app, you would send this email using a service like SendGrid, Mailgun, etc.
    console.log('📧 Email simulation:', emailData);

    return json({
      success: true,
      email: emailData,
      message: 'Email de confirmation envoyé avec succès'
    });
  } catch (error) {
    console.error('Send email error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

import { json } from '@sveltejs/kit';
import type Stripe from 'stripe';
import { stripe } from '$lib/stripe';
import { db } from '$lib/db';
import { orders, orderItems, carts, cartItems, variants, users, products, addresses } from '$lib/db/schema';
import { broadcastStockUpdate } from '$lib/realtime/stock';
import { eq, and } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { sendOrderConfirmationEmail } from '$lib/email';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
    if (!signature || !webhookSecret) {
      return json({ error: 'Missing signature or webhook secret' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const { userId, cartId, subtotal, tax, shipping, total, shippingAddressId, billingAddressId } = session.metadata || {};

    if (!userId || !cartId) {
      console.error('Missing metadata in checkout session');
      return;
    }

    // Generate order number
    const orderNumber = `SHEOS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        userId,
        status: 'PAID',
        subtotal: parseFloat(subtotal || '0'),
        tax: parseFloat(tax || '0'),
        shipping: parseFloat(shipping || '0'),
        total: parseFloat(total || '0'),
        currency: 'EUR',
        stripePaymentIntentId: session.payment_intent as string,
        shippingAddressId: shippingAddressId ? parseInt(String(shippingAddressId)) : null,
        billingAddressId: billingAddressId ? parseInt(String(billingAddressId)) : null,
      })
      .returning();

    // Get cart items
    const cartItemsData = await db
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        variant: {
          id: variants.id,
          productId: variants.productId,
          price: variants.price,
          stock: variants.stock,
          onHand: variants.onHand,
          reserved: variants.reserved
        }
      })
      .from(cartItems)
      .innerJoin(variants, eq(cartItems.variantId, variants.id))
      .where(eq(cartItems.cartId, parseInt(cartId)));

    // Create order items and update stock
    for (const item of cartItemsData) {
      const price = item.variant.price || 0;
      
      // Create order item
      await db
        .insert(orderItems)
        .values({
          orderId: order.id,
          variantId: item.variant.id,
          quantity: item.quantity,
          price
        });

      // Update stock (onHand/reserved model)
      const currentOnHand = typeof item.variant.onHand === 'number' ? item.variant.onHand : Math.max(0, (item.variant.stock ?? 0) - (item.variant.reserved ?? 0));
      const newOnHand = Math.max(0, currentOnHand - item.quantity);
      const newReserved = Math.max(0, (item.variant.reserved ?? 0) - item.quantity);
      const newStock = Math.max(0, newOnHand - newReserved);
      await db
        .update(variants)
        .set({ 
          stock: newStock,
          onHand: newOnHand,
          reserved: newReserved,
          updatedAt: new Date().toISOString()
        })
        .where(eq(variants.id, item.variant.id));

      broadcastStockUpdate({ productId: item.variant.productId as unknown as number, variantId: item.variant.id, stock: newStock });
    }

    // Clear cart
    await db
      .delete(cartItems)
      .where(eq(cartItems.cartId, parseInt(cartId)));

    // Send confirmation email (best-effort, do not throw)
    try {
      await sendOrderConfirmationEmailReal(order.id, orderNumber);
    } catch (e) {
      console.error('Order email send failed:', e);
    }

    console.log(`Order created: ${orderNumber}`);
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update order status if needed
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.stripePaymentIntentId, paymentIntent.id))
      .limit(1);

    if (order && order.status === 'PENDING') {
      await db
        .update(orders)
        .set({ 
          status: 'PAID',
          updatedAt: new Date().toISOString()
        })
        .where(eq(orders.id, order.id));
    }

    console.log(`Payment succeeded for order: ${order?.orderNumber}`);
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update order status
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.stripePaymentIntentId, paymentIntent.id))
      .limit(1);

    if (order) {
      await db
        .update(orders)
        .set({ 
          status: 'CANCELLED',
          updatedAt: new Date().toISOString()
        })
        .where(eq(orders.id, order.id));
    }

    console.log(`Payment failed for order: ${order?.orderNumber}`);
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
  }
}

// Helper to compose and send the order confirmation email
async function sendOrderConfirmationEmailReal(orderId: number, orderNumber: string) {
  try {
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
      .where(eq(orders.id, orderId))
      .limit(1);

    if (orderData.length === 0) return;

    const { order, user, shippingAddress } = orderData[0];

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

    await sendOrderConfirmationEmail({
      to: user.email,
      subject: `Confirmation de commande - ${order.orderNumber}`,
      order,
      items,
      shippingAddress,
      user: { firstName: user.firstName, lastName: user.lastName }
    });
  } catch (error) {
    console.error('sendOrderConfirmationEmailReal error:', error);
  }
}

import { json } from '@sveltejs/kit';
import { stripe, formatAmountForStripe, isStripeConfigured } from '$lib/stripe';
import { db } from '$lib/db';
import { carts, cartItems, variants, products, addresses, orders, orderItems, users } from '$lib/db/schema';
import { broadcastStockUpdate } from '$lib/realtime/stock';
import { eq, and } from 'drizzle-orm';
import { sendOrderConfirmationEmail } from '$lib/email';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const { shippingAddressId, billingAddressId } = await request.json();

    if (!locals.user) {
      return json({ error: 'Authentification requise' }, { status: 401 });
    }

    // Check if Stripe is configured
    if (!isStripeConfigured) {
      // Create order directly in test mode
      const { order } = await createOrderInTestMode(locals.user.id, shippingAddressId, billingAddressId);
      
      return json({ 
        sessionId: 'mock_session_' + Date.now(),
        url: `${request.url.split('/api')[0]}/checkout/success?session_id=mock_session_${Date.now()}`,
        order: order,
        message: 'Mode test activé - Commande créée avec succès'
      });
    }

    // Get user's cart
    const [cart] = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, locals.user.id))
      .limit(1);

    if (!cart) {
      return json({ error: 'Panier non trouvé' }, { status: 404 });
    }

    // Get cart items with product details
    const cartItemsData = await db
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        variant: {
          id: variants.id,
          price: variants.price,
          stock: variants.stock
        },
        product: {
          id: products.id,
          name: products.name,
          price: products.price
        }
      })
      .from(cartItems)
      .innerJoin(variants, eq(cartItems.variantId, variants.id))
      .innerJoin(products, eq(variants.productId, products.id))
      .where(eq(cartItems.cartId, cart.id));

    if (cartItemsData.length === 0) {
      return json({ error: 'Votre panier est vide' }, { status: 400 });
    }

    // Calculate totals
    let subtotal = 0;
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of cartItemsData) {
      const price = item.variant.price || item.product.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      // Check stock
      if (item.variant.stock < item.quantity) {
        return json({ 
          error: `Stock insuffisant pour ${item.product.name}. Stock disponible: ${item.variant.stock}` 
        }, { status: 400 });
      }

      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.product.name,
          },
          unit_amount: formatAmountForStripe(price),
        },
        quantity: item.quantity,
      });
    }

    // Tax is already included in prices
    const tax = 0;

    // Calculate shipping (free shipping over €100, otherwise €10)
    const shipping = subtotal >= 100 ? 0 : 10;

    const total = subtotal + shipping;

    // Add shipping to line items (tax is already included)

    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
        product_data: {
          name: 'Livraison',
        },
          unit_amount: formatAmountForStripe(shipping),
        },
        quantity: 1,
      });
    }

    // Get addresses
    let shippingAddress = null;
    let billingAddress = null;

    if (shippingAddressId) {
      [shippingAddress] = await db
        .select()
        .from(addresses)
        .where(and(
          eq(addresses.id, shippingAddressId),
          eq(addresses.userId, locals.user.id)
        ))
        .limit(1);
    }

    if (billingAddressId) {
      [billingAddress] = await db
        .select()
        .from(addresses)
        .where(and(
          eq(addresses.id, billingAddressId),
          eq(addresses.userId, locals.user.id)
        ))
        .limit(1);
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${request.url.split('/api')[0]}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.url.split('/api')[0]}/checkout/cancel`,
      customer_email: locals.user.email,
      metadata: {
        userId: locals.user.id,
        cartId: cart.id.toString(),
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        shipping: shipping.toString(),
        total: total.toString(),
        // carry selected addresses so webhook can attach them to the order and email
        shippingAddressId: shippingAddressId ? String(shippingAddressId) : '',
        billingAddressId: billingAddressId ? String(billingAddressId) : ''
      },
      shipping_address_collection: shippingAddress ? undefined : {
        allowed_countries: ['FR', 'BE', 'DE', 'ES', 'IT', 'NL', 'CH'],
      },
    });

    return json({
      sessionId: session.id,
      url: session.url,
      totals: {
        subtotal,
        tax,
        shipping,
        total
      }
    });
  } catch (error) {
    console.error('Checkout error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Stripe')) {
        return json({ 
          error: 'Erreur de configuration Stripe',
          details: 'Veuillez vérifier vos clés API Stripe'
        }, { status: 500 });
      }
      
      if (error.message.includes('database') || error.message.includes('DB')) {
        return json({ 
          error: 'Erreur de base de données',
          details: 'Impossible de récupérer les informations de la commande'
        }, { status: 500 });
      }
    }
    
    return json({ 
      error: 'Une erreur inattendue s\'est produite',
      details: 'Veuillez réessayer ou contacter le support'
    }, { status: 500 });
  }
};

// Helper function to create order in test mode
async function createOrderInTestMode(userId: number, shippingAddressId: number, billingAddressId?: number) {
  // Get user's cart
  const [cart] = await db
    .select()
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1);

  if (!cart) {
    throw new Error('Cart not found');
  }

  // Get cart items with product details
  const cartItemsData = await db
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      variant: {
        id: variants.id,
        price: variants.price,
        stock: variants.stock,
        onHand: variants.onHand,
        reserved: variants.reserved
      },
      product: {
        id: products.id,
        name: products.name,
        price: products.price
      }
    })
    .from(cartItems)
    .innerJoin(variants, eq(cartItems.variantId, variants.id))
    .innerJoin(products, eq(variants.productId, products.id))
    .where(eq(cartItems.cartId, cart.id));

  if (cartItemsData.length === 0) {
    throw new Error('Cart is empty');
  }

  // Calculate totals
  let subtotal = 0;
  for (const item of cartItemsData) {
    const price = item.variant.price || item.product.price;
    subtotal += price * item.quantity;
  }

  const tax = 0;
  const shipping = subtotal >= 100 ? 0 : 10;
  const total = subtotal + shipping;

  // Generate order number
  const orderNumber = 'CMD-' + Date.now().toString().slice(-8);

  // Create order
  const [newOrder] = await db
    .insert(orders)
    .values({
      orderNumber,
      userId,
      status: 'PENDING',
      subtotal,
      tax,
      shipping,
      total,
      currency: 'EUR',
      billingAddressId: billingAddressId || null,
      shippingAddressId: shippingAddressId || null
    })
    .returning();

  // Create order items
  const orderItemsData = cartItemsData.map(item => ({
    orderId: newOrder.id,
    variantId: item.variant.id,
    quantity: item.quantity,
    price: item.variant.price || item.product.price
  }));

  await db.insert(orderItems).values(orderItemsData);

  // Decrement stock immediately (test mode simulates post-payment success)
  for (const item of cartItemsData) {
    const currentOnHand = typeof item.variant.onHand === 'number' ? item.variant.onHand : Math.max(0, (item.variant.stock ?? 0) - (item.variant.reserved ?? 0));
    const newOnHand = Math.max(0, currentOnHand - item.quantity);
    const newReserved = 0;
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

    // Optional: notify clients about stock changes
    try {
      broadcastStockUpdate({
        productId: item.product.id as unknown as number,
        variantId: item.variant.id,
        stock: newStock
      });
    } catch {}
  }

  // Clear cart
  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

  // Simulate payment processing
  setTimeout(async () => {
    try {
      await db
        .update(orders)
        .set({ 
          status: 'PAID',
          updatedAt: new Date().toISOString()
        })
        .where(eq(orders.id, newOrder.id));
      
      // Send confirmation email automatically
      await sendOrderConfirmationEmailReal(newOrder.id, orderNumber);
    } catch (error) {
      console.error(`Error processing order ${orderNumber}:`, error);
    }
  }, 3000);

  return { order: newOrder };
}

// Helper function to send order confirmation email with real email service
async function sendOrderConfirmationEmailReal(orderId: number, orderNumber: string) {
  try {
    // Get order details
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

    if (orderData.length === 0) {
      console.log(`Order ${orderNumber} not found for email`);
      return;
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

    // Create email data
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

    // Send the real email
    const emailSent = await sendOrderConfirmationEmail(emailData);
    
    if (emailSent) {
      console.log(`✅ Confirmation email sent for order ${orderNumber} to ${user.email}`);
    } else {
      console.log(`❌ Failed to send confirmation email for order ${orderNumber} to ${user.email}`);
    }
    
  } catch (error) {
    console.error(`❌ Error sending confirmation email for order ${orderNumber}:`, error);
  }
}

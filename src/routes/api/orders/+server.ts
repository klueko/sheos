import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { orders, orderItems, carts, cartItems, variants, products, addresses, users } from '$lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { sendOrderConfirmationEmail } from '$lib/email';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const userOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        subtotal: orders.subtotal,
        tax: orders.tax,
        shipping: orders.shipping,
        total: orders.total,
        currency: orders.currency,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt
      })
      .from(orders)
      .where(eq(orders.userId, locals.user.id))
      .orderBy(desc(orders.createdAt));

    return json({ orders: userOrders });
  } catch (error) {
    console.error('Get orders error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { shippingAddressId, billingAddressId } = await request.json();

    // Get user's cart
    const [cart] = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, locals.user.id))
      .limit(1);

    if (!cart) {
      return json({ error: 'Cart not found' }, { status: 404 });
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
          price: products.price,
          images: products.images
        }
      })
      .from(cartItems)
      .innerJoin(variants, eq(cartItems.variantId, variants.id))
      .innerJoin(products, eq(variants.productId, products.id))
      .where(eq(cartItems.cartId, cart.id));

    if (cartItemsData.length === 0) {
      return json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of cartItemsData) {
      const price = item.variant.price || item.product.price;
      subtotal += price * item.quantity;

      // Check stock
      if (item.variant.stock < item.quantity) {
        return json({ 
          error: `Insufficient stock for ${item.product.name}` 
        }, { status: 400 });
      }
    }

    // Tax is already included in prices
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
        userId: locals.user.id,
        status: 'PENDING',
        subtotal,
        tax,
        shipping,
        total,
        currency: 'EUR',
        billingAddressId: billingAddressId ? parseInt(billingAddressId) : null,
        shippingAddressId: shippingAddressId ? parseInt(shippingAddressId) : null
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

    // Update stock
    for (const item of cartItemsData) {
      await db
        .update(variants)
        .set({ 
          stock: item.variant.stock - item.quantity,
          reserved: (item.variant.reserved || 0) + item.quantity
        })
        .where(eq(variants.id, item.variant.id));
    }

    // Clear cart
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

    // Simulate payment processing
    setTimeout(async () => {
      try {
        // Update order status to PAID
        await db
          .update(orders)
          .set({ 
            status: 'PAID',
            updatedAt: new Date().toISOString()
          })
          .where(eq(orders.id, newOrder.id));

        // Update stock (remove reserved, update onHand)
        for (const item of cartItemsData) {
          await db
            .update(variants)
            .set({ 
              reserved: 0,
              onHand: item.variant.stock - item.quantity
            })
            .where(eq(variants.id, item.variant.id));
        }

        console.log(`Order ${orderNumber} processed successfully`);

        // Send confirmation email automatically
        await sendOrderConfirmationEmailReal(newOrder.id, orderNumber);

        // Simulate shipping after 1 day
        setTimeout(async () => {
          try {
            await db
              .update(orders)
              .set({ 
                status: 'SHIPPED',
                updatedAt: new Date().toISOString()
              })
              .where(eq(orders.id, newOrder.id));
            
            console.log(`Order ${orderNumber} shipped`);
          } catch (error) {
            console.error(`Error shipping order ${orderNumber}:`, error);
          }
        }, 24 * 60 * 60 * 1000); // 24 hours

        // Simulate delivery after 3 days
        setTimeout(async () => {
          try {
            await db
              .update(orders)
              .set({ 
                status: 'DELIVERED',
                updatedAt: new Date().toISOString()
              })
              .where(eq(orders.id, newOrder.id));
            
            console.log(`Order ${orderNumber} delivered`);
          } catch (error) {
            console.error(`Error delivering order ${orderNumber}:`, error);
          }
        }, 3 * 24 * 60 * 60 * 1000); // 3 days

      } catch (error) {
        console.error(`Error processing order ${orderNumber}:`, error);
      }
    }, 3000); // Simulate 3 second payment processing

    return json({
      order: {
        id: newOrder.id,
        orderNumber: newOrder.orderNumber,
        status: newOrder.status,
        total: newOrder.total,
        currency: newOrder.currency
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

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

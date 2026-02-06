import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { orders, users } from '$lib/db/schema';
import { eq, like, desc, count, and } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url, locals }) => {
  // Check admin access
  if (!locals.user || (locals.user.role !== 'ADMIN' && locals.user.role !== 'STAFF')) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    const whereConditions = [];
    if (status) {
      whereConditions.push(eq(orders.status, status.toUpperCase() as any));
    }
    if (search) {
      whereConditions.push(like(orders.orderNumber, `%${search}%`));
    }
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const ordersResult = await db
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
        updatedAt: orders.updatedAt,
        userId: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: count() })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(whereClause);

    const total = countResult[0]?.count || 0;

    const ordersPayload = ordersResult.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      subtotal: o.subtotal,
      tax: o.tax,
      shipping: o.shipping,
      total: o.total,
      currency: o.currency,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      user: { 
        id: o.userId, 
        firstName: o.firstName, 
        lastName: o.lastName, 
        email: o.email 
      }
    }));

    return json({ 
      orders: ordersPayload, 
      pagination: { 
        page, 
        limit, 
        total, 
        pages: Math.ceil(total / limit) 
      } 
    });
  } catch (error) {
    console.error('Admin orders API error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const PATCH: RequestHandler = async ({ request, locals }) => {
  // Check admin access
  if (!locals.user || (locals.user.role !== 'ADMIN' && locals.user.role !== 'STAFF')) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderId, status } = await request.json();
    if (!orderId || !status) return json({ error: 'Order ID and status are required' }, { status: 400 });

    const [updatedOrder] = await db
      .update(orders)
      .set({ 
        status: status.toUpperCase() as any,
        updatedAt: new Date().toISOString()
      })
      .where(eq(orders.id, orderId))
      .returning();

    if (!updatedOrder) return json({ error: 'Order not found' }, { status: 404 });
    
    return json({ order: updatedOrder });
  } catch (error) {
    console.error('Update order error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
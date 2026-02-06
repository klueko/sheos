import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { orders, users, takeBackRequests } from '$lib/db/schema';
import { eq, count, sql } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
  // Check admin access
  if (!locals.user || (locals.user.role !== 'ADMIN' && locals.user.role !== 'STAFF')) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [totalOrdersRes, totalRevenueRes, totalCustomersRes, pendingTakebacksRes] = await Promise.all([
      db.select({ totalOrders: count() }).from(orders),
      db.select({ totalRevenue: sql<number>`COALESCE(SUM(${orders.total}), 0)` }).from(orders).where(eq(orders.status, 'PAID')),
      db.select({ totalCustomers: count() }).from(users).where(eq(users.role, 'CUSTOMER')),
      db.select({ pendingTakebacks: count() }).from(takeBackRequests).where(eq(takeBackRequests.status, 'PENDING'))
    ]);

    const totalOrders = totalOrdersRes[0]?.totalOrders || 0;
    const totalRevenue = totalRevenueRes[0]?.totalRevenue || 0;
    const totalCustomers = totalCustomersRes[0]?.totalCustomers || 0;
    const pendingTakebacks = pendingTakebacksRes[0]?.pendingTakebacks || 0;

    return json({
      stats: { totalOrders, totalRevenue, totalCustomers, pendingTakebacks }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
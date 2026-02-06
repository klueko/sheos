import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { users } from '$lib/db/schema';
import { count, eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user || locals.user.role !== 'ADMIN') {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [customersRes, vendorsRes, adminsRes, inactiveRes] = await Promise.all([
      db.select({ total: count() }).from(users).where(eq(users.role, 'CUSTOMER')),
      db.select({ total: count() }).from(users).where(eq(users.role, 'VENDEUR')),
      db.select({ total: count() }).from(users).where(eq(users.role, 'ADMIN')),
      db.select({ total: count() }).from(users).where(eq(users.isActive, false))
    ]);

    return json({
      stats: {
        customers: customersRes[0]?.total || 0,
        vendors: vendorsRes[0]?.total || 0,
        admins: adminsRes[0]?.total || 0,
        inactiveUsers: inactiveRes[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Users stats error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};



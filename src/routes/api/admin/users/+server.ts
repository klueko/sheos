import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { users, orders, addresses } from '$lib/db/schema';
import { and, count, desc, eq, like, inArray, sql, or } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user || locals.user.role !== 'ADMIN') {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search')?.trim() || '';
    const roleFilter = url.searchParams.get('role')?.trim() || '';
    const isActiveParam = url.searchParams.get('isActive');
    const isActiveFilter = isActiveParam === 'true' ? true : isActiveParam === 'false' ? false : undefined;

    const offset = (page - 1) * limit;

    const whereConditions = [] as any[];
    if (roleFilter) {
      whereConditions.push(eq(users.role, roleFilter.toUpperCase()));
    }
    if (typeof isActiveFilter === 'boolean') {
      whereConditions.push(eq(users.isActive, isActiveFilter));
    }

    const baseWhere = (() => {
      const all = [...whereConditions];
      if (search) {
        all.push(or(like(users.email, `%${search}%`), like(users.firstName, `%${search}%`), like(users.lastName, `%${search}%`)));
      }
      return all.length ? and(...all) : undefined;
    })();

    // Fetch page of users
    const usersResult = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .where(baseWhere)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const userIds = usersResult.map((u) => u.id);

    let activityByUser: Record<string, { ordersCount: number; addressesCount: number; lastOrderAt: string | null }> = {};

    if (userIds.length > 0) {
      // Orders count per user
      const ordersAgg = await db
        .select({ userId: orders.userId, cnt: count(orders.id), lastAt: sql<string>`MAX(${orders.createdAt})` })
        .from(orders)
        .where(inArray(orders.userId, userIds))
        .groupBy(orders.userId);

      // Addresses count per user
      const addressesAgg = await db
        .select({ userId: addresses.userId, cnt: count(addresses.id) })
        .from(addresses)
        .where(inArray(addresses.userId, userIds))
        .groupBy(addresses.userId);

      for (const id of userIds) {
        activityByUser[id] = { ordersCount: 0, addressesCount: 0, lastOrderAt: null };
      }

      for (const row of ordersAgg) {
        if (!row.userId) continue;
        activityByUser[row.userId].ordersCount = Number(row.cnt || 0);
        activityByUser[row.userId].lastOrderAt = (row.lastAt as unknown as string) || null;
      }
      for (const row of addressesAgg) {
        activityByUser[row.userId].addressesCount = Number(row.cnt || 0);
      }
    }

    // Total count for pagination (without client-side search filter)
    const totalCountResult = await db
      .select({ count: count() })
      .from(users)
      .where(baseWhere);
    const total = totalCountResult[0]?.count || 0;

    const payloadUsers = usersResult.map((u) => ({
      ...u,
      activity: activityByUser[u.id] || { ordersCount: 0, addressesCount: 0, lastOrderAt: null }
    }));

    const pages = Math.ceil(total / limit) || 1;

    return json({
      users: payloadUsers,
      pagination: { page, limit, total, pages }
    });
  } catch (error) {
    console.error('Failed to load users for admin:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};



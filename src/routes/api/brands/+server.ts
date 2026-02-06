import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { brands } from '$lib/db/schema';
import { asc } from 'drizzle-orm';

export const GET: RequestHandler = async () => {
  try {
    const result = await db
      .select({
        id: brands.id,
        name: brands.name,
        description: brands.description,
        logoUrl: brands.logoUrl,
        website: brands.website,
        createdAt: brands.createdAt,
        updatedAt: brands.updatedAt
      })
      .from(brands)
      .orderBy(asc(brands.name));

    return json({ brands: result });
  } catch (error) {
    console.error('Brands API error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
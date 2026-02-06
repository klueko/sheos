import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { categories } from '$lib/db/schema';
import { asc, isNull, inArray, and } from 'drizzle-orm';

export const GET: RequestHandler = async () => {
  try {
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        parentId: categories.parentId,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt
      })
      .from(categories)
      .where(
        and(
          isNull(categories.parentId),
          inArray(categories.slug, ['hommes', 'femmes', 'enfants'])
        )
      )
      .orderBy(asc(categories.name));

    return json({ categories: result });
  } catch (error) {
    console.error('Categories API error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
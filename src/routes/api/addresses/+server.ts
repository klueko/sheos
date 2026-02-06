import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { addresses } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const userAddresses = await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, locals.user.id))
      .orderBy(desc(addresses.createdAt));
    
    return json({ addresses: userAddresses });
  } catch (error) {
    console.error('Addresses fetch error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      type,
      firstName,
      lastName,
      company,
      address1,
      address2,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault
    } = body;

    if (!type || !firstName || !lastName || !address1 || !city || !postalCode || !country) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // If this address is set as default, unset all other defaults for this user and type
    if (isDefault) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, locals.user.id));
    }

    const [newAddress] = await db
      .insert(addresses)
      .values({
        userId: locals.user.id,
        type,
        firstName,
        lastName,
        company: company || null,
        address1,
        address2: address2 || null,
        city,
        state: state || null,
        postalCode,
        country,
        phone: phone || null,
        isDefault: Boolean(isDefault)
      })
      .returning();

    return json({ address: newAddress }, { status: 201 });
  } catch (error) {
    console.error('Create address error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
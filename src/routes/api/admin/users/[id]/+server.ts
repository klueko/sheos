import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { users, userSessions, userKeys } from '$lib/db/schema';
import { and, eq } from 'drizzle-orm';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user || locals.user.role !== 'ADMIN') {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = params.id;
  if (!userId) {
    return json({ error: 'Missing user id' }, { status: 400 });
  }

  // Prevent modifying own account status
  if (locals.user.id === userId) {
    return json({ error: 'Vous ne pouvez pas modifier le statut de votre propre compte.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return json({ error: 'isActive must be a boolean' }, { status: 400 });
    }

    // Check if user exists
    const [existingUser] = await db
      .select({ id: users.id, isActive: users.isActive })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existingUser) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    // Update user status
    await db
      .update(users)
      .set({ 
        isActive,
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, userId));

    // If suspending (isActive = false), invalidate all sessions
    if (!isActive) {
      await db.delete(userSessions).where(eq(userSessions.userId, userId));
      console.log(`User ${userId} suspended - all sessions invalidated`);
    }

    return json({ 
      success: true, 
      message: isActive ? 'Utilisateur réactivé avec succès' : 'Utilisateur suspendu avec succès'
    });
  } catch (error) {
    console.error('Admin update user status error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user || locals.user.role !== 'ADMIN') {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = params.id;
  if (!userId) {
    return json({ error: 'Missing user id' }, { status: 400 });
  }

  // Prevent deleting own account
  if (locals.user.id === userId) {
    return json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' }, { status: 400 });
  }

  try {
    // Deactivate the user (soft delete)
    await db.update(users).set({ isActive: false }).where(eq(users.id, userId));

    // Invalidate sessions and remove keys
    await db.delete(userSessions).where(eq(userSessions.userId, userId));
    await db.delete(userKeys).where(eq(userKeys.userId, userId));

    return json({ success: true });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};



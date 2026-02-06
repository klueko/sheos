import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return json({ error: 'Not authenticated' }, { status: 401 });
  }

  return json({
    user: {
      id: locals.user.id,
      email: locals.user.email,
      firstName: locals.user.firstName,
      lastName: locals.user.lastName,
      role: locals.user.role
    }
  });
};

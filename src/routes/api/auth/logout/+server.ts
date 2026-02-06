import { json } from '@sveltejs/kit';
import { lucia } from '$lib/auth/lucia';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, locals }) => {
  if (!locals.session) {
    return json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    await lucia.invalidateSession(locals.session.id);
    
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '/',
      ...sessionCookie.attributes
    });

    return json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

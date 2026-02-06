import { json } from '@sveltejs/kit';
import { lucia } from '$lib/auth/lucia';
import { createUser, getUserByEmail } from '$lib/auth/utils';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies, locals }) => {
  const { email, password, firstName, lastName, phone, role } = await request.json();

  if (!email || !password) {
    return json({ error: 'Email and password are required' }, { status: 400 });
  }

  if (password.length < 8) {
    return json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
  }

  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Determine desired role
    let storedRole: 'CUSTOMER' | 'VENDEUR' | 'ADMIN' = 'CUSTOMER';
    const requestedRole = typeof role === 'string' ? role.toUpperCase() : '';

    if (requestedRole === 'VENDEUR') {
      storedRole = 'VENDEUR';
    } else if (requestedRole === 'ADMIN') {
      if (locals.user?.role === 'ADMIN') {
        storedRole = 'ADMIN';
      } else {
        return json({ error: 'Only an admin can create an ADMIN account' }, { status: 403 });
      }
    }

    // Create new user
    const userId = await createUser(email, password, {
      firstName,
      lastName,
      phone,
      role: storedRole
    });

    // Create session
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '/',
      ...sessionCookie.attributes
    });

    return json({
      success: true,
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        role: storedRole
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

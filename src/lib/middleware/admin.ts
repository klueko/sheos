import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export function requireAdmin(locals: App.Locals) {
  if (!locals.user) {
    throw redirect(302, '/auth/login?redirect=/admin');
  }

  if (locals.user.role !== 'ADMIN' && locals.user.role !== 'STAFF') {
    throw redirect(302, '/');
  }
}

export function requireSuperAdmin(locals: App.Locals) {
  if (!locals.user) {
    throw redirect(302, '/auth/login?redirect=/admin');
  }

  if (locals.user.role !== 'ADMIN') {
    throw redirect(302, '/');
  }
}

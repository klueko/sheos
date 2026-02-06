import { redirect, type Handle } from '@sveltejs/kit';

export function requireAuthenticated(locals: App.Locals) {
  if (!locals.user) {
    throw redirect(302, '/auth/login');
  }
}

export function requireAdmin(locals: App.Locals) {
  if (!locals.user) {
    throw redirect(302, '/auth/login?redirect=/admin');
  }
  const role = locals.user.role;
  if (role !== 'ADMIN') {
    throw redirect(302, '/');
  }
}

export function requireVendor(locals: App.Locals) {
  if (!locals.user) {
    throw redirect(302, '/auth/login?redirect=/vendeur');
  }
  const role = locals.user.role;
  if (role !== 'VENDEUR') {
    throw redirect(302, '/');
  }
}



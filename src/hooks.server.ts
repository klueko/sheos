import { sequence } from '@sveltejs/kit/hooks';
import { lucia } from '$lib/auth/lucia';
import type { Handle } from '@sveltejs/kit';
import { getClientIP } from '$lib/security/rate-limit';

// Middleware d'authentification
const authHandle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get(lucia.sessionCookieName);
  
  if (!sessionId) {
    event.locals.user = null;
    event.locals.session = null;
    return resolve(event);
  }

  const { session, user } = await lucia.validateSession(sessionId);
  
  // If user exists but is inactive, invalidate the session
  if (user && !user.isActive) {
    if (session) {
      await lucia.invalidateSession(session.id);
    }
    const sessionCookie = lucia.createBlankSessionCookie();
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes
    });
    event.locals.user = null;
    event.locals.session = null;
    return resolve(event);
  }
  
  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id);
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes
    });
  }
  
  if (!session) {
    const sessionCookie = lucia.createBlankSessionCookie();
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes
    });
  }
  
  event.locals.user = user;
  event.locals.session = session;
  
  return resolve(event);
};

// Middleware de sécurité
const securityHandle: Handle = async ({ event, resolve }) => {
  // Ajouter des headers de sécurité
  event.setHeaders({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  });

  // En production, ajouter Strict-Transport-Security
  if (event.url.protocol === 'https:') {
    event.setHeaders({
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    });
  }

  // Ajouter l'IP du client aux locals pour le rate limiting
  event.locals.clientIP = getClientIP(event.request);

  return resolve(event);
};

// Middleware de logging des requêtes
const loggingHandle: Handle = async ({ event, resolve }) => {
  const start = Date.now();
  const response = await resolve(event);
  const duration = Date.now() - start;

  // Logger les requêtes importantes (pas les assets statiques)
  if (!event.url.pathname.startsWith('/_app/') && 
      !event.url.pathname.startsWith('/favicon') &&
      !event.url.pathname.startsWith('/robots.txt')) {
    console.log(`${event.request.method} ${event.url.pathname} - ${response.status} - ${duration}ms - IP: ${event.locals.clientIP}`);
  }

  return response;
};

export const handle = sequence(securityHandle, authHandle, loggingHandle);
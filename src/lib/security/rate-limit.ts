import { LRUCache } from 'lru-cache';

/**
 * Rate Limiting pour protéger contre les attaques par force brute
 * et limiter l'utilisation abusive des API
 */

interface RateLimitConfig {
  windowMs: number; // Fenêtre de temps en ms
  maxRequests: number; // Nombre maximum de requêtes
  skipSuccessfulRequests?: boolean; // Ignorer les requêtes réussies
  skipFailedRequests?: boolean; // Ignorer les requêtes échouées
  keyGenerator?: (request: any) => string; // Fonction pour générer la clé
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

class RateLimiter {
  private cache: LRUCache<string, RateLimitEntry>;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.cache = new LRUCache<string, RateLimitEntry>({
      max: 10000, // Maximum 10000 entrées en cache
      ttl: config.windowMs
    });
  }

  /**
   * Vérifie si une requête est autorisée
   */
  isAllowed(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = identifier;
    const entry = this.cache.get(key);

    if (!entry || now > entry.resetTime) {
      // Nouvelle fenêtre ou première requête
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.config.windowMs,
        blocked: false
      };
      this.cache.set(key, newEntry);

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: newEntry.resetTime
      };
    }

    if (entry.blocked) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    if (entry.count >= this.config.maxRequests) {
      // Bloquer pour cette fenêtre
      entry.blocked = true;
      this.cache.set(key, entry);

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    // Incrémenter le compteur
    entry.count++;
    this.cache.set(key, entry);

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  /**
   * Réinitialise le compteur pour un identifiant
   */
  reset(identifier: string): void {
    this.cache.delete(identifier);
  }

  /**
   * Obtient les statistiques pour un identifiant
   */
  getStats(identifier: string): RateLimitEntry | null {
    return this.cache.get(identifier) || null;
  }
}

// Instances de rate limiting pour différents types d'opérations
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 tentatives de connexion par fenêtre
  keyGenerator: (request) => {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const email = request.body?.email || '';
    return `auth:${ip}:${email}`;
  }
});

export const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requêtes API par minute
  keyGenerator: (request) => {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    return `api:${ip}`;
  }
});

export const passwordResetRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 heure
  maxRequests: 3, // 3 demandes de reset par heure
  keyGenerator: (request) => {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const email = request.body?.email || '';
    return `password-reset:${ip}:${email}`;
  }
});

export const contactFormRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 heure
  maxRequests: 5, // 5 messages de contact par heure
  keyGenerator: (request) => {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    return `contact:${ip}`;
  }
});

/**
 * Middleware pour appliquer le rate limiting
 */
export function applyRateLimit(
  rateLimiter: RateLimiter,
  identifier: string
): { allowed: boolean; headers: Record<string, string> } {
  const result = rateLimiter.isAllowed(identifier);
  
  const headers = {
    'X-RateLimit-Limit': rateLimiter.config.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString()
  };

  if (!result.allowed) {
    headers['Retry-After'] = Math.ceil((result.resetTime - Date.now()) / 1000).toString();
  }

  return {
    allowed: result.allowed,
    headers
  };
}

/**
 * Fonction utilitaire pour extraire l'IP d'une requête
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'unknown';
}

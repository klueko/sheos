import { createHash, randomBytes } from 'crypto';

/**
 * CSRF (Cross-Site Request Forgery) Protection
 * Génère et valide les tokens CSRF pour protéger contre les attaques CSRF
 */

export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly SESSION_KEY = 'csrf_token';

  /**
   * Génère un token CSRF unique
   */
  static generateToken(): string {
    return randomBytes(this.TOKEN_LENGTH).toString('hex');
  }

  /**
   * Crée un token CSRF avec un secret de session
   */
  static createToken(sessionSecret: string): string {
    const randomPart = randomBytes(this.TOKEN_LENGTH).toString('hex');
    const combined = `${randomPart}:${sessionSecret}`;
    return createHash('sha256').update(combined).digest('hex');
  }

  /**
   * Valide un token CSRF
   */
  static validateToken(token: string, sessionSecret: string, expectedToken: string): boolean {
    try {
      // Vérifier que le token correspond
      if (token !== expectedToken) {
        return false;
      }

      // Vérifier la structure du token (format: random:secret)
      const parts = token.split(':');
      if (parts.length !== 2) {
        return false;
      }

      const [randomPart, secretPart] = parts;
      const expectedHash = createHash('sha256').update(`${randomPart}:${sessionSecret}`).digest('hex');
      
      return secretPart === expectedHash;
    } catch (error) {
      console.error('Erreur lors de la validation du token CSRF:', error);
      return false;
    }
  }

  /**
   * Stocke un token CSRF dans les cookies
   */
  static setCookieToken(cookies: any, token: string): void {
    cookies.set(this.SESSION_KEY, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 // 1 heure
    });
  }

  /**
   * Récupère le token CSRF depuis les cookies
   */
  static getCookieToken(cookies: any): string | null {
    return cookies.get(this.SESSION_KEY) || null;
  }

  /**
   * Supprime le token CSRF des cookies
   */
  static clearCookieToken(cookies: any): void {
    cookies.delete(this.SESSION_KEY, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }
}

/**
 * Middleware pour valider les tokens CSRF
 */
export function validateCSRFToken(cookies: any, requestBody: any, sessionSecret: string): boolean {
  const cookieToken = CSRFProtection.getCookieToken(cookies);
  const bodyToken = requestBody._csrf || requestBody.csrf_token;

  if (!cookieToken || !bodyToken) {
    return false;
  }

  return CSRFProtection.validateToken(bodyToken, sessionSecret, cookieToken);
}

/**
 * Générateur de token CSRF pour les formulaires
 */
export function generateCSRFFormToken(sessionSecret: string): string {
  return CSRFProtection.createToken(sessionSecret);
}

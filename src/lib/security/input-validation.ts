import { z } from 'zod';

/**
 * Validation et sanitisation des entrées utilisateur
 * pour prévenir les attaques XSS et l'injection de données
 */

// Schémas de validation pour les types de données courants
export const emailSchema = z.string()
  .email('Adresse email invalide')
  .max(255, 'Email trop long')
  .toLowerCase();

export const passwordSchema = z.string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(128, 'Le mot de passe est trop long')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
  .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial');

export const phoneSchema = z.string()
  .regex(/^(\+33|0)[1-9](\d{8})$/, 'Numéro de téléphone français invalide')
  .optional();

export const nameSchema = z.string()
  .min(1, 'Le nom est requis')
  .max(100, 'Le nom est trop long')
  .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Le nom contient des caractères invalides');

export const addressSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  company: z.string().max(100, 'Nom de société trop long').optional(),
  address1: z.string().min(1, 'Adresse requise').max(255, 'Adresse trop longue'),
  address2: z.string().max(255, 'Adresse trop longue').optional(),
  city: z.string().min(1, 'Ville requise').max(100, 'Nom de ville trop long'),
  state: z.string().max(100, 'État trop long').optional(),
  postalCode: z.string().min(1, 'Code postal requis').max(20, 'Code postal trop long'),
  country: z.string().min(1, 'Pays requis').max(100, 'Nom de pays trop long'),
  phone: phoneSchema
});

export const productSearchSchema = z.object({
  query: z.string().max(255, 'Recherche trop longue').optional(),
  category: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  size: z.number().min(30).max(50).optional(),
  isVegan: z.boolean().optional(),
  hasSteelToe: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
});

export const cartItemSchema = z.object({
  variantId: z.number().int().positive('ID de variante invalide'),
  quantity: z.number().int().min(1, 'Quantité minimale de 1').max(10, 'Quantité maximale de 10')
});

export const orderSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  paymentMethod: z.enum(['card', 'paypal']),
  notes: z.string().max(500, 'Notes trop longues').optional()
});

// Schémas pour les formulaires d'authentification
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Mot de passe requis'),
  rememberMe: z.boolean().optional()
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  acceptTerms: z.boolean().refine(val => val === true, 'Vous devez accepter les conditions d\'utilisation')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
});

export const passwordResetSchema = z.object({
  email: emailSchema
});

export const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Les nouveaux mots de passe ne correspondent pas',
  path: ['confirmPassword']
});

// Schémas pour les formulaires de contact
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.string().min(1, 'Sujet requis').max(200, 'Sujet trop long'),
  message: z.string().min(10, 'Message trop court').max(2000, 'Message trop long'),
  phone: phoneSchema.optional()
});

/**
 * Fonction utilitaire pour valider et nettoyer les données
 */
export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
} {
  try {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    } else {
      const errors: Record<string, string[]> = {};
      
      for (const error of result.error.errors) {
        const path = error.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(error.message);
      }
      
      return {
        success: false,
        errors
      };
    }
  } catch (error) {
    console.error('Erreur lors de la validation:', error);
    return {
      success: false,
      errors: { general: ['Erreur de validation'] }
    };
  }
}

/**
 * Fonction pour échapper les caractères HTML
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Fonction pour nettoyer les URLs
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    
    // Autoriser seulement HTTP et HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Protocole non autorisé');
    }
    
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Fonction pour valider les fichiers uploadés
 */
export function validateFileUpload(file: File, options: {
  maxSize: number; // en bytes
  allowedTypes: string[];
  allowedExtensions: string[];
}): { valid: boolean; error?: string } {
  // Vérifier la taille
  if (file.size > options.maxSize) {
    return {
      valid: false,
      error: `Fichier trop volumineux. Taille maximale: ${Math.round(options.maxSize / 1024 / 1024)}MB`
    };
  }
  
  // Vérifier le type MIME
  if (!options.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Type de fichier non autorisé. Types autorisés: ${options.allowedTypes.join(', ')}`
    };
  }
  
  // Vérifier l'extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !options.allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Extension non autorisée. Extensions autorisées: ${options.allowedExtensions.join(', ')}`
    };
  }
  
  return { valid: true };
}

/**
 * Fonction pour générer un token CSRF sécurisé
 */
export function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Middleware de validation pour les routes API
 */
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return async (request: Request) => {
    const body = await request.json();
    const result = validateAndSanitize(schema, body);
    
    if (!result.success) {
      throw new Error(`Validation failed: ${JSON.stringify(result.errors)}`);
    }
    
    return result.data as T;
  };
}

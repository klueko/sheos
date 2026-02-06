import { json } from '@sveltejs/kit';
import { lucia } from '$lib/auth/lucia';
import { db } from '$lib/db';
import { users, orders, addresses, userSessions } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST({ request, cookies }) {
  try {
    // Vérifier l'authentification
    const sessionId = cookies.get(lucia.sessionCookieName);
    if (!sessionId) {
      return json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (!session || !user) {
      return json({ error: 'Session invalide' }, { status: 401 });
    }

    // Récupérer toutes les données utilisateur
    const userData = {
      // Informations de base
      profile: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      
      // Commandes
      orders: await db.select().from(orders).where(eq(orders.userId, user.id)),
      
      // Adresses
      addresses: await db.select().from(addresses).where(eq(addresses.userId, user.id)),
      
      // Sessions actives
      activeSessions: await db.select().from(userSessions).where(eq(userSessions.userId, user.id)),
      
      // Métadonnées d'export
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        dataVersion: '1.0',
        totalRecords: 0 // Sera calculé après
      }
    };

    // Calculer le nombre total d'enregistrements
    userData.exportMetadata.totalRecords = 
      userData.orders.length + 
      userData.addresses.length + 
      userData.activeSessions.length + 1; // +1 pour le profil

    // Créer le fichier JSON
    const jsonData = JSON.stringify(userData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Retourner le fichier en téléchargement
    return new Response(blob, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="sheos-user-data-${user.id}-${new Date().toISOString().split('T')[0]}.json"`
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'export des données:', error);
    return json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

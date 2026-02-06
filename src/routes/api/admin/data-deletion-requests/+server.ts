import { json } from '@sveltejs/kit';
import { lucia } from '$lib/auth/lucia';
import { db } from '$lib/db';
import { dataDeletionRequests } from '$lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET({ cookies }) {
  try {
    // Vérifier l'authentification admin
    const sessionId = cookies.get(lucia.sessionCookieName);
    if (!sessionId) {
      return json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (!session || !user || user.role !== 'ADMIN') {
      return json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Récupérer toutes les demandes de suppression
    const requests = await db.select()
      .from(dataDeletionRequests)
      .orderBy(desc(dataDeletionRequests.requestedAt));

    return json(requests);

  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    return json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

import { json } from '@sveltejs/kit';
import { lucia } from '$lib/auth/lucia';
import { db } from '$lib/db';
import { dataDeletionRequests } from '$lib/db/schema';
import { eq, count } from 'drizzle-orm';

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

    // Récupérer les statistiques des demandes de suppression (avec fallback si la table n'existe pas)
    let totalRequests: { count: number } = { count: 0 };
    let pendingRequests: { count: number } = { count: 0 };
    let completedRequests: { count: number } = { count: 0 };
    let rejectedRequests: { count: number } = { count: 0 };

    try {
      [totalRequests] = await db.select({ count: count() }).from(dataDeletionRequests);
      [pendingRequests] = await db
        .select({ count: count() })
        .from(dataDeletionRequests)
        .where(eq(dataDeletionRequests.status, 'pending'));
      [completedRequests] = await db
        .select({ count: count() })
        .from(dataDeletionRequests)
        .where(eq(dataDeletionRequests.status, 'completed'));
      [rejectedRequests] = await db
        .select({ count: count() })
        .from(dataDeletionRequests)
        .where(eq(dataDeletionRequests.status, 'rejected'));
    } catch (e) {
      // Table absente: renvoyer des zéros sans casser le dashboard
      totalRequests = { count: 0 };
      pendingRequests = { count: 0 };
      completedRequests = { count: 0 };
      rejectedRequests = { count: 0 };
    }

    // Pour les consentements cookies et exports, on pourrait ajouter des tables dédiées
    // Pour l'instant, on utilise des valeurs simulées ou on compte les sessions
    const cookieConsents = 0; // À implémenter avec une table dédiée
    const dataExports = 0; // À implémenter avec une table dédiée

    const stats = {
      totalDeletionRequests: totalRequests.count,
      pendingRequests: pendingRequests.count,
      completedRequests: completedRequests.count,
      rejectedRequests: rejectedRequests.count,
      cookieConsents,
      dataExports
    };

    return json(stats);

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques RGPD:', error);
    return json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

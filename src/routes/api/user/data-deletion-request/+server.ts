import { json } from '@sveltejs/kit';
import { lucia } from '$lib/auth/lucia';
import { db } from '$lib/db';
import { users, dataDeletionRequests } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from '$lib/email';

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

    // Vérifier si une demande existe déjà
    const existingRequest = await db.select()
      .from(dataDeletionRequests)
      .where(eq(dataDeletionRequests.userId, user.id))
      .limit(1);

    if (existingRequest.length > 0) {
      return json({ 
        error: 'Une demande de suppression est déjà en cours de traitement',
        requestId: existingRequest[0].id
      }, { status: 400 });
    }

    // Créer la demande de suppression
    const deletionRequest = {
      id: crypto.randomUUID(),
      userId: user.id,
      userEmail: user.email,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      reason: 'User request',
      adminNotes: '',
      processedAt: null
    };

    await db.insert(dataDeletionRequests).values(deletionRequest);

    // Envoyer un email de confirmation à l'utilisateur
    try {
      await sendEmail({
        to: user.email,
        subject: 'Demande de suppression de données - Confirmation',
        template: 'data-deletion-request',
        data: {
          userName: user.firstName || user.email,
          requestId: deletionRequest.id,
          requestedAt: deletionRequest.requestedAt,
          expectedProcessingTime: '30 jours maximum'
        }
      });
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      // Ne pas faire échouer la demande pour un problème d'email
    }

    // Envoyer un email d'alerte aux administrateurs
    try {
      await sendEmail({
        to: 'admin@sheos.fr', // Remplacer par l'email admin réel
        subject: 'Nouvelle demande de suppression de données',
        template: 'admin-data-deletion-alert',
        data: {
          userName: user.firstName || user.email,
          userEmail: user.email,
          requestId: deletionRequest.id,
          requestedAt: deletionRequest.requestedAt
        }
      });
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email admin:', emailError);
    }

    return json({ 
      success: true,
      message: 'Demande de suppression créée avec succès',
      requestId: deletionRequest.id,
      expectedProcessingTime: '30 jours maximum'
    });

  } catch (error) {
    console.error('Erreur lors de la création de la demande de suppression:', error);
    return json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

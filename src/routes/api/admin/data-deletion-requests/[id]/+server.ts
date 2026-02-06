import { json } from '@sveltejs/kit';
import { lucia } from '$lib/auth/lucia';
import { db } from '$lib/db';
import { dataDeletionRequests } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from '$lib/email';

export async function PUT({ params, request, cookies }) {
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

    const { id } = params;
    const { status, adminNotes } = await request.json();

    // Vérifier que la demande existe
    const existingRequest = await db.select()
      .from(dataDeletionRequests)
      .where(eq(dataDeletionRequests.id, id))
      .limit(1);

    if (existingRequest.length === 0) {
      return json({ error: 'Demande non trouvée' }, { status: 404 });
    }

    const requestData = existingRequest[0];

    // Mettre à jour le statut
    const updateData = {
      status,
      adminNotes,
      updatedAt: new Date().toISOString()
    };

    if (status !== 'pending') {
      updateData.processedAt = new Date().toISOString();
    }

    await db.update(dataDeletionRequests)
      .set(updateData)
      .where(eq(dataDeletionRequests.id, id));

    // Envoyer un email de notification à l'utilisateur
    try {
      let subject = '';
      let template = '';

      switch (status) {
        case 'approved':
          subject = 'Demande de suppression de données approuvée';
          template = 'data-deletion-approved';
          break;
        case 'rejected':
          subject = 'Demande de suppression de données rejetée';
          template = 'data-deletion-rejected';
          break;
        case 'completed':
          subject = 'Suppression de données terminée';
          template = 'data-deletion-completed';
          break;
      }

      if (subject && template) {
        await sendEmail({
          to: requestData.userEmail,
          subject,
          template,
          data: {
            requestId: requestData.id,
            requestedAt: requestData.requestedAt,
            status,
            adminNotes: adminNotes || '',
            processedAt: updateData.processedAt
          }
        });
      }
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      // Ne pas faire échouer la mise à jour pour un problème d'email
    }

    return json({ 
      success: true, 
      message: 'Statut mis à jour avec succès' 
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la demande:', error);
    return json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function DELETE({ params, cookies }) {
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

    const { id } = params;

    // Supprimer la demande
    await db.delete(dataDeletionRequests)
      .where(eq(dataDeletionRequests.id, id));

    return json({ 
      success: true, 
      message: 'Demande supprimée avec succès' 
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la demande:', error);
    return json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

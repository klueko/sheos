<script lang="ts">
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth';
  import { cookiePreferences, clearCookiePreferences } from '$lib/stores/cookies';

  let userData: any = null;
  let isLoading = false;
  let message = '';
  let messageType = '';

  onMount(() => {
    user.subscribe(value => {
      if (value) {
        userData = value;
      }
    });
  });

  async function exportUserData() {
    if (!userData) return;
    
    isLoading = true;
    message = '';
    
    try {
      const response = await fetch('/api/user/data-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sheos-user-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        message = 'Vos données ont été exportées avec succès.';
        messageType = 'success';
      } else {
        throw new Error('Erreur lors de l\'export des données');
      }
    } catch (error) {
      message = 'Une erreur est survenue lors de l\'export des données.';
      messageType = 'error';
    } finally {
      isLoading = false;
    }
  }

  async function requestDataDeletion() {
    if (!userData) return;
    
    if (!confirm('Êtes-vous sûr de vouloir demander la suppression de vos données ? Cette action est irréversible.')) {
      return;
    }
    
    isLoading = true;
    message = '';
    
    try {
      const response = await fetch('/api/user/data-deletion-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        message = 'Votre demande de suppression a été envoyée. Nous traiterons votre demande sous 30 jours.';
        messageType = 'success';
      } else {
        throw new Error('Erreur lors de la demande de suppression');
      }
    } catch (error) {
      message = 'Une erreur est survenue lors de la demande de suppression.';
      messageType = 'error';
    } finally {
      isLoading = false;
    }
  }

  function clearCookieConsent() {
    if (confirm('Êtes-vous sûr de vouloir effacer vos préférences de cookies ? Vous devrez les redéfinir.')) {
      clearCookiePreferences();
      message = 'Vos préférences de cookies ont été effacées.';
      messageType = 'success';
    }
  }

  function openCookiePreferences() {
    // Trigger the cookie banner to show preferences
    window.dispatchEvent(new CustomEvent('showCookiePreferences'));
  }
</script>

<svelte:head>
  <title>Gestion des données personnelles - Sheos</title>
  <meta name="description" content="Gérez vos données personnelles et vos préférences de confidentialité" />
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="bg-white shadow-sm rounded-lg border border-gray-200 p-8">
      <h1 class="text-2xl font-semibold text-gray-900 mb-6">Gestion de vos données personnelles</h1>
      
      {#if message}
        <div class="mb-6 p-4 rounded-md border {messageType === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}">
          {message}
        </div>
      {/if}

      <div class="space-y-8">
        <!-- Section: Vos données -->
        <section class="border-b border-gray-200 pb-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Vos données</h2>
          <div class="bg-gray-50 p-5 rounded-md">
            <p class="text-sm text-gray-600 mb-4">
              Aperçu des données personnelles que nous détenons à votre sujet.
            </p>
            
            {#if userData}
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 class="text-sm font-medium text-gray-900 mb-3">Informations de compte</h3>
                  <dl class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <dt class="text-gray-600">Email</dt>
                      <dd class="text-gray-900 font-medium">{userData.email}</dd>
                    </div>
                    <div class="flex justify-between">
                      <dt class="text-gray-600">Nom</dt>
                      <dd class="text-gray-900">{userData.firstName || 'Non renseigné'}</dd>
                    </div>
                    <div class="flex justify-between">
                      <dt class="text-gray-600">Prénom</dt>
                      <dd class="text-gray-900">{userData.lastName || 'Non renseigné'}</dd>
                    </div>
                    <div class="flex justify-between">
                      <dt class="text-gray-600">Rôle</dt>
                      <dd class="text-gray-900">{userData.role}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-900 mb-3">Autres données</h3>
                  <ul class="space-y-2 text-sm text-gray-600">
                    <li>Historique des commandes</li>
                    <li>Adresses de livraison</li>
                    <li>Préférences de communication</li>
                    <li>Données de navigation (avec consentement)</li>
                  </ul>
                </div>
              </div>
            {/if}
          </div>
        </section>

        <!-- Section: Droits RGPD -->
        <section class="border-b border-gray-200 pb-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Vos droits RGPD</h2>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="border border-gray-200 rounded-md p-5">
              <h3 class="text-sm font-medium text-gray-900 mb-2">Droit d'accès et portabilité</h3>
              <p class="text-sm text-gray-600 mb-4">
                Téléchargez une copie de toutes vos données personnelles dans un format structuré et lisible.
              </p>
              <button
                on:click={exportUserData}
                disabled={isLoading}
                class="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {isLoading ? 'Export en cours...' : 'Exporter mes données'}
              </button>
            </div>

            <div class="border border-gray-200 rounded-md p-5">
              <h3 class="text-sm font-medium text-gray-900 mb-2">Droit à l'effacement</h3>
              <p class="text-sm text-gray-600 mb-4">
                Demandez la suppression de vos données personnelles (sous réserve des obligations légales).
              </p>
              <button
                on:click={requestDataDeletion}
                disabled={isLoading}
                class="w-full bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {isLoading ? 'Traitement...' : 'Demander la suppression'}
              </button>
            </div>
          </div>
        </section>

        <!-- Section: Gestion des cookies -->
        <section class="border-b border-gray-200 pb-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Gestion des cookies</h2>
          <div class="bg-gray-50 p-5 rounded-md">
            <p class="text-sm text-gray-600 mb-4">
              Gérez vos préférences de cookies et de suivi. Vous pouvez modifier vos choix à tout moment.
            </p>
            
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-sm font-medium text-gray-900 mb-3">Préférences actuelles</h3>
                <dl class="space-y-2 text-sm">
                  <div class="flex items-center justify-between">
                    <dt class="text-gray-600">Cookies nécessaires</dt>
                    <dd class="text-gray-900 font-medium">Actifs</dd>
                  </div>
                  <div class="flex items-center justify-between">
                    <dt class="text-gray-600">Cookies fonctionnels</dt>
                    <dd class="text-gray-900">
                      {$cookiePreferences.functional ? 'Actifs' : 'Inactifs'}
                    </dd>
                  </div>
                  <div class="flex items-center justify-between">
                    <dt class="text-gray-600">Cookies analytiques</dt>
                    <dd class="text-gray-900">
                      {$cookiePreferences.analytics ? 'Actifs' : 'Inactifs'}
                    </dd>
                  </div>
                  <div class="flex items-center justify-between">
                    <dt class="text-gray-600">Cookies marketing</dt>
                    <dd class="text-gray-900">
                      {$cookiePreferences.marketing ? 'Actifs' : 'Inactifs'}
                    </dd>
                  </div>
                </dl>
              </div>
              
              <div class="flex flex-col gap-3">
                <button
                  on:click={openCookiePreferences}
                  class="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Modifier mes préférences
                </button>
                <button
                  on:click={clearCookieConsent}
                  class="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Effacer mes préférences
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Section: Contact -->
        <section class="border-b border-gray-200 pb-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Contact et réclamations</h2>
          <div class="bg-gray-50 p-5 rounded-md">
            <p class="text-sm text-gray-600 mb-4">
              Pour toute question concernant vos données personnelles ou pour exercer vos droits.
            </p>
            
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-sm font-medium text-gray-900 mb-3">Nous contacter</h3>
                <dl class="space-y-2 text-sm">
                  <div>
                    <dt class="text-gray-600">Email</dt>
                    <dd class="text-gray-900">contact@sheos.fr</dd>
                  </div>
                  <div>
                    <dt class="text-gray-600">Téléphone</dt>
                    <dd class="text-gray-900">[Numéro de téléphone]</dd>
                  </div>
                  <div>
                    <dt class="text-gray-600">Adresse</dt>
                    <dd class="text-gray-900">[Adresse complète]</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-900 mb-3">Réclamation CNIL</h3>
                <p class="text-sm text-gray-600 mb-3">
                  Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire 
                  une réclamation auprès de la CNIL.
                </p>
                <a 
                  href="https://www.cnil.fr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="inline-block bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
                >
                  Site de la CNIL
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- Section: Informations importantes -->
        <section>
          <h2 class="text-lg font-medium text-gray-900 mb-4">Informations importantes</h2>
          <div class="space-y-3">
            <div class="bg-gray-50 border border-gray-200 p-4 rounded-md">
              <h3 class="text-sm font-medium text-gray-900 mb-2">Délais de traitement</h3>
              <ul class="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Export des données : 1 mois maximum</li>
                <li>Suppression des données : 1 mois maximum</li>
                <li>Modification des préférences : Immédiate</li>
              </ul>
            </div>
            
            <div class="bg-gray-50 border border-gray-200 p-4 rounded-md">
              <h3 class="text-sm font-medium text-gray-900 mb-2">Sécurité</h3>
              <p class="text-sm text-gray-600">
                Toutes vos données sont protégées par des mesures de sécurité appropriées. 
                Nous ne vendons jamais vos données à des tiers.
              </p>
            </div>
            
            <div class="bg-gray-50 border border-gray-200 p-4 rounded-md">
              <h3 class="text-sm font-medium text-gray-900 mb-2">Obligations légales</h3>
              <p class="text-sm text-gray-600">
                Certaines données peuvent être conservées plus longtemps pour respecter nos 
                obligations légales (facturation, fiscalité).
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</div>

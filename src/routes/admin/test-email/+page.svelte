<script lang="ts">
  import Icon from '@iconify/svelte';
  import { page } from '$app/stores';

  let email = '';
  let loading = false;
  let result: any = null;
  let userEmail = '';
  let useUserEmail = false;

  // Get user email from page data if available
  $: if ($page.data?.user?.email) {
    userEmail = $page.data.user.email;
  }

  async function sendTestEmail() {
    const targetEmail = useUserEmail ? null : email;
    
    if (!targetEmail && !useUserEmail) {
      alert('Veuillez entrer une adresse email ou utiliser votre email connecté');
      return;
    }

    loading = true;
    result = null;

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: targetEmail })
      });

      const data = await response.json();
      result = data;

    } catch (error) {
      result = {
        success: false,
        message: 'Erreur de connexion',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Test Email - Sheos Admin</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Test d'envoi d'email</h1>
    <p class="text-gray-600">Testez la configuration de votre service email</p>
  </div>

  <div class="bg-white rounded-lg shadow-md p-6 mb-8">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">Configuration requise</h2>
    
    <div class="bg-blue-50 rounded-lg p-4 mb-6">
      <h3 class="font-semibold text-blue-900 mb-2">Variables d'environnement (.env)</h3>
      <div class="text-sm text-blue-800 space-y-1">
        <p><code>SMTP_HOST=smtp.gmail.com</code></p>
        <p><code>SMTP_PORT=587</code></p>
        <p><code>SMTP_USER=votre.email@gmail.com</code></p>
        <p><code>SMTP_PASS=votre_mot_de_passe_application</code></p>
        <p><code>SMTP_FROM=votre.email@gmail.com</code></p>
      </div>
    </div>

    <div class="bg-yellow-50 rounded-lg p-4 mb-6">
      <h3 class="font-semibold text-yellow-900 mb-2">⚠️ Pour Gmail</h3>
      <ul class="text-sm text-yellow-800 space-y-1">
        <li>1. Activez l'authentification à 2 facteurs</li>
        <li>2. Générez un mot de passe d'application</li>
        <li>3. Utilisez ce mot de passe dans SMTP_PASS</li>
      </ul>
    </div>
  </div>

  <div class="bg-white rounded-lg shadow-md p-6 mb-8">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">Envoyer un email de test</h2>
    
    <div class="space-y-4">
      {#if userEmail}
        <div class="bg-green-50 rounded-lg p-4 mb-4">
          <div class="flex items-center">
            <Icon icon="lucide:user" class="w-5 h-5 text-green-600 mr-2" />
            <span class="text-sm font-medium text-green-900">Utilisateur connecté : {userEmail}</span>
          </div>
        </div>
      {/if}

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
          Adresse email de test
        </label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="votre.email@example.com"
          disabled={useUserEmail}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>

      {#if userEmail}
        <div class="flex items-center">
          <input
            id="useUserEmail"
            type="checkbox"
            bind:checked={useUserEmail}
            class="mr-2"
          />
          <label for="useUserEmail" class="text-sm font-medium text-gray-700">
            Utiliser mon email connecté ({userEmail})
          </label>
        </div>
      {/if}
      
      <button
        on:click={sendTestEmail}
        disabled={loading || (!email && !useUserEmail)}
        class="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Envoi en cours...' : 'Envoyer email de test'}
      </button>
    </div>
  </div>

  {#if result}
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Résultat</h2>
      
      {#if result.success}
        <div class="bg-green-50 rounded-lg p-4">
          <div class="flex items-center">
            <Icon icon="lucide:check-circle" class="w-6 h-6 text-green-600 mr-3" />
            <div>
              <h3 class="font-semibold text-green-900">Email envoyé avec succès !</h3>
              <p class="text-green-800 text-sm mt-1">{result.message}</p>
            </div>
          </div>
          
          <div class="mt-4 p-3 bg-white rounded border">
            <h4 class="font-medium text-gray-900 mb-2">Détails de l'email test :</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li><strong>Destinataire :</strong> {result.emailData.to}</li>
              <li><strong>Objet :</strong> {result.emailData.subject}</li>
              <li><strong>Commande :</strong> {result.emailData.order.orderNumber}</li>
              <li><strong>Total :</strong> {result.emailData.order.total}€</li>
            </ul>
          </div>
        </div>
      {:else}
        <div class="bg-red-50 rounded-lg p-4">
          <div class="flex items-center">
            <Icon icon="lucide:x-circle" class="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h3 class="font-semibold text-red-900">Échec de l'envoi</h3>
              <p class="text-red-800 text-sm mt-1">{result.message}</p>
              {#if result.error}
                <p class="text-red-700 text-xs mt-2 font-mono bg-red-100 p-2 rounded">
                  {result.error}
                </p>
              {/if}
            </div>
          </div>
          
          <div class="mt-4 p-3 bg-white rounded border">
            <h4 class="font-medium text-gray-900 mb-2">Solutions possibles :</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Vérifiez vos variables d'environnement (.env)</li>
              <li>• Pour Gmail : utilisez un mot de passe d'application</li>
              <li>• Vérifiez votre connexion internet</li>
              <li>• Consultez les logs du serveur</li>
            </ul>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '@iconify/svelte';

  let emails: any[] = [];
  let loading = true;

  onMount(async () => {
    // Simulate loading emails from localStorage or API
    const storedEmails = localStorage.getItem('simulated_emails');
    if (storedEmails) {
      emails = JSON.parse(storedEmails);
    }
    loading = false;
  });

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString('fr-FR');
  }

  function clearEmails() {
    emails = [];
    localStorage.removeItem('simulated_emails');
  }

  function viewEmail(email: any) {
    // In a real app, this would open an email viewer
    const emailContent = `
Objet: ${email.subject}
À: ${email.to}
Envoyé: ${formatDate(email.sentAt)}

Bonjour ${email.user.firstName},

Merci pour votre commande ${email.order.orderNumber} !

Détails de votre commande:
${email.items.map((item: any) => 
  `- ${item.product.name} (Taille ${item.variant.size}, ${item.variant.color}) x${item.quantity}`
).join('\n')}

Total: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(email.order.total)}

Adresse de livraison:
${email.shippingAddress.firstName} ${email.shippingAddress.lastName}
${email.shippingAddress.address1}
${email.shippingAddress.postalCode} ${email.shippingAddress.city}
${email.shippingAddress.country}

Cordialement,
L'équipe Sheos
    `;
    
    alert(emailContent);
  }
</script>

<svelte:head>
  <title>Emails simulés - Sheos Admin</title>
</svelte:head>

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-8">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Emails simulés</h1>
        <p class="text-gray-600">Simulation des emails de confirmation de commande</p>
      </div>
      {#if emails.length > 0}
        <button
          on:click={clearEmails}
          class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Vider la boîte
        </button>
      {/if}
    </div>
  </div>

  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  {:else if emails.length === 0}
    <div class="text-center py-12">
      <Icon icon="lucide:mail" class="w-24 h-24 text-gray-400 mx-auto mb-4" />
      <h2 class="text-2xl font-semibold text-gray-900 mb-4">Aucun email</h2>
      <p class="text-gray-600 mb-6">Les emails de confirmation de commande apparaîtront ici.</p>
      <div class="bg-blue-50 rounded-lg p-6 max-w-md mx-auto">
        <h3 class="font-semibold text-blue-900 mb-2">Comment tester ?</h3>
        <ol class="text-sm text-blue-800 space-y-1 text-left">
          <li>1. Ajoutez des articles au panier</li>
          <li>2. Passez au checkout</li>
          <li>3. Validez la commande</li>
          <li>4. Cliquez sur "Envoyer l'email de confirmation"</li>
        </ol>
      </div>
    </div>
  {:else}
    <div class="space-y-4">
      {#each emails as email, index}
        <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <Icon icon="lucide:mail" class="w-5 h-5 text-blue-600" />
                <h3 class="text-lg font-semibold text-gray-900">{email.subject}</h3>
                <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Envoyé
                </span>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                <div>
                  <span class="font-medium">À:</span> {email.to}
                </div>
                <div>
                  <span class="font-medium">Commande:</span> #{email.order.orderNumber}
                </div>
                <div>
                  <span class="font-medium">Envoyé:</span> {formatDate(email.sentAt)}
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 class="font-medium text-gray-900 mb-2">Contenu de l'email:</h4>
                <div class="text-sm text-gray-700 space-y-2">
                  <p><strong>Destinataire:</strong> {email.user.firstName} {email.user.lastName}</p>
                  <p><strong>Commande:</strong> {email.order.orderNumber} - {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(email.order.total)}</p>
                  <p><strong>Articles:</strong> {email.items.length} article(s)</p>
                  <p><strong>Adresse:</strong> {email.shippingAddress.city}, {email.shippingAddress.country}</p>
                </div>
              </div>
            </div>
            
            <div class="ml-4">
              <button
                on:click={() => viewEmail(email)}
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Voir l'email
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

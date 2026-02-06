<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Icon from '@iconify/svelte';

  let orderDetails: any = null;
  let orderItems: any[] = [];
  let emailSent = false;
  let loading = true;
  let error = '';
  let processingPayment = true;

  onMount(async () => {
    const sessionId = $page.url.searchParams.get('session_id');
    
    if (!sessionId) {
      error = 'ID de session non trouvé';
      loading = false;
      return;
    }

    try {
      // Check if it's a mock session (test mode)
      if (sessionId.startsWith('mock_session_')) {
        // Get cart items from sessionStorage
        const storedCartItems = sessionStorage.getItem('orderCartItems');
        let cartItems = [];
        
        if (storedCartItems) {
          cartItems = JSON.parse(storedCartItems);
          sessionStorage.removeItem('orderCartItems'); // Clean up
        }
        
        // Calculate totals from actual cart items
        let subtotal = 0;
        if (cartItems.length > 0) {
          subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        }
        const shipping = subtotal >= 100 ? 0 : 10;
        const total = subtotal + shipping;
        
        // Create order details with real cart data
        orderDetails = {
          id: Math.floor(Math.random() * 10000),
          orderNumber: 'CMD-' + Date.now().toString().slice(-8),
          status: 'PENDING',
          total: total,
          currency: 'EUR',
          createdAt: new Date().toISOString(),
          subtotal: subtotal,
          shipping: shipping,
          tax: 0
        };
        
        // Convert cart items to order items format
        if (cartItems.length > 0) {
          orderItems = cartItems.map((item: any) => ({
            product: { 
              name: item.productName || item.name,
              images: item.imageUrl ? [item.imageUrl] : []
            },
            variant: { 
              size: item.size,
              color: item.color || 'Non spécifié'
            },
            quantity: item.quantity,
            price: item.price
          }));
        } else {
          // Fallback if no cart items found
          orderItems = [];
        }
        
        // Simulate payment processing
        setTimeout(async () => {
          processingPayment = false;
          orderDetails.status = 'PAID';
          
          // Email is sent automatically by the server
          emailSent = true;
        }, 3000);
      } else {
        // Real Stripe session
        const response = await fetch(`/api/checkout/session/${sessionId}`);
        
        if (response.ok) {
          const data = await response.json();
          orderDetails = data.order;
          orderItems = data.items || [];
          processingPayment = false;
        } else {
          error = 'Impossible de charger les détails de la commande';
        }
      }
    } catch (err) {
      console.error('Error loading order:', err);
      error = 'Erreur lors du chargement des détails de la commande';
    } finally {
      loading = false;
    }
  });

  function formatPrice(price: number) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  async function sendConfirmationEmail() {
    if (!orderDetails || emailSent) return;
    
    try {
      const response = await fetch(`/api/orders/${orderDetails.id}/email`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Store the simulated email in localStorage for admin viewing
        const storedEmails = JSON.parse(localStorage.getItem('simulated_emails') || '[]');
        storedEmails.push(data.email);
        localStorage.setItem('simulated_emails', JSON.stringify(storedEmails));
        
        emailSent = true;
        alert('Email de confirmation envoyé ! Vous pouvez le voir dans la section Admin > Emails simulés.');
      }
    } catch (err) {
      console.error('Error sending email:', err);
      alert('Erreur lors de l\'envoi de l\'email');
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'PAID': return 'text-green-600 bg-green-100';
      case 'SHIPPED': return 'text-blue-600 bg-blue-100';
      case 'DELIVERED': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'PENDING': return 'En attente de paiement';
      case 'PAID': return 'Payé';
      case 'SHIPPED': return 'Expédié';
      case 'DELIVERED': return 'Livré';
      default: return status;
    }
  }
</script>

<svelte:head>
  <title>Commande confirmée - Sheos</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  {:else if error}
    <div class="text-center py-12">
      <Icon icon="lucide:x-circle" class="w-24 h-24 text-red-500 mx-auto mb-4" />
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Erreur</h1>
      <p class="text-gray-600 mb-6">{error}</p>
      <a href="/checkout" class="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
        Retour au checkout
      </a>
    </div>
  {:else if orderDetails}
    <!-- Payment Processing -->
    {#if processingPayment}
      <div class="text-center py-12">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Traitement du paiement...</h1>
        <p class="text-gray-600">Veuillez patienter pendant que nous traitons votre paiement.</p>
      </div>
    {:else}
      <!-- Success Message -->
      <div class="text-center mb-8">
        <Icon icon="lucide:check-circle" class="w-24 h-24 text-green-500 mx-auto mb-4" />
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Commande confirmée !</h1>
        <p class="text-lg text-gray-600 mb-2">
          Merci pour votre achat !
        </p>
        <p class="text-gray-600">
          Votre commande <strong>#{orderDetails.orderNumber}</strong> a été traitée avec succès.
        </p>
      </div>

      <!-- Order Status -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Statut de la commande</h2>
          <span class="px-3 py-1 rounded-full text-sm font-medium {getStatusColor(orderDetails.status)}">
            {getStatusText(orderDetails.status)}
          </span>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Order Info -->
          <div>
            <h3 class="font-medium text-gray-900 mb-3">Informations de commande</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Numéro de commande:</span>
                <span class="font-medium">#{orderDetails.orderNumber}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Date:</span>
                <span class="font-medium">
                  {new Date(orderDetails.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Sous-total:</span>
                <span class="font-medium">{formatPrice(orderDetails.subtotal)}</span>
              </div>
              {#if orderDetails.shipping > 0}
                <div class="flex justify-between">
                  <span class="text-gray-600">Livraison:</span>
                  <span class="font-medium">{formatPrice(orderDetails.shipping)}</span>
                </div>
              {/if}
              <div class="flex justify-between border-t pt-2">
                <span class="text-gray-900 font-medium">Total:</span>
                <span class="font-bold text-lg">{formatPrice(orderDetails.total)}</span>
              </div>
            </div>
          </div>

          <!-- Email Confirmation -->
          <div>
            <h3 class="font-medium text-gray-900 mb-3">Confirmation par email</h3>
            <div class="flex items-center space-x-3">
              {#if emailSent}
                <Icon icon="lucide:check-circle" class="w-5 h-5 text-green-500" />
                <span class="text-sm text-green-600">Email envoyé automatiquement</span>
              {:else}
                <Icon icon="lucide:clock" class="w-5 h-5 text-yellow-500" />
                <span class="text-sm text-yellow-600">Envoi en cours...</span>
              {/if}
            </div>
            <p class="text-xs text-gray-500 mt-2">
              Un email de confirmation a été envoyé automatiquement
            </p>
          </div>
        </div>
      </div>

      <!-- Order Items -->
      {#if orderItems && orderItems.length > 0}
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Articles commandés</h2>
          
          <div class="space-y-4">
          {#each orderItems as item}
            <div class="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
              {#if item.product.images && item.product.images.length > 0}
                <img 
                  src={item.product.images[0]} 
                  alt={item.product.name}
                  class="w-16 h-16 object-cover rounded-lg"
                />
              {:else}
                <div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Icon icon="lucide:shoe-prints" class="w-8 h-8 text-gray-400" />
                </div>
              {/if}
              
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">{item.product.name}</h3>
                <p class="text-sm text-gray-600">
                  Taille {item.variant.size}
                  {#if item.variant.color && item.variant.color !== 'Non spécifié'}
                    • {item.variant.color}
                  {/if}
                </p>
                <p class="text-sm text-gray-600">
                  Quantité: {item.quantity}
                </p>
              </div>
              
              <div class="text-right">
                <p class="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                <p class="text-xs text-gray-500">({formatPrice(item.price)} × {item.quantity})</p>
              </div>
            </div>
          {/each}
          </div>
        </div>
      {:else}
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Articles commandés</h2>
          <div class="text-center py-8">
            <Icon icon="lucide:package" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-600">Aucun article trouvé pour cette commande</p>
            <p class="text-sm text-gray-500">Les détails des articles peuvent être temporairement indisponibles</p>
          </div>
        </div>
      {/if}

      <!-- Next Steps -->
      <div class="bg-blue-50 rounded-lg p-6 mb-8">
        <h3 class="font-semibold text-blue-900 mb-4 flex items-center">
          <Icon icon="lucide:info" class="w-5 h-5 mr-2" />
          Prochaines étapes
        </h3>
        <div class="space-y-3">
          <div class="flex items-start space-x-3">
            <Icon icon="lucide:mail" class="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-blue-900">Email de confirmation</p>
              <p class="text-xs text-blue-700">Vous recevrez un email avec tous les détails de votre commande</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <Icon icon="lucide:package" class="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-blue-900">Préparation</p>
              <p class="text-xs text-blue-700">Votre commande sera préparée dans les 1-2 jours ouvrés</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <Icon icon="lucide:truck" class="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-blue-900">Expédition</p>
              <p class="text-xs text-blue-700">Vous recevrez un email avec le numéro de suivi</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <Icon icon="lucide:home" class="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-blue-900">Livraison</p>
              <p class="text-xs text-blue-700">Livraison sous 2-5 jours ouvrés</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a 
          href="/products" 
          class="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-center"
        >
          Continuer mes achats
        </a>
        <a 
          href="/account" 
          class="bg-white text-gray-900 border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
        >
          Mon compte
        </a>
      </div>
    {/if}
  {:else}
    <div class="text-center py-12">
      <Icon icon="lucide:help-circle" class="w-24 h-24 text-gray-400 mx-auto mb-4" />
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Commande non trouvée</h1>
      <p class="text-gray-600 mb-6">Impossible de récupérer les détails de votre commande.</p>
      <a href="/" class="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
        Retour à l'accueil
      </a>
    </div>
  {/if}
</div>
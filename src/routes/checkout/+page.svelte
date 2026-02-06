<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user, isAuthenticated } from '$lib/stores/auth';

  let cartItems: any[] = [];
  let addresses: any[] = [];
  let loading = true;
  let processing = false;
  let error = '';
  let selectedShippingAddress = '';
  let selectedBillingAddress = '';
  let showAddressForm = false;
  let newAddress = {
    type: 'SHIPPING',
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'France',
    phone: '',
    isDefault: true
  };

  onMount(async () => {
    if (!$isAuthenticated) {
      goto('/auth/login');
      return;
    }

    await loadCart();
    await loadAddresses();
    loading = false;
  });

  async function loadCart() {
    try {
      const response = await fetch('/api/cart');
      const data = await response.json();
      cartItems = data.items || [];
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  }

  async function loadAddresses() {
    try {
      const response = await fetch('/api/addresses');
      const data = await response.json();
      addresses = data.addresses || [];
      
      // Set default addresses
      const defaultShipping = addresses.find((addr: any) => addr.type === 'SHIPPING' && addr.isDefault);
      const defaultBilling = addresses.find((addr: any) => addr.type === 'BILLING' && addr.isDefault);
      
      if (defaultShipping) selectedShippingAddress = defaultShipping.id.toString();
      if (defaultBilling) selectedBillingAddress = defaultBilling.id.toString();
    } catch (error) {
      console.error('Failed to load addresses:', error);
    }
  }

  async function proceedToCheckout() {
    if (cartItems.length === 0) {
      error = 'Votre panier est vide';
      return;
    }

    if (!selectedShippingAddress) {
      error = 'Veuillez sélectionner une adresse de livraison';
      return;
    }

    processing = true;
    error = '';

    try {
      const response = await fetch('/api/checkout/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shippingAddressId: parseInt(selectedShippingAddress),
          billingAddressId: selectedBillingAddress ? parseInt(selectedBillingAddress) : null
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Check if it's test mode
        if (data.message && data.message.includes('Mode test')) {
          // Store cart items in sessionStorage for the success page
          sessionStorage.setItem('orderCartItems', JSON.stringify(cartItems));
          alert('Paiement réussi');
        }
        
        // Redirect to success page (test mode) or Stripe Checkout
        window.location.href = data.url;
      } else {
        const errorData = await response.json();
        error = errorData.error || 'Échec du checkout';
        
        // Show additional details if available
        if (errorData.details) {
          error += ` (${errorData.details})`;
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      error = 'Erreur réseau. Veuillez réessayer.';
    } finally {
      processing = false;
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  function calculateSubtotal() {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  function calculateTax() {
    return 0; // TVA déjà incluse dans les prix
  }

  function calculateShipping() {
    return calculateSubtotal() >= 100 ? 0 : 10;
  }

  function calculateTotal() {
    return calculateSubtotal() + calculateShipping(); // Pas de TVA en plus
  }

  async function createAddress() {
    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAddress)
      });

      if (response.ok) {
        const data = await response.json();
        addresses.push(data.address);
        selectedShippingAddress = data.address.id.toString();
        showAddressForm = false;
        // Reset form
        newAddress = {
          type: 'SHIPPING',
          firstName: '',
          lastName: '',
          company: '',
          address1: '',
          address2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'France',
          phone: '',
          isDefault: true
        };
      } else {
        const errorData = await response.json();
        error = errorData.error || 'Échec de la création de l\'adresse';
      }
    } catch (err) {
      error = 'Erreur réseau. Veuillez réessayer.';
    }
  }
</script>

<svelte:head>
  <title>Checkout - Sheos</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <h1 class="text-3xl font-bold text-gray-900 mb-8">Commande</h1>

  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  {:else if cartItems.length === 0}
    <div class="text-center py-12">
      <h2 class="text-2xl font-semibold text-gray-900 mb-4">Votre panier est vide</h2>
      <a href="/products" class="bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-700">
        Continuer les achats
      </a>
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Order Summary -->
      <div>
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Résumé de la commande</h2>
        
        <div class="bg-white rounded-lg shadow-md p-6">
          {#each cartItems as item}
            <div class="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
              {#if item.imageUrl}
                <img src={item.imageUrl} alt={item.productName} class="w-16 h-16 object-cover rounded" />
              {:else}
                <div class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
              {/if}
              
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">{item.productName}</h3>
                <p class="text-sm text-gray-600">
                  {item.brandName}
                </p>
                <p class="text-sm text-gray-600">
                  Taille {item.size}
                  {#if item.color}
                    • {item.color}
                  {/if}
                </p>
                <p class="text-sm text-gray-600">Quantité: {item.quantity}</p>
              </div>
              
              <div class="text-right">
                <p class="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          {/each}
          
          <!-- Totals -->
          <div class="mt-6 space-y-2">
            <div class="flex justify-between text-sm">
              <span>Sous-total</span>
              <span>{formatPrice(calculateSubtotal())}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>TVA incluse</span>
              <span>—</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>Livraison</span>
              <span>
                {calculateShipping() === 0 ? 'Gratuite' : formatPrice(calculateShipping())}
              </span>
            </div>
            <div class="flex justify-between text-lg font-semibold border-t pt-2">
              <span>Total</span>
              <span>{formatPrice(calculateTotal())}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Checkout Form -->
      <div>
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Livraison & Facturation</h2>
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <!-- Shipping Address -->
          <div class="mb-6">
            <div class="flex justify-between items-center mb-2">
              <label for="shipping-address" class="block text-sm font-medium text-gray-700">
                Adresse de livraison *
              </label>
              <button
                type="button"
                on:click={() => showAddressForm = !showAddressForm}
                class="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {showAddressForm ? 'Annuler' : '+ Ajouter une adresse'}
              </button>
            </div>
            
            {#if !showAddressForm}
              <select
                id="shipping-address"
                bind:value={selectedShippingAddress}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="">Sélectionner une adresse de livraison</option>
                {#each addresses.filter((addr: any) => addr.type === 'SHIPPING') as address}
                  <option value={address.id}>
                    {address.firstName} {address.lastName}, {address.address1}, {address.city}, {address.postalCode}
                  </option>
                {/each}
              </select>
            {:else}
              <!-- Address Form -->
              <div class="space-y-4 p-4 bg-gray-50 rounded-md">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                    <input
                      id="firstName"
                      type="text"
                      bind:value={newAddress.firstName}
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input
                      id="lastName"
                      type="text"
                      bind:value={newAddress.lastName}
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label for="address1" class="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                  <input
                    id="address1"
                    type="text"
                    bind:value={newAddress.address1}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="123 rue de la Paix"
                    required
                  />
                </div>
                
                <div>
                  <label for="address2" class="block text-sm font-medium text-gray-700 mb-1">Complément d'adresse</label>
                  <input
                    id="address2"
                    type="text"
                    bind:value={newAddress.address2}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="Appartement, étage, etc."
                  />
                </div>
                
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label for="city" class="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                    <input
                      id="city"
                      type="text"
                      bind:value={newAddress.city}
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <label for="postalCode" class="block text-sm font-medium text-gray-700 mb-1">Code postal *</label>
                    <input
                      id="postalCode"
                      type="text"
                      bind:value={newAddress.postalCode}
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <label for="country" class="block text-sm font-medium text-gray-700 mb-1">Pays *</label>
                    <select
                      id="country"
                      bind:value={newAddress.country}
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    id="phone"
                    type="tel"
                    bind:value={newAddress.phone}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
                
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    bind:checked={newAddress.isDefault}
                    id="isDefault"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="isDefault" class="ml-2 block text-sm text-gray-700">
                    Définir comme adresse par défaut
                  </label>
                </div>
                
                <div class="flex space-x-3">
                  <button
                    type="button"
                    on:click={createAddress}
                    disabled={!newAddress.firstName || !newAddress.lastName || !newAddress.address1 || !newAddress.city || !newAddress.postalCode}
                    class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Enregistrer l'adresse
                  </button>
                  <button
                    type="button"
                    on:click={() => showAddressForm = false}
                    class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            {/if}
          </div>

          <!-- Billing Address -->
          <div class="mb-6">
            <label for="billing-address" class="block text-sm font-medium text-gray-700 mb-2">
              Adresse de facturation (optionnel)
            </label>
            <select
              id="billing-address"
              bind:value={selectedBillingAddress}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <option value="">Identique à l'adresse de livraison</option>
              {#each addresses.filter((addr: any) => addr.type === 'BILLING') as address}
                <option value={address.id}>
                  {address.firstName} {address.lastName}, {address.address1}, {address.city}, {address.postalCode}
                </option>
              {/each}
            </select>
          </div>

          {#if error}
            <div class="mb-6 rounded-md bg-red-50 p-4">
              <div class="text-sm text-red-700">{error}</div>
            </div>
          {/if}

          <!-- Payment Button -->
          <button
            on:click={proceedToCheckout}
            disabled={processing || !selectedShippingAddress}
            class="w-full bg-gray-800 text-white py-3 px-4 rounded-md font-medium hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? 'Traitement...' : `Payer ${formatPrice(calculateTotal())}`}
          </button>

          <p class="text-xs text-gray-500 mt-4 text-center">
            Vous serez redirigé vers Stripe pour un paiement sécurisé.
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>

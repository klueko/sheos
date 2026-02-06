<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user, isAuthenticated } from '$lib/stores/auth';
  import Icon from '@iconify/svelte';

  interface CartItem {
    id: number;
    quantity: number;
    variantId: number;
    size: number;
    color: string | null;
    price: number;
    productId: number;
    productName: string;
    productSlug: string;
    brandName: string;
    imageUrl: string | null;
  }

  let cartItems: CartItem[] = [];
  let loading = true;
  let updating = false;

  onMount(async () => {
    await loadCart();
    loading = false;
  });

  async function loadCart() {
    try {
      // Check if user is authenticated
      const response = await fetch('/api/auth/me');
      const isAuthenticated = response.ok;
      
      if (isAuthenticated) {
        // User is authenticated, use server-side cart
        const cartResponse = await fetch('/api/cart');
        const data = await cartResponse.json();
        cartItems = data.items || [];
      } else {
        // User is not authenticated, use localStorage cart
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        cartItems = localCart;
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      // Fallback to localStorage
      try {
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        cartItems = localCart;
      } catch (localError) {
        cartItems = [];
      }
    }
  }

  async function updateQuantity(itemId: number, newQuantity: number) {
    if (newQuantity < 1) return;
    
    updating = true;
    try {
      // Check if user is authenticated
      const response = await fetch('/api/auth/me');
      const isAuthenticated = response.ok;
      
      if (isAuthenticated) {
        // User is authenticated, use server-side cart
        const cartResponse = await fetch('/api/cart', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            itemId,
            quantity: newQuantity
          })
        });

        if (cartResponse.ok) {
          await loadCart();
          window.dispatchEvent(new CustomEvent('cartUpdated'));
        } else {
          const errorData = await cartResponse.json();
          alert(`Erreur: ${errorData.error || 'Impossible de mettre à jour la quantité'}`);
        }
      } else {
        // User is not authenticated, use localStorage cart
        updateLocalCartQuantity(itemId, newQuantity);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      // Fallback to localStorage
      updateLocalCartQuantity(itemId, newQuantity);
    } finally {
      updating = false;
    }
  }

  function updateLocalCartQuantity(itemId: number, newQuantity: number) {
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemIndex = localCart.findIndex((item: any) => item.id === itemId);
    
    if (itemIndex >= 0) {
      localCart[itemIndex].quantity = newQuantity;
      localStorage.setItem('cart', JSON.stringify(localCart));
      loadCart();
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  }

  async function removeItem(itemId: number) {
    updating = true;
    try {
      // Check if user is authenticated
      const response = await fetch('/api/auth/me');
      const isAuthenticated = response.ok;
      
      if (isAuthenticated) {
        // User is authenticated, use server-side cart
        const cartResponse = await fetch('/api/cart', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ itemId })
        });

        if (cartResponse.ok) {
          await loadCart();
          window.dispatchEvent(new CustomEvent('cartUpdated'));
        } else {
          const errorData = await cartResponse.json();
          alert(`Erreur: ${errorData.error || 'Impossible de supprimer l\'article'}`);
        }
      } else {
        // User is not authenticated, use localStorage cart
        removeFromLocalCart(itemId);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      // Fallback to localStorage
      removeFromLocalCart(itemId);
    } finally {
      updating = false;
    }
  }

  function removeFromLocalCart(itemId: number) {
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const filteredCart = localCart.filter((item: any) => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(filteredCart));
    loadCart();
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  function calculateSubtotal() {
    return cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
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
</script>

<svelte:head>
  <title>Panier - Sheos</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <h1 class="text-3xl font-bold text-gray-900 mb-8">Mon Panier</h1>

  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  {:else if cartItems.length === 0}
    <div class="text-center py-12">
      <Icon icon="lucide:shopping-cart" class="w-24 h-24 text-gray-300 mx-auto mb-4" />
      <h2 class="text-2xl font-semibold text-gray-900 mb-4">Votre panier est vide</h2>
      <p class="text-gray-600 mb-6">Découvrez notre collection de chaussures et ajoutez vos favoris au panier.</p>
      <a href="/products" class="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
        Continuer mes achats
      </a>
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Cart Items -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          {#each cartItems as item}
            <div class="flex items-center space-x-4 p-6 border-b border-gray-200 last:border-b-0">
              <!-- Product Image -->
              <div class="flex-shrink-0">
                {#if item.imageUrl}
                  <img 
                    src={item.imageUrl} 
                    alt={item.productName}
                    class="w-20 h-20 object-cover rounded-lg"
                  />
                {:else}
                  <div class="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Icon icon="lucide:image" class="w-8 h-8 text-gray-400" />
                  </div>
                {/if}
              </div>

              <!-- Product Details -->
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-semibold text-gray-900 truncate">
                  {item.productName}
                </h3>
                <p class="text-sm text-gray-600">
                  {item.brandName}
                </p>
                <p class="text-sm text-gray-600">
                  Taille {item.size}
                  {#if item.color}
                    • {item.color}
                  {/if}
                </p>
                <p class="text-lg font-semibold text-gray-900 mt-2">
                  {formatPrice(Number(item.price) || 0)}
                </p>
              </div>

              <!-- Quantity Controls -->
              <div class="flex items-center space-x-2">
                <button
                  on:click={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={updating || item.quantity <= 1}
                  class="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Diminuer la quantité"
                >
                  <Icon icon="lucide:minus" class="w-4 h-4" />
                </button>
                
                <span class="w-12 text-center font-medium">{item.quantity}</span>
                
                <button
                  on:click={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={updating}
                  class="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Augmenter la quantité"
                >
                  <Icon icon="lucide:plus" class="w-4 h-4" />
                </button>
              </div>

              <!-- Remove Button -->
              <button
                on:click={() => removeItem(item.id)}
                disabled={updating}
                class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Supprimer l'article"
              >
                <Icon icon="lucide:trash-2" class="w-5 h-5" />
              </button>
            </div>
          {/each}
        </div>
      </div>

      <!-- Order Summary -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-md p-6 sticky top-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Résumé de la commande</h2>
          
          <div class="space-y-3">
            <div class="flex justify-between text-sm">
              <span>Sous-total ({cartItems.length} article{cartItems.length > 1 ? 's' : ''})</span>
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
            
            {#if calculateShipping() > 0}
              <div class="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                Livraison gratuite à partir de 100€
              </div>
            {/if}
            
            <div class="border-t pt-3">
              <div class="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
            </div>
          </div>

          {#if $isAuthenticated}
            <button
              on:click={() => goto('/checkout')}
              disabled={updating}
              class="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mt-6"
            >
              {updating ? 'Mise à jour...' : 'Passer la commande'}
            </button>
          {:else}
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
              <div class="flex items-center">
                <Icon icon="lucide:info" class="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <p class="text-sm text-yellow-800 font-medium">Connexion requise</p>
                  <p class="text-xs text-yellow-700 mt-1">
                    Vous devez vous connecter pour passer commande
                  </p>
                </div>
              </div>
              <div class="mt-3 flex space-x-2">
                <a 
                  href="/auth/login" 
                  class="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-yellow-700 transition-colors text-center text-sm"
                >
                  Se connecter
                </a>
                <a 
                  href="/auth/register" 
                  class="flex-1 bg-white text-yellow-600 border border-yellow-300 py-2 px-4 rounded-lg font-semibold hover:bg-yellow-50 transition-colors text-center text-sm"
                >
                  S'inscrire
                </a>
              </div>
            </div>
          {/if}

          <a 
            href="/products" 
            class="block text-center text-gray-600 hover:text-gray-800 mt-4 transition-colors"
          >
            Continuer mes achats
          </a>
        </div>
      </div>
    </div>
  {/if}
</div>

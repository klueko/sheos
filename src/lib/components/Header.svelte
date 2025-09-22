<script lang="ts">
  import { page } from '$app/stores';
  import { user, isAuthenticated } from '$lib/stores/auth';
  import { onMount } from 'svelte';

  let cartCount = 0;
  let isMenuOpen = false;

  onMount(() => {
    loadCartCount();
  });

  async function loadCartCount() {
    try {
      const response = await fetch('/api/cart');
      const data = await response.json();
      cartCount = data.items?.length || 0;
    } catch (error) {
      console.error('Échec du chargement du nombre d\'articles du panier:', error);
    }
  }

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      user.set(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Échec de la déconnexion:', error);
    }
  }
</script>

<style>
  .gradient-text {
    background: linear-gradient(45deg, #653e00, #4b0092);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
</style>

<header class="bg-white shadow-sm border-b">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <!-- Navigation gauche -->
      <nav class="hidden md:flex space-x-6">
        <a href="/products" class="text-gray-700 hover:text-orange-500 px-3 py-2 text-sm font-medium transition-colors">
          Produits
        </a>
      </nav>

      <!-- Logo centré -->
      <div class="flex-shrink-0 absolute left-1/2 transform -translate-x-1/2">
        <a href="/" class="flex items-center space-x-3">
          <img 
            src="/assets/sheos.png" 
            alt="Sheos Logo" 
            class="w-10 h-10 rounded-full border-2 border-orange-500/20"
          />
          <span class="text-2xl font-bold gradient-text"></span>
        </a>
      </div>

      <!-- Navigation droite -->
      <nav class="hidden md:flex space-x-6">
        <a href="/about" class="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors">
          À Propos
        </a>
      </nav>

      <!-- Actions utilisateur -->
      <div class="flex items-center space-x-4">
        <!-- Recherche -->
        <div class="hidden md:block">
          <form action="/products" method="GET" class="flex">
            <input
              type="search"
              name="search"
              placeholder="Rechercher..."
              class="w-48 px-3 py-2 bg-gray-50 text-gray-900 placeholder-gray-500 rounded-l-md border border-gray-300 focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              class="px-4 py-2 bg-orange-500 text-white rounded-r-md hover:bg-orange-600 focus:outline-none transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
          </form>
        </div>

        <!-- Panier -->
        <a href="/cart" class="relative p-2 text-gray-700 hover:text-orange-500 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
          </svg>
          {#if cartCount > 0}
            <span class="absolute -top-1 -right-1 bg-purple-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
          {/if}
        </a>

        <!-- Menu utilisateur -->
        {#if $isAuthenticated}
          <div class="relative">
            <button
              on:click={toggleMenu}
              class="flex items-center text-gray-700 hover:text-purple-600 focus:outline-none bg-gray-50 rounded-md px-3 py-2 transition-colors"
            >
              <span class="mr-1">{$user?.firstName || 'Compte'}</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            {#if isMenuOpen}
              <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                <a href="/account/orders" class="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors">
                  Mes Commandes
                </a>
                <a href="/account/takeback" class="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors">
                  Programme Reprise
                </a>
                <a href="/account/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors">
                  Profil
                </a>
                <hr class="my-1 border-gray-200" />
                <button
                  on:click={logout}
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            {/if}
          </div>
        {:else}
          <div class="flex space-x-2">
            <a href="/auth/login" class="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors">
              Connexion
            </a>
            <a href="/auth/register" class="bg-orange-500 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-orange-600 transition-colors">
              S'inscrire
            </a>
          </div>
        {/if}

        <!-- Bouton menu mobile -->
        <button
          on:click={toggleMenu}
          class="md:hidden p-2 text-gray-700 hover:text-orange-500 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Menu mobile -->
    {#if isMenuOpen}
      <div class="md:hidden mt-2">
        <div class="bg-gray-50 rounded-lg px-3 py-3 space-y-1 border">
          <a href="/products" class="block px-3 py-2 text-gray-700 hover:text-orange-500 rounded transition-colors">
            Produits
          </a>
          <a href="/about" class="block px-3 py-2 text-gray-700 hover:text-purple-600 rounded transition-colors">
            À Propos
          </a>
          
          <!-- Recherche mobile -->
          <div class="pt-2">
            <form action="/products" method="GET" class="flex">
              <input
                type="search"
                name="search"
                placeholder="Rechercher..."
                class="flex-1 px-3 py-2 bg-white text-gray-900 placeholder-gray-500 rounded-l border border-gray-300 focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                class="px-3 py-2 bg-orange-500 text-white rounded-r hover:bg-orange-600 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    {/if}
  </div>
</header>
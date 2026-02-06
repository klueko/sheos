<script lang="ts">
  import { page } from '$app/stores';
  import { user, isAuthenticated } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  import Icon from '@iconify/svelte';

  let cartCount = 0;
  let isMenuOpen = false;

  onMount(() => {
    // Defer cart count loading to avoid blocking initial render
    const defer = (cb: () => void) => {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.requestIdleCallback) {
        // @ts-ignore
        window.requestIdleCallback(cb, { timeout: 1000 });
      } else {
        setTimeout(cb, 0);
      }
    };

    defer(() => loadCartCount());
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCartCount();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  });

  async function loadCartCount() {
    try {
      // Skip on admin pages and for admin users to reduce overhead
      if ($page?.url?.pathname?.startsWith('/admin')) return;
      if ($user?.role === 'ADMIN') return;
    } catch {}

    try {
      // Check if user is authenticated with a short timeout
      const authController = new AbortController();
      const authTimeout = setTimeout(() => authController.abort(), 1200);
      const response = await fetch('/api/auth/me', { signal: authController.signal });
      clearTimeout(authTimeout);
      const isAuthenticated = response.ok;
      
      if (isAuthenticated) {
        // User is authenticated, use server-side cart (with timeout)
        const cartController = new AbortController();
        const cartTimeout = setTimeout(() => cartController.abort(), 1200);
        const cartResponse = await fetch('/api/cart', { signal: cartController.signal });
        clearTimeout(cartTimeout);
        const data = await cartResponse.json();
        cartCount = data.items?.length || 0;
        try { sessionStorage.setItem('cartCount', String(cartCount)); } catch {}
      } else {
        // User is not authenticated, use localStorage cart
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        cartCount = localCart.length;
        try { sessionStorage.setItem('cartCount', String(cartCount)); } catch {}
      }
    } catch (error) {
      // Fallback to cache or localStorage
      try {
        const cached = sessionStorage.getItem('cartCount');
        if (cached !== null) {
          cartCount = parseInt(cached) || 0;
          return;
        }
      } catch {}
      try {
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        cartCount = localCart.length;
      } catch (localError) {
        cartCount = 0;
      }
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

  // Fermer le menu quand on clique ailleurs
  function handleClickOutside(event: Event) {
    if (isMenuOpen && !(event.target as Element)?.closest('.user-menu')) {
      isMenuOpen = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<header class="bg-white shadow-lg border-b border-gray-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-20">
      <!-- Logo/Titre -->
      <div class="flex items-center">
        <a href="/" class="flex items-center group">
          <img 
            src="/assets/sheos.png" 
            alt="SHeoS Logo" 
            class="h-16 w-16 object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </a>
      </div>

      <!-- Navigation principale -->
      <nav class="hidden md:flex space-x-8">

      </nav>

      <!-- Actions utilisateur -->
      <div class="flex items-center space-x-4">
        <!-- Recherche -->
        <div class="hidden lg:block">
          <form action="/products" method="GET" class="flex">
            <input
              type="search"
              name="search"
              placeholder="Rechercher des chaussures..."
              class="w-56 px-4 py-2.5 bg-gray-50 text-gray-900 placeholder-gray-500 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-yellow focus:border-transparent transition-all duration-300"
            />
            <button
              type="submit"
              class="px-4 py-2.5 custom-yellow text-white rounded-r-lg custom-yellow-hover focus:outline-none focus:ring-2 focus:ring-custom-yellow transition-all duration-300"
              aria-label="Rechercher"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
          </form>
        </div>

        <!-- Panier -->
        <a
          href="/cart"
          class="relative p-2 text-gray-700 hover:text-custom-yellow transition-all duration-300 rounded-lg hover:bg-yellow-50 group"
          aria-label={`Panier${cartCount ? `, ${cartCount} article(s)` : ''}`}
        >
          <Icon
            icon="lucide:shopping-cart"
            class="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
          />

          {#if cartCount > 0}
            <span
              class="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3
                    bg-gradient-to-r from-green-400 to-green-400 text-white
                    text-xs font-bold rounded-full h-5 min-w-[1.25rem] px-1
                    flex items-center justify-center shadow-lg pointer-events-none"
            >
              {cartCount}
            </span>
          {/if}
        </a>

        <!-- Menu utilisateur -->
        {#if $isAuthenticated}
          <div class="relative user-menu">
            <button
              on:click={toggleMenu}
              class="flex items-center text-gray-700 hover:text-purple-600 focus:outline-none bg-gray-50 hover:bg-purple-50 rounded-lg px-4 py-2.5 transition-all duration-300 group"
            >
              <span class="mr-2 font-medium">{$user?.firstName || 'Compte'}</span>
              <svg 
                class="w-4 h-4 transition-transform duration-300 {isMenuOpen ? 'rotate-180' : ''} group-hover:scale-110" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            {#if isMenuOpen}
              <div class="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 animate-fadeIn">
                {#if $user?.role !== 'ADMIN'}
                  <a 
                    href="/account/orders" 
                    class="block px-4 py-3 text-sm text-gray-700 hover:bg-yellow-50 transition-all duration-300 rounded-lg mx-2"
                  >
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                      Mes Commandes
                    </div>
                  </a>
                  <a 
                    href="/account/takeback" 
                    class="block px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 transition-all duration-300 rounded-lg mx-2"
                  >
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                      Programme Reprise
                    </div>
                  </a>
                {:else}
                  <a 
                    href="/admin" 
                    class="block px-4 py-3 text-sm text-gray-700 hover:bg-yellow-50 transition-all duration-300 rounded-lg mx-2"
                  >
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18"></path>
                      </svg>
                      Admin
                    </div>
                  </a>
                {/if}
                <a 
                  href="/account/profile" 
                  class="block px-4 py-3 text-sm text-gray-700 hover:bg-yellow-50 transition-all duration-300 rounded-lg mx-2"
                >
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Profil
                  </div>
                </a>
                <hr class="my-2 border-gray-200 mx-2" />
                <button
                  on:click={logout}
                  class="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 transition-all duration-300 rounded-lg mx-2"
                >
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    Déconnexion
                  </div>
                </button>
              </div>
            {/if}
          </div>
        {:else}
          <div class="flex space-x-3">
            <a 
              href="/account" 
              class="text-gray-700 hover:text-purple-600 px-4 py-2.5 text-base font-semibold transition-all duration-300 rounded-lg hover:bg-purple-50"
            >
              Mon compte
            </a>
            <a 
              href="/auth/login" 
              class="text-gray-700 hover:text-purple-600 px-4 py-2.5 text-base font-semibold transition-all duration-300 rounded-lg hover:bg-purple-50"
            >
              Connexion
            </a>
            <a 
              href="/auth/register" 
              class="custom-yellow text-white px-6 py-2.5 text-base font-semibold rounded-lg custom-yellow-hover transition-all duration-300 shadow-md hover:shadow-lg"
            >
              S'inscrire
            </a>
          </div>
        {/if}

        <!-- Bouton menu mobile -->
        <button
          on:click={toggleMenu}
          class="md:hidden p-2 text-gray-700 hover:text-custom-yellow transition-all duration-300 rounded-lg hover:bg-yellow-50"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {#if isMenuOpen}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            {:else}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            {/if}
          </svg>
        </button>
      </div>
    </div>

    <!-- Menu mobile -->
    {#if isMenuOpen}
      <div class="md:hidden mt-4 animate-slideDown">
        <div class="bg-white rounded-xl px-4 py-4 space-y-2 border border-gray-200 shadow-lg">
          <a 
            href="/products" 
            class="block px-4 py-3 text-gray-700 hover:text-custom-yellow hover:bg-yellow-50 rounded-lg transition-all duration-300 font-medium"
            on:click={() => isMenuOpen = false}
          >
            Produits
          </a>
          <a 
            href="/about" 
            class="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-300 font-medium"
            on:click={() => isMenuOpen = false}
          >
            À Propos
          </a>
          
          <!-- Recherche mobile -->
          <div class="pt-3 border-t border-gray-200">
            <form action="/products" method="GET" class="flex">
              <input
                type="search"
                name="search"
                placeholder="Rechercher des chaussures..."
                class="flex-1 px-4 py-3 bg-gray-50 text-gray-900 placeholder-gray-500 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-yellow focus:border-transparent transition-all duration-300"
              />
              <button
                type="submit"
                class="px-4 py-3 custom-yellow text-white rounded-r-lg custom-yellow-hover transition-all duration-300"
                aria-label="Rechercher"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
            </form>
          </div>

          <!-- Menu utilisateur mobile -->
          {#if $isAuthenticated}
            <div class="pt-3 border-t border-gray-200 mt-4">
              <div class="px-4 py-3 text-base font-semibold text-gray-800 bg-gray-50 rounded-lg">
                Bonjour, {$user?.firstName || 'Utilisateur'}
              </div>
              <div class="space-y-1 mt-3">
                {#if $user?.role !== 'ADMIN'}
                  <a 
                    href="/account/orders" 
                    class="block px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-custom-yellow rounded-lg transition-all duration-300 font-medium"
                    on:click={() => isMenuOpen = false}
                  >
                    Mes Commandes
                  </a>
                  <a 
                    href="/account/takeback" 
                    class="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all duration-300 font-medium"
                    on:click={() => isMenuOpen = false}
                  >
                    Programme Reprise
                  </a>
                {:else}
                  <a 
                    href="/admin" 
                    class="block px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-custom-yellow rounded-lg transition-all duration-300 font-medium"
                    on:click={() => isMenuOpen = false}
                  >
                    Admin
                  </a>
                {/if}
                <a 
                  href="/account/profile" 
                  class="block px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-custom-yellow rounded-lg transition-all duration-300 font-medium"
                  on:click={() => isMenuOpen = false}
                >
                  Profil
                </a>
                <button
                  on:click={logout}
                  class="block w-full text-left px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-300 font-medium"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          {:else}
            <div class="pt-3 border-t border-gray-200 mt-4 space-y-2">
              <a 
                href="/account" 
                class="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-300 font-medium text-center"
                on:click={() => isMenuOpen = false}
              >
                Mon compte
              </a>
              <a 
                href="/auth/login" 
                class="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-300 font-medium text-center"
                on:click={() => isMenuOpen = false}
              >
                Connexion
              </a>
              <a 
                href="/auth/register" 
                class="block px-4 py-3 custom-yellow text-white rounded-lg custom-yellow-hover transition-all duration-300 font-medium text-center shadow-md"
                on:click={() => isMenuOpen = false}
              >
                S'inscrire
              </a>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</header>

<style>
  .custom-yellow {
    background-color: #FEC32D;
  }

  .custom-yellow-hover:hover {
    background-color: #E5B029;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }

  .animate-slideDown {
    animation: slideDown 0.3s ease-out;
  }
</style>
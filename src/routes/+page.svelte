<script lang="ts">
    import { onMount } from 'svelte';
    import ProductCard from '$lib/components/ProductCard.svelte';
    import { user } from '$lib/stores/auth';
  
    let featuredProducts: any[] = [];
    let loading = true;
    $: currentUser = $user;
    $: isVendorOrAdmin = !!currentUser && (currentUser.role === 'VENDEUR' || currentUser.role === 'ADMIN');
  
    onMount(async () => {
      try {
        const response = await fetch('/api/products?page=1&limit=8');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        featuredProducts = data.products || [];
      } catch (error) {
        console.error('Échec du chargement des produits vedettes:', error);
        // Set empty array to prevent infinite loading
        featuredProducts = [];
      } finally {
        loading = false;
      }
    });
  </script>
  
  <svelte:head>
    <title>SNEAKERS</title>
  </svelte:head>

  <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800"></div>
    <div class="absolute inset-0 bg-black/20"></div>
    
    <div class="relative z-10 max-w-4xl mx-auto px-6 text-center">
      <div class="space-y-8">
        <h1 class="text-5xl md:text-7xl lg:text-8xl font-thin tracking-tight text-white leading-none">
          <span class="block font-light">SNEAKERS</span>
          <span class="block font-bold bg-clip-text text-transparent" style="color: #0C766C;">
            URBAINES
          </span>
        </h1>

        <div class="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <a 
            href="/products" 
            class="group relative px-8 py-4 bg-white text-black font-medium tracking-wide uppercase text-sm hover:bg-gray-100 transition-all duration-300 overflow-hidden"
            on:click={(e) => {
              // Ensure navigation works even if there are JS errors
              if (e.defaultPrevented) return;
              window.location.href = '/products';
            }}
          >
            <span class="relative z-10">Explorer la Collection</span>
            <div class="absolute inset-0 bg-gradient-to-r from-gray-100 to-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
          </a>
        </div>
      </div>
    </div>
    
    <!-- Indicateur de scroll -->
    <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60">
      <div class="animate-bounce">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </div>
  </section>
  
  <!-- Section Produits Vedettes -->
  <section class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-6">
      {#if isVendorOrAdmin}
        <div class="mb-10 rounded border bg-white p-4 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium">Espace vendeur</h3>
            <p class="text-sm text-gray-600">Gérez vos produits et stocks en temps réel.</p>
          </div>
          <div class="flex gap-2">
            <a href="/vendeur" class="px-4 py-2 rounded border">Tableau de bord</a>
            <a href="/vendeur/nouveau" class="px-4 py-2 rounded bg-black text-white">Ajouter un article</a>
          </div>
        </div>
      {/if}
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-thin tracking-tight text-black mb-4">
          SÉLECTION
        </h2>
        <div class="w-20 h-px bg-black mx-auto"></div>
      </div>
  
      {#if loading}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {#each Array(8) as _}
            <div class="bg-white shadow-sm overflow-hidden group">
              <div class="h-80 bg-gray-200 animate-pulse"></div>
              <div class="p-6">
                <div class="h-4 bg-gray-200 rounded mb-3 animate-pulse"></div>
                <div class="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          {/each}
        </div>
      {:else if featuredProducts.length > 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {#each featuredProducts as product}
            <ProductCard {product} />
          {/each}
        </div>
        
        <div class="text-center mt-16">
          <a 
            href="/products" 
            class="inline-block px-8 py-4 bg-black text-white font-medium tracking-wide uppercase text-sm hover:bg-gray-900 transition-colors duration-300"
            on:click={(e) => {
              // Ensure navigation works even if there are JS errors
              if (e.defaultPrevented) return;
              window.location.href = '/products';
            }}
          >
            Voir Tous les Produits
          </a>
        </div>
      {:else}
        <div class="text-center">
          <p class="text-gray-600">Aucun produit disponible pour le moment.</p>
        </div>
      {/if}
    </div>
  </section>
  
  <!-- Section Newsletter - Design moderne -->
  <section class="py-20 bg-black text-white">
    <div class="max-w-4xl mx-auto px-6 text-center">
      <h2 class="text-3xl md:text-4xl font-thin tracking-tight mb-4">
        RESTEZ CONNECTÉS
      </h2>
      <p class="text-gray-400 mb-12 font-light">
        Pour être notifié des nouveautés et offres exclusives
      </p>
      
      <form class="max-w-lg mx-auto">
        <div class="flex border-b border-white/20 focus-within:border-white/40 transition-colors duration-300">
          <input
            type="email"
            placeholder="Votre adresse email"
            class="flex-1 bg-transparent py-4 px-0 text-white placeholder-gray-400 focus:outline-none text-center"
          />
          <button
          type="submit"
          class="group px-8 py-4 bg-white text-black font-semibold tracking-wider uppercase text-sm hover:bg-gray-200 transition-all duration-500 transform hover:scale-105 min-w-fit"
          aria-label="S'abonner à la newsletter"
        >
          <span class="flex items-center space-x-2">
            <span>S'abonner</span>
            <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </span>
        </button>
        </div>
      </form>
    </div>
  </section>
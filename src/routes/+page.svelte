<script lang="ts">
    import { onMount } from 'svelte';
    import ProductCard from '$lib/components/ProductCard.svelte';
  
    let featuredProducts: any[] = [];
    let loading = true;
  
    onMount(async () => {
      try {
        const response = await fetch('/api/asphaltgold?limit=8&offset=0&mapped=true');
        const data = await response.json();
        featuredProducts = data.products || [];
      } catch (error) {
        console.error('Échec du chargement des produits vedettes:', error);
      } finally {
        loading = false;
      }
    });
  </script>
  
  <svelte:head>
    <title>Chaussures Alternatives</title>
  </svelte:head>

  <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800"></div>
    <div class="absolute inset-0 bg-black/20"></div>
    
    <div class="relative z-10 max-w-4xl mx-auto px-6 text-center">
      <div class="space-y-8">
        <h1 class="text-5xl md:text-7xl lg:text-8xl font-thin tracking-tight text-white leading-none">
          <span class="block font-light">SNEAKERS</span>
          <span class="block font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            ULTRA URBAINES
          </span>
        </h1>

        <div class="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <a 
            href="/products" 
            class="group relative px-8 py-4 bg-white text-black font-medium tracking-wide uppercase text-sm hover:bg-gray-100 transition-all duration-300 overflow-hidden"
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
  
  <!-- Section Caractéristiques -->
  <section class="py-20 bg-white">
    <div class="max-w-6xl mx-auto px-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div class="group text-center">
          <div class="w-20 h-20 mx-auto mb-6 relative">
            <div class="absolute inset-0 bg-black/5 rounded-full group-hover:bg-black/10 transition-colors duration-300"></div>
            <div class="relative w-full h-full flex items-center justify-center">
              <svg class="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <h3 class="text-xl font-light mb-3 tracking-wide">HYBRIDE</h3>
        </div>
        
        <div class="group text-center">
          <div class="w-20 h-20 mx-auto mb-6 relative">
            <div class="absolute inset-0 bg-black/5 rounded-full group-hover:bg-black/10 transition-colors duration-300"></div>
            <div class="relative w-full h-full flex items-center justify-center">
              <svg class="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <h3 class="text-xl font-light mb-3 tracking-wide">PERFORMANTE</h3>
        </div>
        
        <div class="group text-center">
          <div class="w-20 h-20 mx-auto mb-6 relative">
            <div class="absolute inset-0 bg-black/5 rounded-full group-hover:bg-black/10 transition-colors duration-300"></div>
            <div class="relative w-full h-full flex items-center justify-center">
              <svg class="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </div>
          </div>
          <h3 class="text-xl font-light mb-3 tracking-wide">TEST DRIVE</h3>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Section Produits Vedettes -->
  <section class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-6">
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
        Nouveautés et offres exclusives
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
            class="text-white hover:text-gray-300 transition-colors duration-300 px-4"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </form>
    </div>
  </section>
<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

  export let product: any;
  let currentStock: number | null = null;
  let availableSizes: number[] = [];
  let sizeStock: { [size: number]: number } = {};
  
  const dispatch = createEventDispatcher();

  function addToCart() {
    // For now, just redirect to product page
    // In a real app, you'd add to cart via API
    window.location.href = `/products/${product.slug}`;
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  let es: EventSource | null = null;

  async function refreshStock() {
    if (typeof product?.id !== 'number') return;
    try {
      const res = await fetch(`/api/products/${product.id}/stock`);
      const data = await res.json();
      if (typeof data.stock === 'number') currentStock = data.stock;
    } catch {}
  }

  async function loadSizeStock() {
    if (typeof product?.id !== 'number') return;
    try {
      const res = await fetch(`/api/products/${product.id}/variants`);
      const data = await res.json();
      if (data.variants) {
        availableSizes = [...new Set(data.variants.map((v: any) => v.size))].sort((a: any, b: any) => a - b) as number[];
        sizeStock = {};
        data.variants.forEach((variant: any) => {
          const stock = typeof variant.stock === 'number' ? Math.max(0, variant.stock) : Math.max(0, variant.onHand - variant.reserved);
          sizeStock[variant.size] = stock;
        });
      }
    } catch (error) {
      console.warn(`Failed to load size stock for product ${product.id}:`, error);
    }
  }

  onMount(() => {
    // Only load stock data if we don't already have it
    if (!currentStock && product?.stock !== undefined) {
      currentStock = product.stock;
    } else {
      refreshStock();
    }
    
    // Load size stock only if we need it (lazy loading)
    setTimeout(() => {
      loadSizeStock();
    }, 100);

    return () => {
      es?.close();
      es = null;
    };
  });
</script>

<div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
  <a href={`/products/${product.slug}`} class="block">
    {#if product.imageUrl}
      <img 
        src={product.imageUrl} 
        alt={product.imageAlt || product.name}
        class="w-full h-64 object-cover"
        loading="lazy"
      />
    {:else}
      <div class="w-full h-64 bg-gray-200 flex items-center justify-center">
        <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      </div>
    {/if}
  </a>
  
  <div class="p-4">
    <div class="flex items-center justify-between mb-2">
      <span class="text-sm text-gray-600">{product.brandName}</span>
      <div class="flex space-x-1">
        {#if product.isVegan}
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Vegan
          </span>
        {/if}
        {#if product.hasSteelToe}
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Steel Toe
          </span>
        {/if}
      </div>
    </div>
    
    <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
      <a href={`/products/${product.slug}`} class="hover:text-gray-700">
        {product.name}
      </a>
    </h3>
    
    <p class="text-gray-600 text-sm mb-3 line-clamp-2">
      {product.shortDescription}
    </p>
    
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2">
        <span class="text-lg font-bold text-gray-900">
          {formatPrice(product.price)}
        </span>
        {#if product.compareAtPrice && product.compareAtPrice > product.price}
          <span class="text-sm text-gray-500 line-through">
            {formatPrice(product.compareAtPrice)}
          </span>
        {/if}
      </div>
      
      {#if (currentStock ?? product.stock) > 0}
        <span class="text-sm text-green-600 font-medium">En stock</span>
      {:else}
        <span class="text-sm text-red-600 font-medium">Rupture</span>
      {/if}
    </div>

    <!-- Available Sizes - Only show if loaded -->
    {#if availableSizes.length > 0}
      <div class="mb-4">
        <div class="flex flex-wrap gap-1">
          {#each availableSizes.slice(0, 4) as size}
            <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium {sizeStock[size] > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}">
              {size}
            </span>
          {/each}
          {#if availableSizes.length > 4}
            <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-500">
              +{availableSizes.length - 4}
            </span>
          {/if}
        </div>
        <p class="text-xs text-gray-500 mt-1">Tailles disponibles</p>
      </div>
    {:else}
      <!-- Show loading state for sizes -->
      <div class="mb-4">
        <div class="flex flex-wrap gap-1">
          <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-400 animate-pulse">
            ...
          </span>
        </div>
      </div>
    {/if}
    
    <button
      on:click={addToCart}
      disabled={(currentStock ?? product.stock) === 0}
      class="w-full bg-gray-800 text-white py-2 px-4 rounded-md font-medium hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
    >
      {(currentStock ?? product.stock) > 0 ? 'Voir le produit' : 'Rupture de stock'}
    </button>
  </div>
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>



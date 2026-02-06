<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import ProductFilters from '$lib/components/ProductFilters.svelte';

  type Pagination = { page: number; limit: number; total: number; pages: number };
  let products: any[] = [];
  let loading = true;
  let loadingMore = false;

  // Pagination avec 40 produits initiaux et 20 par page suivante
  let pagination: Pagination = { page: 1, limit: 40, total: 0, pages: 1 };
  const INITIAL_LIMIT = 40;
  const LOAD_MORE_LIMIT = 20;

  let filters = {
    search: '',
    brand: '',
    category: '',
    gender: '',
    vegan: false,
    steelToe: false,
    minPrice: '',
    maxPrice: '',
    sort: 'created_at',
    order: 'desc'
  };

  onMount(loadProducts);

  // Réagit aux changements d'URL
  $: if (browser) {
    const url = new URL($page.url);
    filters.search = url.searchParams.get('search') || '';
    filters.brand = url.searchParams.get('brand') || '';
    filters.category = url.searchParams.get('category') || '';
    filters.gender = url.searchParams.get('gender') || '';
    filters.vegan = url.searchParams.get('vegan') === 'true';
    filters.steelToe = url.searchParams.get('steel_toe') === 'true';
    filters.minPrice = url.searchParams.get('min_price') || '';
    filters.maxPrice = url.searchParams.get('max_price') || '';
    filters.sort = url.searchParams.get('sort') || 'created_at';
    filters.order = url.searchParams.get('order') || 'desc';
    loadProducts();
  }

  async function loadProducts(reset = true) {
    if (!browser) return; // Ne pas exécuter côté serveur
    
    if (reset) {
      loading = true;
      products = [];
      pagination.page = 1;
    } else {
      loadingMore = true;
    }

    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.brand) params.set('brand', filters.brand);
      if (filters.category) params.set('category', filters.category);
      if (filters.gender) params.set('gender', filters.gender);
      if (filters.vegan) params.set('vegan', 'true');
      if (filters.steelToe) params.set('steel_toe', 'true');
      if (filters.minPrice) params.set('min_price', filters.minPrice);
      if (filters.maxPrice) params.set('max_price', filters.maxPrice);
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.order) params.set('order', filters.order);

      // Configuration de la pagination
      const currentPage = reset ? 1 : pagination.page + 1;
      const currentLimit = reset ? INITIAL_LIMIT : LOAD_MORE_LIMIT;
      
      params.set('page', currentPage.toString());
      params.set('limit', currentLimit.toString());

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      const newProducts = data.products ?? [];
      
      if (reset) {
        products = newProducts;
        pagination = {
          page: currentPage,
          limit: currentLimit,
          total: data.pagination?.total ?? 0,
          pages: data.pagination?.totalPages ?? 1
        };
      } else {
        products = [...products, ...newProducts];
        pagination = {
          ...pagination,
          page: currentPage,
          limit: pagination.limit + currentLimit
        };
      }
    } catch (e) {
      console.error('Échec du chargement des produits:', e);
    } finally {
      loading = false;
      loadingMore = false;
    }
  }

  async function loadMoreProducts() {
    if (!browser) return; // Ne pas exécuter côté serveur
    if (!loadingMore && products.length < pagination.total) {
      await loadProducts(false);
    }
  }

  function updateFilters(newFilters: any) {
    const next = { ...filters, ...newFilters };
    const url = new URL($page.url);
    Object.entries(next).forEach(([k, v]) => {
      if (v && v !== '') url.searchParams.set(k, String(v));
      else url.searchParams.delete(k);
    });
    goto(url.toString(), { replaceState: true });
  }
</script>

<svelte:head>
  <title>Produits – Sheos</title>
  <meta name="description" content="Parcourez notre sélection de chaussures tendances et originales. Filtrez par marque, prix, options et découvrez nos nouveautés." />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Produits</h1>
    <p class="text-gray-600">Découvrez notre collection de chaussures tendances et originales</p>
  </div>

  <div class="flex flex-col lg:flex-row gap-8">
    <aside class="lg:w-1/4">
      <ProductFilters {filters} on:update={updateFilters} />
    </aside>

    <main class="lg:w-3/4">
      <div class="flex justify-between items-center mb-6">
        <p class="text-gray-600">
          {#if loading}
            Chargement des produits…
          {:else}
            {products.length} produit{products.length > 1 ? 's' : ''} affiché{products.length > 1 ? 's' : ''} / {pagination.total}
          {/if}
        </p>
        <div class="flex items-center gap-2">
          <label for="sort" class="text-sm text-gray-700">Trier par&nbsp;:</label>
          <select id="sort" bind:value={filters.sort} on:change={() => updateFilters({ sort: filters.sort })} class="border rounded-md px-3 py-1 text-sm">
            <option value="created_at">Nouveautés</option>
            <option value="price">Prix</option>
            <option value="name">Nom</option>
          </select>
          <select bind:value={filters.order} on:change={() => updateFilters({ order: filters.order })} class="border rounded-md px-3 py-1 text-sm">
            <option value="desc">Décroissant</option>
            <option value="asc">Croissant</option>
          </select>
        </div>
      </div>

      {#if loading}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each Array(9) as _}
            <div class="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
              <div class="h-64 bg-gray-200"></div>
              <div class="p-4">
                <div class="h-4 bg-gray-200 rounded mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          {/each}
        </div>
      {:else if products.length > 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each products as product}
            <ProductCard {product} />
          {/each}
        </div>
        
        
        <!-- Bouton "Charger plus" -->
        {#if products.length < pagination.total}
          <div class="text-center mt-8">
            <button
              on:click={loadMoreProducts}
              disabled={loadingMore}
              class="bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {#if loadingMore}
                <span class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Chargement...
                </span>
              {:else}
                Charger 20 produits supplémentaires
              {/if}
            </button>
            <p class="text-sm text-gray-500 mt-2">
              {products.length} sur {pagination.total} produits affichés
            </p>
          </div>
        {/if}
      {:else}
        <div class="text-center py-12">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
          <p class="text-gray-600 mb-4">Modifiez vos filtres ou votre recherche</p>
          <button
            on:click={() => updateFilters({ search: '', brand: '', category: '', gender: '', vegan: false, steelToe: false, minPrice: '', maxPrice: '' })}
            class="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Réinitialiser les filtres
          </button>
        </div>
      {/if}
    </main>
  </div>
</div>

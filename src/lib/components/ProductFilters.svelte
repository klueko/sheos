<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';

  export let filters: any;

  const dispatch = createEventDispatcher();

  let brands: Array<{ id: number; name: string }> = [];
  let categories: Array<{ id: string; name: string }> = [];
  let loading = true;

  onMount(async () => {
    try {
      // Charger les vraies marques depuis la base de données
      const brandsResponse = await fetch('/api/brands');
      if (brandsResponse.ok) {
        const brandsData = await brandsResponse.json();
        brands = brandsData.brands || [];
      }

      // Catégories homme/femme/enfant
      categories = [
        { id: 'homme', name: 'Homme' },
        { id: 'femme', name: 'Femme' },
        { id: 'enfant', name: 'Enfant' }
      ];
    } catch (error) {
      console.error('Erreur lors du chargement des filtres:', error);
    } finally {
      loading = false;
    }
  });

  function updateFilter(key: string, value: any) {
    dispatch('update', { [key]: value });
  }

  function clearFilters() {
    dispatch('update', {
      search: '',
      brand: '',
      category: '',
      gender: '',
      vegan: false,
      steelToe: false,
      minPrice: '',
      maxPrice: ''
    });
  }
</script>

<div class="bg-white rounded-lg shadow-md p-6">
  <div class="flex items-center justify-between mb-6">
    <h3 class="text-lg font-semibold text-gray-900">Filtres</h3>
    <button
      on:click={clearFilters}
      class="text-sm text-gray-600 hover:text-gray-900"
    >
      Réinitialiser
    </button>
  </div>

  <!-- Recherche -->
  <div class="mb-6">
    <label for="search" class="block text-sm font-medium text-gray-700 mb-2">
      Recherche
    </label>
    <input
      id="search"
      type="text"
      bind:value={filters.search}
      on:input={() => updateFilter('search', filters.search)}
      placeholder="Rechercher des produits…"
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
    />
  </div>

  <!-- Marque -->
  <div class="mb-6">
    <label for="brand" class="block text-sm font-medium text-gray-700 mb-2">
      Marque
    </label>
    <select
      id="brand"
      bind:value={filters.brand}
      on:change={() => updateFilter('brand', filters.brand)}
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
    >
      <option value="">Toutes les marques</option>
      {#each brands as brand}
        <option value={brand.id}>{brand.name}</option>
      {/each}
    </select>
  </div>

  <!-- Genre -->
  <div class="mb-6">
    <label for="gender" class="block text-sm font-medium text-gray-700 mb-2">
      Genre
    </label>
    <select
      id="gender"
      bind:value={filters.gender}
      on:change={() => updateFilter('gender', filters.gender)}
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
    >
      <option value="">Tous les genres</option>
      {#each categories as category}
        <option value={category.id}>{category.name}</option>
      {/each}
    </select>
  </div>

  <!-- Fourchette de prix -->
  <div class="mb-6">
    <label class="block text-sm font-medium text-gray-700 mb-2">
      Fourchette de prix
    </label>
    <div class="grid grid-cols-2 gap-2">
      <input
        type="number"
        bind:value={filters.minPrice}
        on:input={() => updateFilter('minPrice', filters.minPrice)}
        placeholder="Min"
        class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
      />
      <input
        type="number"
        bind:value={filters.maxPrice}
        on:input={() => updateFilter('maxPrice', filters.maxPrice)}
        placeholder="Max"
        class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
      />
    </div>
  </div>

  {#if loading}
    <div class="text-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
      <p class="text-sm text-gray-600 mt-2">Chargement des filtres...</p>
    </div>
  {/if}
</div>

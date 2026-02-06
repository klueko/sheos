<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let products = [];
  let brands = [];
  let pagination = { page: 1, limit: 20, total: 0, pages: 0 };
  let loading = true;
  let filters = {
    search: '',
    brand: ''
  };

  onMount(async () => {
    await loadBrands();
    await loadProducts();
  });

  $: {
    // React to URL changes
    const url = new URL($page.url);
    filters.search = url.searchParams.get('search') || '';
    filters.brand = url.searchParams.get('brand') || '';
    loadProducts();
  }

  async function loadBrands() {
    try {
      const response = await fetch('/api/brands');
      const data = await response.json();
      brands = data.brands || [];
    } catch (error) {
      console.error('Failed to load brands:', error);
    }
  }

  async function loadProducts() {
    loading = true;
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.set('search', filters.search);
      if (filters.brand) params.set('brand', filters.brand);
      params.set('page', pagination.page.toString());
      params.set('limit', pagination.limit.toString());

      const response = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await response.json();
      
      products = data.products || [];
      pagination = data.pagination || pagination;
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      loading = false;
    }
  }

  function updateFilters(newFilters: any) {
    filters = { ...filters, ...newFilters };
    pagination.page = 1; // Reset to first page
    
    // Update URL
    const url = new URL($page.url);
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        url.searchParams.set(key, value.toString());
      } else {
        url.searchParams.delete(key);
      }
    });
    
    window.history.pushState({}, '', url.toString());
  }

  async function toggleProductStatus(productId: number, currentStatus: boolean) {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          productId, 
          isActive: !currentStatus 
        })
      });

      if (response.ok) {
        // Reload products
        await loadProducts();
      } else {
        console.error('Failed to update product status');
      }
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<svelte:head>
  <title>Products - Admin - Sheos</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Produits</h1>
      <p class="text-gray-600">Gérer les produits en ligne</p>
    </div>
    <a
      href="/admin/products/new"
      class="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
    >
      Ajouter un produit
    </a>
  </div>

  <!-- Filters -->
  <div class="bg-white rounded-lg shadow p-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label for="search" class="block text-sm font-medium text-gray-700 mb-2">
          Rechercher
        </label>
        <input
          id="search"
          type="text"
          bind:value={filters.search}
          on:input={() => updateFilters({ search: filters.search })}
          placeholder="Search products..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
        />
      </div>
      
      <div>
        <label for="brand-filter" class="block text-sm font-medium text-gray-700 mb-2">
          Marque
        </label>
        <select
          id="brand-filter"
          bind:value={filters.brand}
          on:change={() => updateFilters({ brand: filters.brand })}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <option value="">Toutes les marques</option>
          {#each brands as brand}
            <option value={brand.id}>{brand.name}</option>
          {/each}
        </select>
      </div>
      
      <div class="flex items-end">
        <button
          on:click={() => updateFilters({ search: '', brand: '' })}
          class="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          Reinitialiser les filtres
        </button>
      </div>
    </div>
  </div>

  <!-- Products Table -->
  <div class="bg-white rounded-lg shadow overflow-hidden">
    {#if loading}
      <div class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    {:else if products.length > 0}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produit
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Marque
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Créé le
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each products as product}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    <a href="/admin/products/{product.id}" class="text-blue-600 hover:text-blue-900">
                      {product.name}
                    </a>
                  </div>
                  <div class="text-sm text-gray-500">{product.sku}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.brand.name}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatPrice(product.price)}
                  {#if product.compareAtPrice}
                    <div class="text-sm text-gray-500 line-through">
                      {formatPrice(product.compareAtPrice)}
                    </div>
                  {/if}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(product.createdAt)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <a
                    href="/admin/products/{product.id}"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    Modifier
                  </a>
                  <button
                    on:click={() => toggleProductStatus(product.id, product.isActive)}
                    class="text-{product.isActive ? 'red' : 'green'}-600 hover:text-{product.isActive ? 'red' : 'green'}-900"
                  >
                    {product.isActive ? 'Désactiver' : 'Activer'}
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      {#if pagination.pages > 1}
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              on:click={() => { pagination.page = Math.max(1, pagination.page - 1); loadProducts(); }}
              disabled={pagination.page <= 1}
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              on:click={() => { pagination.page = Math.min(pagination.pages, pagination.page + 1); loadProducts(); }}
              disabled={pagination.page >= pagination.pages}
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing <span class="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                to <span class="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span>
                of <span class="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  on:click={() => { pagination.page = Math.max(1, pagination.page - 1); loadProducts(); }}
                  disabled={pagination.page <= 1}
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  on:click={() => { pagination.page = Math.min(pagination.pages, pagination.page + 1); loadProducts(); }}
                  disabled={pagination.page >= pagination.pages}
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      {/if}
    {:else}
      <div class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No products found</h3>
        <p class="mt-1 text-sm text-gray-500">Try adjusting your filters or add a new product.</p>
        <div class="mt-6">
          <a
            href="/admin/products/new"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700"
          >
            Add Product
          </a>
        </div>
      </div>
    {/if}
  </div>
</div>

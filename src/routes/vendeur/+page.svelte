<script lang="ts">
  import { onMount } from 'svelte';
  import Notification from '$lib/components/Notification.svelte';
  import ConfirmModal from '$lib/components/ConfirmModal.svelte';
  import StockChart from '$lib/components/StockChart.svelte';
  
  let products: any[] = [];
  let search = '';
  let loading = false;
  let editingStock: { productId: number; variantId: number } | null = null;
  let stockInput = '';
  let stats: any = {
    totalProducts: 0,
    totalStock: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0
  };
  let showDeleteModal = false;
  let productToDelete: number | null = null;
  let notification = { show: false, type: 'info' as 'success' | 'error' | 'warning' | 'info', message: '' };

  async function load() {
    loading = true;
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const res = await fetch(`/api/vendeur/products?${params.toString()}`);
    const data = await res.json();
    products = data.products || [];
    calculateStats();
    loading = false;
  }

  function calculateStats() {
    stats.totalProducts = products.length;
    stats.totalStock = products.reduce((sum, p) => sum + (p.totalStock || 0), 0);
    stats.lowStockProducts = products.filter(p => p.totalStock > 0 && p.totalStock <= 5).length;
    stats.outOfStockProducts = products.filter(p => p.totalStock === 0).length;
  }

  function showDeleteConfirm(id: number) {
    productToDelete = id;
    showDeleteModal = true;
  }

  async function confirmDelete() {
    if (!productToDelete) return;
    
    try {
      const res = await fetch(`/api/vendeur/products?productId=${productToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('success', 'Produit supprimé avec succès');
        load();
      } else {
        showNotification('error', 'Erreur lors de la suppression du produit');
      }
    } catch (e) {
      showNotification('error', 'Erreur de connexion');
    }
    
    showDeleteModal = false;
    productToDelete = null;
  }

  function showNotification(type: 'success' | 'error' | 'warning' | 'info', message: string) {
    notification = { show: true, type, message };
  }

  async function handleStockUpdate(productId: number, { variantId, stock }: { variantId: number, stock: number }) {
    try {
      const res = await fetch(`/api/vendeur/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          variantId, 
          stock 
        })
      });

      if (res.ok) {
        showNotification('success', 'Stock mis à jour avec succès');
        load(); // Reload to get updated data
      } else {
        showNotification('error', 'Erreur lors de la mise à jour du stock');
      }
    } catch (e) {
      showNotification('error', 'Erreur de connexion');
    }
  }

  function startStockEdit(productId: number, variantId: number, currentStock: number) {
    editingStock = { productId, variantId };
    stockInput = currentStock.toString();
  }

  function cancelStockEdit() {
    editingStock = null;
    stockInput = '';
  }

  async function updateStock() {
    if (!editingStock) return;
    
    const newStock = parseInt(stockInput);
    if (isNaN(newStock) || newStock < 0) {
      showNotification('error', 'Veuillez entrer un nombre valide');
      return;
    }

    try {
    const res = await fetch(`/api/vendeur/products/${editingStock.productId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        variantId: editingStock.variantId, 
        stock: newStock 
      })
    });

    if (res.ok) {
      editingStock = null;
      stockInput = '';
        showNotification('success', 'Stock mis à jour avec succès');
      load(); // Reload to get updated data
      } else {
        showNotification('error', 'Erreur lors de la mise à jour du stock');
      }
    } catch (e) {
      showNotification('error', 'Erreur de connexion');
    }
  }

  onMount(load);
</script>

<div class="page-transition">
  <!-- Header -->
  <div class="mb-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <p class="text-gray-600 mt-1">Gérez vos produits et stocks</p>
      </div>
      <a href="/vendeur/nouveau" class="inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors" style="background-color: #0C766C" on:mouseover={(e) => e.currentTarget.style.backgroundColor = '#0A5D54'} on:mouseout={(e) => e.currentTarget.style.backgroundColor = '#0C766C'}>
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Nouveau produit
      </a>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg border border-gray-100">
        <div class="text-center">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Produits</p>
          <p class="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg border border-gray-100">
        <div class="text-center">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Stock total</p>
          <p class="text-2xl font-bold text-gray-900">{stats.totalStock}</p>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg border border-gray-100">
        <div class="text-center">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Stock faible</p>
          <p class="text-2xl font-bold text-yellow-600">{stats.lowStockProducts}</p>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg border border-gray-100">
        <div class="text-center">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Rupture</p>
          <p class="text-2xl font-bold text-red-600">{stats.outOfStockProducts}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Search -->
  <div class="mb-6">
    <div class="relative max-w-md">
      <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
      <input 
        class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white" 
        placeholder="Rechercher un produit..." 
        bind:value={search} 
        on:keydown={(e) => e.key==='Enter' && load()} 
      />
    </div>
  </div>

  <!-- Products List -->
  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2" style="border-color: #0C766C"></div>
      <span class="ml-3 text-gray-600">Chargement des produits...</span>
    </div>
  {:else if products.length === 0}
    <div class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun produit</h3>
      <p class="mt-1 text-sm text-gray-500">Commencez par ajouter votre premier produit.</p>
      <div class="mt-6">
        <a href="/vendeur/nouveau" class="inline-flex items-center px-4 py-2 text-white rounded-lg" style="background-color: #0C766C" on:mouseover={(e) => e.currentTarget.style.backgroundColor = '#0A5D54'} on:mouseout={(e) => e.currentTarget.style.backgroundColor = '#0C766C'}>
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Ajouter un produit
        </a>
      </div>
    </div>
  {:else}
    <div class="grid gap-6">
      {#each products as p}
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
          <!-- Product Image and Info -->
          <div class="flex">
            <!-- Product Image -->
            <div class="w-32 h-32 flex-shrink-0 bg-gray-100">
              {#if p.images && p.images.length > 0}
                <img 
                  src={p.images[0].url} 
                  alt={p.name}
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
              {:else}
                <div class="w-full h-full flex items-center justify-center bg-gray-50">
                  <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
              </div>
              {/if}
            </div>
            
            <!-- Product Details -->
            <div class="flex-1 p-4">
              <div class="flex items-start justify-between h-full">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="text-lg font-semibold text-gray-900 truncate">{p.name}</h3>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {p.totalStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                      {p.totalStock > 0 ? 'En stock' : 'Rupture'}
                    </span>
                  </div>
                  <p class="text-gray-500 text-sm mb-2">{p.brand?.name}</p>
                  <p class="text-lg font-bold" style="color: #0C766C">{p.price} €</p>
                  <div class="mt-2 text-xs text-gray-400">
                    Stock total: <span class="font-medium text-gray-600">{p.totalStock}</span>
                  </div>
                </div>
                
                <!-- Actions -->
                <div class="flex flex-col gap-2 ml-4">
                  <a 
                    href={`/vendeur/${p.id}`} 
                    class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                    style="color: #0C766C; background-color: #E6F7F5"
                    on:mouseover={(e) => e.currentTarget.style.backgroundColor = '#D1F2EB'}
                    on:mouseout={(e) => e.currentTarget.style.backgroundColor = '#E6F7F5'}
                  >
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                Modifier
              </a>
                  <button 
                    class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    on:click={() => showDeleteConfirm(p.id)}
                  >
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                Supprimer
              </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Stock Chart -->
          {#if p.variants && p.variants.length > 0}
            <div class="px-4 pb-4">
              <StockChart 
                variants={p.variants} 
                productName={p.name} 
                on:stockUpdate={(e) => handleStockUpdate(p.id, e.detail)}
              />
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Notification Component -->
<Notification 
  bind:show={notification.show}
  type={notification.type}
  message={notification.message}
  on:hide={() => notification.show = false}
/>

<!-- Delete Confirmation Modal -->
<ConfirmModal
  bind:show={showDeleteModal}
  title="Supprimer le produit"
  message="Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible."
  confirmText="Supprimer"
  cancelText="Annuler"
  variant="danger"
  on:confirm={confirmDelete}
  on:cancel={() => { showDeleteModal = false; productToDelete = null; }}
/>



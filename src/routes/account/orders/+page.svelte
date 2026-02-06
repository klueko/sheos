<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { isAuthenticated } from '$lib/stores/auth';
  import Icon from '@iconify/svelte';

  let orders: any[] = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    if (!$isAuthenticated) {
      goto('/auth/login');
      return;
    }

    await loadOrders();
  });

  async function loadOrders() {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      if (response.ok) {
        orders = data.orders || [];
      } else {
        error = data.error || 'Erreur lors du chargement des commandes';
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      error = 'Erreur de connexion';
    } finally {
      loading = false;
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'PAID': return 'text-green-600 bg-green-100';
      case 'SHIPPED': return 'text-blue-600 bg-blue-100';
      case 'DELIVERED': return 'text-purple-600 bg-purple-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'PENDING': return 'En attente de paiement';
      case 'PAID': return 'Payé';
      case 'SHIPPED': return 'Expédié';
      case 'DELIVERED': return 'Livré';
      case 'CANCELLED': return 'Annulé';
      default: return status;
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'PENDING': return 'lucide:clock';
      case 'PAID': return 'lucide:check-circle';
      case 'SHIPPED': return 'lucide:truck';
      case 'DELIVERED': return 'lucide:package-check';
      case 'CANCELLED': return 'lucide:x-circle';
      default: return 'lucide:help-circle';
    }
  }
</script>

<svelte:head>
  <title>Mes commandes - Sheos</title>
</svelte:head>

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Mes commandes</h1>
    <p class="text-gray-600">Suivez l'état de vos commandes et retrouvez vos achats précédents.</p>
  </div>

  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  {:else if error}
    <div class="text-center py-12">
      <Icon icon="lucide:alert-circle" class="w-24 h-24 text-red-500 mx-auto mb-4" />
      <h2 class="text-2xl font-semibold text-gray-900 mb-4">Erreur</h2>
      <p class="text-gray-600 mb-6">{error}</p>
      <button
        on:click={loadOrders}
        class="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
      >
        Réessayer
      </button>
    </div>
  {:else if orders.length === 0}
    <div class="text-center py-12">
      <Icon icon="lucide:shopping-bag" class="w-24 h-24 text-gray-400 mx-auto mb-4" />
      <h2 class="text-2xl font-semibold text-gray-900 mb-4">Aucune commande</h2>
      <p class="text-gray-600 mb-6">Vous n'avez pas encore passé de commande.</p>
      <a 
        href="/products" 
        class="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
      >
        Découvrir nos produits
      </a>
    </div>
  {:else}
    <div class="space-y-6">
      {#each orders as order}
        <div class="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <!-- Order Header -->
          <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div class="flex items-center space-x-4">
                <Icon icon={getStatusIcon(order.status)} class="w-6 h-6 text-gray-600" />
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">
                    Commande #{order.orderNumber}
                  </h3>
                  <p class="text-sm text-gray-600">
                    Passée le {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
              <div class="flex items-center space-x-4 mt-4 sm:mt-0">
                <span class="px-3 py-1 rounded-full text-sm font-medium {getStatusColor(order.status)}">
                  {getStatusText(order.status)}
                </span>
                <span class="text-lg font-semibold text-gray-900">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          <!-- Order Details -->
          <div class="px-6 py-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Order Summary -->
              <div>
                <h4 class="font-medium text-gray-900 mb-2">Résumé</h4>
                <div class="space-y-1 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Sous-total:</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  {#if order.shipping > 0}
                    <div class="flex justify-between">
                      <span class="text-gray-600">Livraison:</span>
                      <span>{formatPrice(order.shipping)}</span>
                    </div>
                  {:else}
                    <div class="flex justify-between">
                      <span class="text-gray-600">Livraison:</span>
                      <span class="text-green-600">Gratuite</span>
                    </div>
                  {/if}
                  <div class="flex justify-between font-medium border-t pt-1">
                    <span>Total:</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              <!-- Order Timeline -->
              <div>
                <h4 class="font-medium text-gray-900 mb-2">État de la commande</h4>
                <div class="space-y-2">
                  <div class="flex items-center space-x-2 text-sm">
                    <Icon icon="lucide:check-circle" class="w-4 h-4 text-green-500" />
                    <span class="text-gray-600">Commande confirmée</span>
                  </div>
                  {#if order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED'}
                    <div class="flex items-center space-x-2 text-sm">
                      <Icon icon="lucide:check-circle" class="w-4 h-4 text-green-500" />
                      <span class="text-gray-600">Paiement reçu</span>
                    </div>
                  {/if}
                  {#if order.status === 'SHIPPED' || order.status === 'DELIVERED'}
                    <div class="flex items-center space-x-2 text-sm">
                      <Icon icon="lucide:check-circle" class="w-4 h-4 text-green-500" />
                      <span class="text-gray-600">Commande expédiée</span>
                    </div>
                  {/if}
                  {#if order.status === 'DELIVERED'}
                    <div class="flex items-center space-x-2 text-sm">
                      <Icon icon="lucide:check-circle" class="w-4 h-4 text-green-500" />
                      <span class="text-gray-600">Livrée</span>
                    </div>
                  {/if}
                </div>
              </div>

              <!-- Actions -->
              <div>
                <h4 class="font-medium text-gray-900 mb-2">Actions</h4>
                <div class="space-y-2">
                  <a 
                    href="/checkout/success?session_id=order_{order.id}"
                    class="block w-full text-center bg-gray-100 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm"
                  >
                    Voir les détails
                  </a>
                  {#if order.status === 'PAID' || order.status === 'SHIPPED'}
                    <button
                      class="block w-full text-center bg-blue-100 text-blue-900 px-4 py-2 rounded-md hover:bg-blue-200 transition-colors text-sm"
                      on:click={() => {
                        // In a real app, this would open tracking
                        alert('Fonctionnalité de suivi à venir');
                      }}
                    >
                      Suivre la livraison
                    </button>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

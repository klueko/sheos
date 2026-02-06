<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  export let params: { id: string };

  let order: any = null;
  let items: any[] = [];
  let billingAddress: any = null;
  let shippingAddress: any = null;
  let loading = true;
  let error = '';

  onMount(async () => {
    await loadOrderDetails();
  });

  async function loadOrderDetails() {
    loading = true;
    error = '';
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          error = 'Commande non trouvée';
        } else {
          error = 'Erreur lors du chargement de la commande';
        }
        return;
      }
      const data = await response.json();
      order = data.order;
      items = data.items || [];
      billingAddress = data.billingAddress;
      shippingAddress = data.shippingAddress;
    } catch (e) {
      console.error('Failed to load order:', e);
      error = 'Erreur de connexion';
    } finally {
      loading = false;
    }
  }

  async function updateStatus(newStatus: string) {
    if (!order) return;
    
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, status: newStatus })
      });

      if (response.ok) {
        await loadOrderDetails();
      } else {
        alert('Erreur lors de la mise à jour du statut');
      }
    } catch (e) {
      alert('Erreur de connexion');
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'SHIPPED': return 'bg-blue-100 text-blue-800';
      case 'DELIVERED': return 'bg-purple-100 text-purple-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusText(status: string) {
    const statusMap: Record<string, string> = {
      'PENDING': 'En attente',
      'PAID': 'Payé',
      'SHIPPED': 'Expédié',
      'DELIVERED': 'Livré',
      'CANCELLED': 'Annulé',
      'REFUNDED': 'Remboursé'
    };
    return statusMap[status] || status;
  }
</script>

<svelte:head>
  <title>Commande {order?.orderNumber || params.id} - Admin - Sheos</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <button
        on:click={() => goto('/admin/orders')}
        class="text-gray-600 hover:text-gray-900 mb-2 flex items-center"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Retour aux commandes
      </button>
      <h1 class="text-2xl font-bold text-gray-900">
        Commande {order?.orderNumber || '#' + params.id}
      </h1>
    </div>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  {:else if error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{error}</p>
    </div>
  {:else if order}
    <!-- Order Status and Info -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">Informations de la commande</h2>
          <p class="text-sm text-gray-500 mt-1">Créée le {formatDate(order.createdAt)}</p>
        </div>
        <div class="flex items-center space-x-4">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {getStatusColor(order.status)}">
            {getStatusText(order.status)}
          </span>
          <select
            value={order.status}
            on:change={(e) => updateStatus(e.target.value)}
            class="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <option value="PENDING">En attente</option>
            <option value="PAID">Payé</option>
            <option value="SHIPPED">Expédié</option>
            <option value="DELIVERED">Livré</option>
            <option value="CANCELLED">Annulé</option>
            <option value="REFUNDED">Remboursé</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Customer Info -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-3">Client</h3>
          <div class="space-y-1 text-sm">
            <p class="text-gray-900">
              <strong>{order.user?.firstName} {order.user?.lastName}</strong>
            </p>
            <p class="text-gray-600">{order.user?.email}</p>
            {#if order.user?.phone}
              <p class="text-gray-600">{order.user.phone}</p>
            {/if}
          </div>
        </div>

        <!-- Order Totals -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-3">Montant</h3>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Sous-total:</span>
              <span class="text-gray-900">{formatPrice(order.subtotal)}</span>
            </div>
            {#if order.tax > 0}
              <div class="flex justify-between">
                <span class="text-gray-600">Taxe:</span>
                <span class="text-gray-900">{formatPrice(order.tax)}</span>
              </div>
            {/if}
            {#if order.shipping > 0}
              <div class="flex justify-between">
                <span class="text-gray-600">Livraison:</span>
                <span class="text-gray-900">{formatPrice(order.shipping)}</span>
              </div>
            {/if}
            <div class="flex justify-between pt-2 border-t border-gray-200">
              <span class="font-semibold text-gray-900">Total:</span>
              <span class="font-bold text-lg text-gray-900">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Items -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Articles commandés</h2>
      {#if items.length > 0}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taille</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prix unitaire</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each items as item}
                <tr>
                  <td class="px-4 py-4">
                    <div class="flex items-center">
                      {#if item.image?.url}
                        <img
                          src={item.image.url}
                          alt={item.image.alt || item.product.name}
                          class="w-12 h-12 object-cover rounded mr-3"
                        />
                      {:else}
                        <div class="w-12 h-12 bg-gray-200 rounded mr-3 flex items-center justify-center">
                          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                      {/if}
                      <div>
                        <p class="text-sm font-medium text-gray-900">{item.product.name}</p>
                        <p class="text-xs text-gray-500">{item.brand.name}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-4 text-sm text-gray-900">
                    {item.variant.size}
                    {#if item.variant.color}
                      <span class="text-gray-500"> - {item.variant.color}</span>
                    {/if}
                  </td>
                  <td class="px-4 py-4 text-sm text-gray-900">{item.quantity}</td>
                  <td class="px-4 py-4 text-sm text-gray-900 text-right">{formatPrice(item.price)}</td>
                  <td class="px-4 py-4 text-sm font-medium text-gray-900 text-right">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <p class="text-gray-500 text-center py-4">Aucun article trouvé</p>
      {/if}
    </div>

    <!-- Addresses -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Shipping Address -->
      {#if shippingAddress}
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Adresse de livraison</h3>
          <div class="text-sm text-gray-600 space-y-1">
            <p class="font-medium text-gray-900">
              {shippingAddress.firstName} {shippingAddress.lastName}
            </p>
            {#if shippingAddress.company}
              <p>{shippingAddress.company}</p>
            {/if}
            <p>{shippingAddress.address1}</p>
            {#if shippingAddress.address2}
              <p>{shippingAddress.address2}</p>
            {/if}
            <p>
              {shippingAddress.postalCode} {shippingAddress.city}
            </p>
            {#if shippingAddress.state}
              <p>{shippingAddress.state}</p>
            {/if}
            <p>{shippingAddress.country}</p>
            {#if shippingAddress.phone}
              <p class="mt-2">Tél: {shippingAddress.phone}</p>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Billing Address -->
      {#if billingAddress}
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Adresse de facturation</h3>
          <div class="text-sm text-gray-600 space-y-1">
            <p class="font-medium text-gray-900">
              {billingAddress.firstName} {billingAddress.lastName}
            </p>
            {#if billingAddress.company}
              <p>{billingAddress.company}</p>
            {/if}
            <p>{billingAddress.address1}</p>
            {#if billingAddress.address2}
              <p>{billingAddress.address2}</p>
            {/if}
            <p>
              {billingAddress.postalCode} {billingAddress.city}
            </p>
            {#if billingAddress.state}
              <p>{billingAddress.state}</p>
            {/if}
            <p>{billingAddress.country}</p>
            {#if billingAddress.phone}
              <p class="mt-2">Tél: {billingAddress.phone}</p>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <!-- Notes -->
    {#if order.notes}
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
        <p class="text-sm text-gray-600 whitespace-pre-wrap">{order.notes}</p>
      </div>
    {/if}
  {/if}
</div>

<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  interface DataDeletionRequest {
    id: string;
    userId: string;
    userEmail: string;
    requestedAt: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    reason: string;
    adminNotes: string;
    processedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }

  let requests: DataDeletionRequest[] = [];
  let isLoading = true;
  let selectedRequest: DataDeletionRequest | null = null;
  let showModal = false;
  let statusFilter = 'all';
  let message = '';
  let messageType = '';

  onMount(() => {
    loadRequests();
  });

  async function loadRequests() {
    try {
      const response = await fetch('/api/admin/data-deletion-requests');
      if (response.ok) {
        requests = await response.json();
      } else {
        throw new Error('Erreur lors du chargement des demandes');
      }
    } catch (error) {
      message = 'Erreur lors du chargement des demandes';
      messageType = 'error';
    } finally {
      isLoading = false;
    }
  }

  function openModal(request: DataDeletionRequest) {
    selectedRequest = request;
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    selectedRequest = null;
  }

  async function updateRequestStatus(newStatus: string, notes: string = '') {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/admin/data-deletion-requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: notes
        })
      });

      if (response.ok) {
        message = 'Statut mis à jour avec succès';
        messageType = 'success';
        await loadRequests();
        closeModal();
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      message = 'Erreur lors de la mise à jour du statut';
      messageType = 'error';
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Rejetée';
      case 'completed': return 'Terminée';
      default: return status;
    }
  }

  const filteredRequests = requests.filter(request => {
    if (statusFilter === 'all') return true;
    return request.status === statusFilter;
  });
</script>

<svelte:head>
  <title>Demandes de suppression de données - Administration</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Demandes de suppression de données</h1>
      <p class="text-gray-600 mt-2">Gestion des demandes RGPD pour la suppression des données personnelles</p>
    </div>

    {#if message}
      <div class="mb-6 p-4 rounded-lg {messageType === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}">
        {message}
      </div>
    {/if}

    <!-- Filtres -->
    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <div class="flex flex-wrap gap-4 items-center">
        <label for="status-filter" class="font-medium text-gray-700">Filtrer par statut:</label>
        <select 
          id="status-filter"
          bind:value={statusFilter}
          class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvées</option>
          <option value="rejected">Rejetées</option>
          <option value="completed">Terminées</option>
        </select>
        
        <div class="ml-auto text-sm text-gray-600">
          {filteredRequests.length} demande{filteredRequests.length !== 1 ? 's' : ''} trouvée{filteredRequests.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>

    <!-- Liste des demandes -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      {#if isLoading}
        <div class="p-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-gray-600">Chargement des demandes...</p>
        </div>
      {:else if filteredRequests.length === 0}
        <div class="p-8 text-center text-gray-600">
          <p>Aucune demande trouvée.</p>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de demande
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Raison
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each filteredRequests as request}
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{request.userEmail}</div>
                      <div class="text-sm text-gray-500">ID: {request.userId}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(request.requestedAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(request.status)}">
                      {getStatusText(request.status)}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    {request.reason || 'Non spécifiée'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      on:click={() => openModal(request)}
                      class="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Voir détails
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Modal de détails -->
{#if showModal && selectedRequest}
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">Détails de la demande</h3>
          <button
            on:click={closeModal}
            class="text-gray-400 hover:text-gray-600"
            aria-label="Fermer la modal"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <div class="block text-sm font-medium text-gray-700">Utilisateur</div>
            <p class="mt-1 text-sm text-gray-900">{selectedRequest.userEmail}</p>
            <p class="text-xs text-gray-500">ID: {selectedRequest.userId}</p>
          </div>

          <div>
            <div class="block text-sm font-medium text-gray-700">Date de demande</div>
            <p class="mt-1 text-sm text-gray-900">{new Date(selectedRequest.requestedAt).toLocaleString('fr-FR')}</p>
          </div>

          <div>
            <div class="block text-sm font-medium text-gray-700">Statut actuel</div>
            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(selectedRequest.status)}">
              {getStatusText(selectedRequest.status)}
            </span>
          </div>

          <div>
            <div class="block text-sm font-medium text-gray-700">Raison</div>
            <p class="mt-1 text-sm text-gray-900">{selectedRequest.reason || 'Non spécifiée'}</p>
          </div>

          {#if selectedRequest.adminNotes}
            <div>
              <div class="block text-sm font-medium text-gray-700">Notes administrateur</div>
              <p class="mt-1 text-sm text-gray-900">{selectedRequest.adminNotes}</p>
            </div>
          {/if}

          {#if selectedRequest.processedAt}
            <div>
              <div class="block text-sm font-medium text-gray-700">Date de traitement</div>
              <p class="mt-1 text-sm text-gray-900">{new Date(selectedRequest.processedAt).toLocaleString('fr-FR')}</p>
            </div>
          {/if}
        </div>

        <!-- Actions -->
        {#if selectedRequest.status === 'pending'}
          <div class="mt-6 pt-4 border-t border-gray-200">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Actions disponibles</h4>
            <div class="flex space-x-3">
              <button
                on:click={() => updateRequestStatus('approved', 'Demande approuvée par l\'administrateur')}
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
              >
                Approuver
              </button>
              <button
                on:click={() => updateRequestStatus('rejected', 'Demande rejetée par l\'administrateur')}
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
              >
                Rejeter
              </button>
            </div>
          </div>
        {:else if selectedRequest.status === 'approved'}
          <div class="mt-6 pt-4 border-t border-gray-200">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Actions disponibles</h4>
            <div class="flex space-x-3">
              <button
                on:click={() => updateRequestStatus('completed', 'Suppression effectuée avec succès')}
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
              >
                Marquer comme terminée
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

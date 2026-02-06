<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let users: any[] = [];
  let loading = true;
  let pagination = { page: 1, limit: 20, total: 0, pages: 1 };
  let filters = {
    search: '',
    role: '',
    isActive: ''
  };

  let initialized = false;
  onMount(() => {
    if (!initialized) {
      initialized = true;
      const url = new URL($page.url);
      filters.search = url.searchParams.get('search') || '';
      filters.role = url.searchParams.get('role') || '';
      filters.isActive = url.searchParams.get('isActive') || '';
      pagination.page = parseInt(url.searchParams.get('page') || '1');
      pagination.limit = parseInt(url.searchParams.get('limit') || '20');
      loadUsers();
    }
  });

  let currentController: AbortController | null = null;
  let requestSeq = 0;
  async function loadUsers() {
    const seq = ++requestSeq;
    if (currentController) {
      currentController.abort();
    }
    currentController = new AbortController();
    loading = true;
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.role) params.set('role', filters.role);
      if (filters.isActive) params.set('isActive', filters.isActive);
      params.set('page', String(pagination.page));
      params.set('limit', String(pagination.limit));

      const res = await fetch(`/api/admin/users?${params.toString()}` , { signal: currentController.signal });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      // Only apply latest response
      if (seq === requestSeq) {
        users = data.users || [];
        pagination = data.pagination || pagination;
      }
    } catch (e) {
      if ((e as any)?.name !== 'AbortError') {
        console.error('Failed to load users', e);
      }
    } finally {
      if (seq === requestSeq) {
        loading = false;
      }
    }
  }

  let debounceTimer: any;
  function updateFilters(newFilters: any) {
    filters = { ...filters, ...newFilters };
    pagination.page = 1;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const url = new URL($page.url);
      Object.entries(filters).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, String(value));
        else url.searchParams.delete(key);
      });
      url.searchParams.set('page', String(pagination.page));
      url.searchParams.set('limit', String(pagination.limit));
      window.history.pushState({}, '', url.toString());
      loadUsers();
    }, 250);
  }

  function gotoPage(p: number) {
    if (p < 1 || p > pagination.pages) return;
    const url = new URL($page.url);
    url.searchParams.set('page', String(p));
    url.searchParams.set('limit', String(pagination.limit));
    window.history.pushState({}, '', url.toString());
    pagination.page = p;
    loadUsers();
  }

  function formatDate(date: string) {
    if (!date) return '-';
    return new Date(date).toLocaleString('fr-FR');
  }
</script>

<svelte:head>
  <title>Admin - Users</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Utilisateurs</h1>
      <p class="text-gray-600">Liste des utilisateurs et leurs actions</p>
    </div>
  </div>

  <div class="bg-white p-4 rounded-lg shadow border border-gray-200">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <input
        placeholder="Recherche (email, prénom, nom)"
        class="border rounded px-3 py-2 w-full"
        value={filters.search}
        on:input={(e: any) => updateFilters({ search: e.target.value })}
      />
      <select class="border rounded px-3 py-2 w-full" bind:value={filters.role} on:change={(e: any) => updateFilters({ role: e.target.value })}>
        <option value="">Tous les rôles</option>
        <option value="CUSTOMER">Customer</option>
        <option value="VENDEUR">Vendeur</option>
        <option value="STAFF">Staff</option>
        <option value="ADMIN">Admin</option>
      </select>
      <select class="border rounded px-3 py-2 w-full" bind:value={filters.isActive} on:change={(e: any) => updateFilters({ isActive: e.target.value })}>
        <option value="">Tous les statuts</option>
        <option value="true">Actif</option>
        <option value="false">Inactif</option>
      </select>
      <div class="flex items-center">
        <label class="mr-2 text-sm text-gray-600">Par page</label>
        <select class="border rounded px-3 py-2" bind:value={pagination.limit} on:change={() => updateFilters({})}>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
    {#if loading}
      <div class="p-6 text-gray-600">Chargement...</div>
    {:else if users.length === 0}
      <div class="p-6 text-gray-600">Aucun utilisateur trouvé.</div>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commandes</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresses</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière commande</th>
              <th class="px-4 py-3" />
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each users as u}
              <tr>
                <td class="px-4 py-3">
                  <div class="text-sm font-medium text-gray-900">{u.firstName || '-'} {u.lastName || ''}</div>
                  <div class="text-sm text-gray-500">{u.email}</div>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">{u.role}</span>
                </td>
                <td class="px-4 py-3">
                  {#if u.isActive}
                    <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Actif</span>
                  {:else}
                    <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">Inactif</span>
                  {/if}
                </td>
                <td class="px-4 py-3">
                  {u.activity?.ordersCount ?? 0}
                </td>
                <td class="px-4 py-3">
                  {u.activity?.addressesCount ?? 0}
                </td>
                <td class="px-4 py-3">
                  {formatDate(u.activity?.lastOrderAt)}
                </td>
                <td class="px-4 py-3 text-right space-x-3">
                  <button
                    class="text-sm {u.isActive ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}"
                    on:click={async () => {
                      const action = u.isActive ? 'suspendre' : 'réactiver';
                      if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} l'utilisateur ${u.email} ?`)) return;
                      try {
                        const res = await fetch(`/api/admin/users/${u.id}`, { 
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ isActive: !u.isActive })
                        });
                        if (res.ok) {
                          const data = await res.json();
                          loadUsers();
                        } else {
                          const data = await res.json();
                          alert(data.error || 'Action impossible');
                        }
                      } catch (e) {
                        alert('Erreur réseau');
                      }
                    }}
                  >
                    {u.isActive ? 'Suspendre' : 'Réactiver'}
                  </button>
                  <button
                    class="text-red-600 hover:text-red-800 text-sm"
                    on:click={async () => {
                      if (!confirm(`Supprimer l'utilisateur ${u.email} ?`)) return;
                      try {
                        const res = await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' });
                        if (res.ok) {
                          loadUsers();
                        } else {
                          const data = await res.json();
                          alert(data.error || 'Suppression impossible');
                        }
                      } catch (e) {
                        alert('Erreur réseau');
                      }
                    }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
        <div class="text-sm text-gray-700">
          Page {pagination.page} sur {pagination.pages} — {pagination.total} utilisateurs
        </div>
        <div class="space-x-2">
          <button class="px-3 py-2 border rounded disabled:opacity-50" on:click={() => gotoPage(pagination.page - 1)} disabled={pagination.page <= 1}>Précédent</button>
          <button class="px-3 py-2 border rounded disabled:opacity-50" on:click={() => gotoPage(pagination.page + 1)} disabled={pagination.page >= pagination.pages}>Suivant</button>
        </div>
      </div>
    {/if}
  </div>
</div>



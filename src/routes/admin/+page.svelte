<script lang="ts">
  import { onMount } from 'svelte';
  import { requireAdmin } from '$lib/middleware/admin';
  import GDPRStats from '$lib/components/GDPRStats.svelte';

  let stats = {
    customers: 0,
    vendors: 0,
    admins: 0,
    inactiveUsers: 0
  };
  let loading = true;

  onMount(async () => {
    await loadDashboardData();
    loading = false;
  });

  async function loadDashboardData() {
    try {
      // Load users statistics (customers, vendors, admins, inactive)
      const statsResponse = await fetch('/api/admin/users/stats');
      const statsData = await statsResponse.json();
      stats = statsData.stats || stats;
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  }

  
</script>

<svelte:head>
  <title>Admin Dashboard - Sheos</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-gray-900">Dashboard administrateur</h1>
  </div>

  {#if loading}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each Array(4) as _}
        <div class="bg-white rounded-lg shadow p-6 animate-pulse">
          <div class="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div class="h-8 bg-gray-300 rounded w-3/4"></div>
        </div>
      {/each}
    </div>
  {:else}
    <!-- Stats Cards: focus on accounts management -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Clients</p>
            <p class="text-2xl font-semibold text-gray-900">{stats.customers}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V7a2 2 0 00-2-2h-4M4 13V7a2 2 0 012-2h4"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Vendeurs</p>
            <p class="text-2xl font-semibold text-gray-900">{stats.vendors}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8a4 4 0 110 8 4 4 0 010-8z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Admins</p>
            <p class="text-2xl font-semibold text-gray-900">{stats.admins}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Comptes inactifs</p>
            <p class="text-2xl font-semibold text-gray-900">{stats.inactiveUsers}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- GDPR Statistics (optional) -->
    <GDPRStats />
  {/if}
</div>

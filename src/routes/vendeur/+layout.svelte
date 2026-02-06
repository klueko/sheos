<script lang="ts">
  import { onMount } from 'svelte';
  
  let user: any = null;
  
  onMount(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        user = await res.json();
      }
    } catch (e) {
      console.error('Error fetching user:', e);
    }
  });
</script>

<div class="min-h-screen bg-gray-50">
  <!-- Top bar -->
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="flex items-center justify-between h-16 px-6">
      <div class="flex items-center space-x-6">
        <h1 class="text-xl font-bold text-gray-900">Dashboard Vendeur</h1>
        <nav class="flex space-x-4">
          <a href="/vendeur" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
          <a href="/vendeur/nouveau" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Nouveau produit</a>
        </nav>
      </div>
      
      <div class="flex items-center space-x-4">
        {#if user}
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style="background-color: #0C766C">
              {user.name?.charAt(0) || 'V'}
            </div>
            <span class="text-sm text-gray-700">{user.name || 'Vendeur'}</span>
          </div>
        {/if}
        <a href="/" class="text-gray-600 hover:text-gray-900 text-sm">
          ← Retour au site
        </a>
        <a href="/auth/logout" class="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md">
          Déconnexion
        </a>
      </div>
    </div>
  </header>
  
  <!-- Page content -->
  <main class="p-6">
    <slot />
  </main>
</div>

<style>
  :global(.page-transition) {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>

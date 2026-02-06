<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  async function doLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    goto('/');
  }

  onMount(() => {
    doLogout();
  });
</script>

<div class="min-h-screen flex items-center justify-center">
  <div class="text-center space-y-4">
    <p>Déconnexion en cours…</p>
    <button on:click={doLogout} class="px-4 py-2 rounded bg-gray-800 text-white">Se déconnecter</button>
  </div>
</div>



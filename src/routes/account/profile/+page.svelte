<script lang="ts">
  export let data: { user: { id: string; email: string; role: string } | null };
</script>

<div class="p-6 max-w-2xl mx-auto space-y-6">
  <h1 class="text-2xl font-semibold">Profil</h1>

  {#if data.user}
    <div class="rounded border p-4 space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600">Identifiant</span>
        <span class="font-mono text-sm">{data.user.id}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600">E-mail</span>
        <span>{data.user.email}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600">Rôle</span>
        <span>{data.user.role}</span>
      </div>
    </div>

    <a href="/auth/logout" class="inline-flex px-4 py-2 rounded bg-gray-800 text-white">Se déconnecter</a>
  {:else}
    <p>Vous devez être connecté pour voir votre profil.</p>
    <a href="/auth/login" class="inline-flex px-4 py-2 rounded bg-gray-800 text-white mt-2">Se connecter</a>
  {/if}
</div>



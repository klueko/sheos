<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { isAuthenticated, user } from '$lib/stores/auth';
  import Icon from '@iconify/svelte';

  let userData: any = null;
  let loading = true;

  onMount(async () => {
    if (!$isAuthenticated) {
      goto('/auth/login');
      return;
    }

    userData = $user;
    loading = false;
  });
</script>

<svelte:head>
  <title>Mon compte - Sheos</title>
</svelte:head>

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  {:else if userData}
    <!-- Welcome Section -->
    <div class="bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg p-6 text-white mb-8">
      <h1 class="text-3xl font-bold mb-2">Bienvenue, {userData.firstName} !</h1>
      <p class="text-gray-300">Gérez votre compte et vos commandes</p>
    </div>

    <!-- Account Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Orders Card -->
      <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div class="flex items-center">
          <div class="p-3 bg-blue-100 rounded-lg">
            <Icon icon="lucide:shopping-bag" class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">Mes commandes</h3>
            <p class="text-sm text-gray-600">Suivez vos achats</p>
          </div>
        </div>
        <div class="mt-4">
          <a 
            href="/account/orders"
            class="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
          >
            Voir toutes les commandes
            <Icon icon="lucide:arrow-right" class="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>

      <!-- Addresses Card -->
      <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div class="flex items-center">
          <div class="p-3 bg-green-100 rounded-lg">
            <Icon icon="lucide:map-pin" class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">Mes adresses</h3>
            <p class="text-sm text-gray-600">Gérez vos adresses</p>
          </div>
        </div>
        <div class="mt-4">
          <button 
            class="text-green-600 hover:text-green-800 font-medium text-sm flex items-center"
            on:click={() => alert('Fonctionnalité à venir')}
          >
            Gérer les adresses
            <Icon icon="lucide:arrow-right" class="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      <!-- Favorites Card -->
      <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div class="flex items-center">
          <div class="p-3 bg-red-100 rounded-lg">
            <Icon icon="lucide:heart" class="w-6 h-6 text-red-600" />
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">Favoris</h3>
            <p class="text-sm text-gray-600">Produits aimés</p>
          </div>
        </div>
        <div class="mt-4">
          <button 
            class="text-red-600 hover:text-red-800 font-medium text-sm flex items-center"
            on:click={() => alert('Fonctionnalité à venir')}
          >
            Voir mes favoris
            <Icon icon="lucide:arrow-right" class="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      <!-- Profile Card -->
      <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div class="flex items-center">
          <div class="p-3 bg-purple-100 rounded-lg">
            <Icon icon="lucide:user" class="w-6 h-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-900">Mon profil</h3>
            <p class="text-sm text-gray-600">Informations personnelles</p>
          </div>
        </div>
        <div class="mt-4">
          <button 
            class="text-purple-600 hover:text-purple-800 font-medium text-sm flex items-center"
            on:click={() => alert('Fonctionnalité à venir')}
          >
            Modifier le profil
            <Icon icon="lucide:arrow-right" class="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>

    <!-- Account Information -->
    <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900 mb-6">Informations du compte</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="font-medium text-gray-900 mb-3">Informations personnelles</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Nom:</span>
              <span class="font-medium">{userData.firstName} {userData.lastName}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Email:</span>
              <span class="font-medium">{userData.email}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Membre depuis:</span>
              <span class="font-medium">
                {new Date(userData.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 class="font-medium text-gray-900 mb-3">Actions rapides</h3>
          <div class="space-y-2">
            <button 
              class="w-full text-left bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors text-sm"
              on:click={() => alert('Fonctionnalité à venir')}
            >
              Changer le mot de passe
            </button>
            <button 
              class="w-full text-left bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors text-sm"
              on:click={() => alert('Fonctionnalité à venir')}
            >
              Modifier les préférences
            </button>
            <button 
              class="w-full text-left bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md transition-colors text-sm"
              on:click={() => {
                if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                  // In a real app, this would call a logout API
                  window.location.href = '/auth/login';
                }
              }}
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200 mt-8">
      <h2 class="text-xl font-semibold text-gray-900 mb-6">Activité récente</h2>
      
      <div class="text-center py-8">
        <Icon icon="lucide:activity" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600">Aucune activité récente</p>
        <p class="text-sm text-gray-500">Vos dernières commandes et actions apparaîtront ici</p>
      </div>
    </div>
  {/if}
</div>
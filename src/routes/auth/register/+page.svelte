<script lang="ts">
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/auth';

  let email = '';
  let password = '';
  let confirmPassword = '';
  let firstName = '';
  let lastName = '';
  let phone = '';
  let loading = false;
  let error = '';
  let role: 'CLIENT' | 'VENDEUR' | 'ADMIN' = 'CLIENT';

  async function handleRegister(event: Event) {
    event.preventDefault();
    loading = true;
    error = '';

    if (password !== confirmPassword) {
      error = 'Passwords do not match';
      loading = false;
      return;
    }

    if (password.length < 8) {
      error = 'Password must be at least 8 characters long';
      loading = false;
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email, 
          password, 
          firstName, 
          lastName, 
          phone,
          role // Note: le backend enregistre comme CLIENT par défaut
        })
      });

      const data = await response.json();

      if (response.ok) {
        user.set(data.user);
        goto('/');
      } else {
        error = data.error || 'Registration failed';
      }
    } catch (err) {
      error = 'Network error. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Inscription - Sheos</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Créer un compte</h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Ou
        <a href="/auth/login" class="font-medium text-gray-800 hover:text-gray-600">
          se connecter à un compte
        </a>
      </p>
    </div>
    
    <form class="mt-8 space-y-6" on:submit={handleRegister}>
      <div class="space-y-4">
        <fieldset class="border-0 p-0 m-0">
          <legend class="block text-sm font-medium text-gray-700 mb-2">Rôle (optionnel)</legend>
          <div class="space-y-2">
            <label class="flex items-center gap-2">
              <input type="radio" name="role" value="CLIENT" bind:group={role} checked class="border-gray-300" />
              <span>Client</span>
            </label>
            <label class="flex items-center gap-2">
              <input type="radio" name="role" value="VENDEUR" bind:group={role} class="border-gray-300" />
              <span>Vendeur</span>
            </label>
            <label class="flex items-center gap-2">
              <input type="radio" name="role" value="ADMIN" bind:group={role} class="border-gray-300" />
              <span>Admin</span>
            </label>
          </div>
          <p class="mt-1 text-xs text-gray-500">Les rôles Vendeur/Admin peuvent nécessiter une validation interne.</p>
        </fieldset>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700">Prénom</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              bind:value={firstName}
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
              placeholder="Prénom"
            />
          </div>
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700">Nom</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              bind:value={lastName}
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
              placeholder="Nom"
            />
          </div>
        </div>
        
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Adresse e-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            bind:value={email}
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
            placeholder="Adresse e-mail"
          />
        </div>
        
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700">Téléphone (optionnel)</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            bind:value={phone}
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
            placeholder="Numéro de téléphone"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            bind:value={password}
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
            placeholder="Mot de passe (min 8 caractères)"
          />
        </div>
        
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            bind:value={confirmPassword}
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
            placeholder="Confirmez le mot de passe"
          />
        </div>
      </div>

      {#if error}
        <div class="rounded-md bg-red-50 p-4">
          <div class="text-sm text-red-700">{error}</div>
        </div>
      {/if}

      <div>
        <button
          type="submit"
          disabled={loading}
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Création du compte…' : 'Créer le compte'}
        </button>
      </div>
    </form>
  </div>
</div>

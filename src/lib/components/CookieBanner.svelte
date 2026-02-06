<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  interface CookiePreferences {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
  }

  let showBanner = false;
  let showPreferences = false;
  let preferences: CookiePreferences = {
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    functional: false
  };

  onMount(() => {
    if (browser) {
      const consent = localStorage.getItem('cookie-consent');
      if (!consent) {
        showBanner = true;
      } else {
        preferences = JSON.parse(consent);
      }
    }
  });

  function acceptAll() {
    preferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    savePreferences();
  }

  function acceptNecessary() {
    preferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    savePreferences();
  }

  function saveCustomPreferences() {
    preferences.necessary = true; // Always true
    savePreferences();
  }

  function savePreferences() {
    if (browser) {
      localStorage.setItem('cookie-consent', JSON.stringify(preferences));
      localStorage.setItem('cookie-consent-date', new Date().toISOString());
      
      // Dispatch custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('cookiePreferencesChanged', {
        detail: preferences
      }));
      
      showBanner = false;
      showPreferences = false;
    }
  }

  function openPreferences() {
    showPreferences = true;
  }

  // Écouter les événements pour ouvrir les préférences depuis d'autres composants
  onMount(() => {
    if (browser) {
      const handleShowPreferences = () => {
        showPreferences = true;
      };
      
      window.addEventListener('showCookiePreferences', handleShowPreferences);
      
      return () => {
        window.removeEventListener('showCookiePreferences', handleShowPreferences);
      };
    }
  });

  function closePreferences() {
    showPreferences = false;
  }
</script>

{#if showBanner}
  <!-- Cookie Banner -->
  <div class="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="flex-1">
          <h3 class="font-semibold text-lg mb-2">🍪 Gestion des cookies</h3>
          <p class="text-sm text-gray-300">
            Nous utilisons des cookies pour améliorer votre expérience sur notre site, 
            analyser le trafic et personnaliser le contenu. Vous pouvez gérer vos préférences 
            à tout moment.
          </p>
          <button 
            on:click={openPreferences}
            class="text-blue-400 hover:text-blue-300 underline text-sm mt-2"
          >
            Gérer mes préférences
          </button>
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
          <button
            on:click={acceptNecessary}
            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
          >
            Accepter le nécessaire
          </button>
          <button
            on:click={acceptAll}
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
          >
            Accepter tout
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if showPreferences}
  <!-- Cookie Preferences Modal -->
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Préférences des cookies</h2>
          <button
            on:click={closePreferences}
            class="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div class="space-y-6">
          <!-- Necessary Cookies -->
          <div class="border rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold text-gray-900">Cookies nécessaires</h3>
              <div class="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.necessary}
                  disabled
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-600">Toujours actifs</span>
              </div>
            </div>
            <p class="text-sm text-gray-600">
              Ces cookies sont essentiels au fonctionnement du site web et ne peuvent pas être désactivés.
              Ils incluent les cookies de session, de sécurité et de préférences de base.
            </p>
          </div>

          <!-- Functional Cookies -->
          <div class="border rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold text-gray-900">Cookies fonctionnels</h3>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  bind:checked={preferences.functional}
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p class="text-sm text-gray-600">
              Ces cookies permettent d'améliorer les fonctionnalités du site, comme la sauvegarde de vos préférences
              et l'amélioration de l'expérience utilisateur.
            </p>
          </div>

          <!-- Analytics Cookies -->
          <div class="border rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold text-gray-900">Cookies d'analyse</h3>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  bind:checked={preferences.analytics}
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p class="text-sm text-gray-600">
              Ces cookies nous aident à comprendre comment les visiteurs interagissent avec notre site web
              en collectant et en rapportant des informations de manière anonyme.
            </p>
          </div>

          <!-- Marketing Cookies -->
          <div class="border rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold text-gray-900">Cookies marketing</h3>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  bind:checked={preferences.marketing}
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p class="text-sm text-gray-600">
              Ces cookies sont utilisés pour diffuser des publicités plus pertinentes pour vous et vos intérêts.
              Ils peuvent également être utilisés pour limiter le nombre de fois que vous voyez une publicité.
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            on:click={acceptNecessary}
            class="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
          >
            Accepter le nécessaire uniquement
          </button>
          <button
            on:click={acceptAll}
            class="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
          >
            Accepter tout
          </button>
          <button
            on:click={saveCustomPreferences}
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex-1"
          >
            Sauvegarder mes préférences
          </button>
        </div>

        <p class="text-xs text-gray-500 mt-4">
          Vous pouvez modifier vos préférences de cookies à tout moment en cliquant sur le lien 
          "Gestion des cookies" dans le pied de page.
        </p>
      </div>
    </div>
  </div>
{/if}

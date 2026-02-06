<script lang="ts">
  import { onMount } from 'svelte';
  let brands: any[] = [];
  let categories: any[] = [];
  let name = '';
  let slug = '';
  let brandName: string = '';
  let price: number | null = null;
  let description = '';
  let categoryIds: number[] = [];
  let categoryChoice: 'FEMME' | 'HOMME' | 'ENFANT' | '' = '';
  let imageUrl: string = '';
  let imageFile: File | null = null;
  let error = '';
  let loading = false;

  async function fetchMeta() {
    const [brandsRes, catsRes] = await Promise.all([
      fetch('/api/brands'),
      fetch('/api/categories')
    ]);
    brands = (await brandsRes.json()).brands || [];
    categories = (await catsRes.json()).categories || [];
  }

  function handleFileChange(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    imageFile = input.files?.[0] || null;
  }

  // Auto-generate slug from name
  function generateSlug() {
    if (name && !slug) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }
  }

  async function submit() {
    error = '';
    loading = true;
    
    if (!name || !slug || !brandName || !price) {
      error = 'Veuillez remplir tous les champs obligatoires';
      loading = false;
      return;
    }

    // Map radio choice to categoryIds by label if categories list includes them
    if (categoryChoice && categories.length) {
      const map: Record<string, string> = { FEMME: 'femmes', HOMME: 'hommes', ENFANT: 'enfants' };
      const wanted = map[categoryChoice];
      const cat = categories.find((c: any) => (c.slug || c.name)?.toLowerCase().includes(wanted));
      categoryIds = cat ? [cat.id] : [];
    }

    const formData = new FormData();
    formData.append('product', JSON.stringify({ 
      name, 
      slug, 
      brandName, 
      price, 
      description 
    }));
    formData.append('variants', JSON.stringify([])); // No variants for now
    formData.append('categoryIds', JSON.stringify(categoryIds));
    
    if (imageUrl) {
      formData.append('imageUrl', imageUrl);
    }
    if (imageFile) {
      formData.append('imageFile', imageFile);
    }

    try {
      const res = await fetch('/api/vendeur/products', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        window.location.href = '/vendeur';
      } else {
        const data = await res.json();
        error = data.error || 'Erreur lors de la création du produit';
      }
    } catch (e) {
      error = 'Erreur de connexion. Veuillez réessayer.';
    } finally {
      loading = false;
    }
  }

  onMount(fetchMeta);
</script>

<div class="page-transition">
  <!-- Header -->
  <div class="mb-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Nouveau produit</h1>
        <p class="text-gray-600 mt-1">Ajoutez un nouveau produit à votre catalogue</p>
      </div>
      <a href="/vendeur" class="inline-flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Retour
      </a>
    </div>
  </div>

  <!-- Error Message -->
  {#if error}
    <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex">
        <svg class="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h3 class="text-sm font-medium text-red-800">Erreur</h3>
          <p class="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Form -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-lg font-semibold text-gray-900">Informations du produit</h2>
      <p class="text-sm text-gray-600 mt-1">Renseignez les détails de votre produit</p>
    </div>
    
    <form on:submit|preventDefault={submit} class="p-6 space-y-6">
      <!-- Basic Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
            Nom du produit <span class="text-red-500">*</span>
          </label>
          <input 
            id="name" 
            class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" 
            placeholder="Ex: Chaussures Nike Air Max"
            bind:value={name}
            on:input={generateSlug}
            required
          />
        </div>
        <div>
          <label for="slug" class="block text-sm font-medium text-gray-700 mb-2">
            Slug URL <span class="text-red-500">*</span>
          </label>
          <input 
            id="slug" 
            class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" 
            placeholder="Ex: chaussures-nike-air-max"
            bind:value={slug}
            required
          />
          <p class="text-xs text-gray-500 mt-1">URL-friendly version du nom (généré automatiquement)</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="brandName" class="block text-sm font-medium text-gray-700 mb-2">
            Marque <span class="text-red-500">*</span>
          </label>
          <input 
            id="brandName" 
            class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" 
            placeholder="Ex: Nike, Adidas, Puma..."
            bind:value={brandName}
            required
          />
        </div>
        <div>
          <label for="price" class="block text-sm font-medium text-gray-700 mb-2">
            Prix (€) <span class="text-red-500">*</span>
          </label>
          <input 
            id="price" 
            class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" 
            type="number" 
            min="0" 
            step="0.01" 
            placeholder="0.00"
            bind:value={price}
            required
          />
        </div>
      </div>

      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea 
          id="description" 
              class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          rows="4" 
          placeholder="Décrivez votre produit..."
          bind:value={description}
        ></textarea>
      </div>

      <!-- Category Selection -->
      <div>
        <fieldset class="border-0 p-0 m-0">
          <legend class="block text-sm font-medium text-gray-700 mb-3">Catégorie</legend>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label class="relative flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors {categoryChoice === 'FEMME' ? '' : ''}" style={categoryChoice === 'FEMME' ? 'border-color: #0C766C; background-color: #E6F7F5' : ''}>
              <input 
                type="radio" 
                name="cat" 
                value="FEMME" 
                bind:group={categoryChoice}
                class="sr-only"
              />
              <div class="flex items-center">
                <div class="w-4 h-4 border-2 rounded-full mr-3 {categoryChoice === 'FEMME' ? '' : 'border-gray-300'}" style={categoryChoice === 'FEMME' ? 'border-color: #0C766C; background-color: #0C766C' : ''}>
                  {#if categoryChoice === 'FEMME'}
                    <div class="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                  {/if}
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-900">Femme</span>
                  <p class="text-xs text-gray-500">Chaussures pour femmes</p>
                </div>
              </div>
            </label>
            
            <label class="relative flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors {categoryChoice === 'HOMME' ? '' : ''}" style={categoryChoice === 'HOMME' ? 'border-color: #0C766C; background-color: #E6F7F5' : ''}>
              <input 
                type="radio" 
                name="cat" 
                value="HOMME" 
                bind:group={categoryChoice}
                class="sr-only"
              />
              <div class="flex items-center">
                <div class="w-4 h-4 border-2 rounded-full mr-3 {categoryChoice === 'HOMME' ? '' : 'border-gray-300'}" style={categoryChoice === 'HOMME' ? 'border-color: #0C766C; background-color: #0C766C' : ''}>
                  {#if categoryChoice === 'HOMME'}
                    <div class="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                  {/if}
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-900">Homme</span>
                  <p class="text-xs text-gray-500">Chaussures pour hommes</p>
                </div>
              </div>
            </label>
            
            <label class="relative flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors {categoryChoice === 'ENFANT' ? '' : ''}" style={categoryChoice === 'ENFANT' ? 'border-color: #0C766C; background-color: #E6F7F5' : ''}>
              <input 
                type="radio" 
                name="cat" 
                value="ENFANT" 
                bind:group={categoryChoice}
                class="sr-only"
              />
              <div class="flex items-center">
                <div class="w-4 h-4 border-2 rounded-full mr-3 {categoryChoice === 'ENFANT' ? '' : 'border-gray-300'}" style={categoryChoice === 'ENFANT' ? 'border-color: #0C766C; background-color: #0C766C' : ''}>
                  {#if categoryChoice === 'ENFANT'}
                    <div class="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                  {/if}
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-900">Enfant</span>
                  <p class="text-xs text-gray-500">Chaussures pour enfants</p>
                </div>
              </div>
            </label>
          </div>
        </fieldset>
      </div>

      <!-- Image Upload -->
      <div class="border-t border-gray-200 pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Image du produit</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="imageUrl" class="block text-sm font-medium text-gray-700 mb-2">URL de l'image</label>
            <input 
              id="imageUrl" 
              class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" 
              placeholder="https://example.com/image.jpg"
              bind:value={imageUrl}
            />
            <p class="text-xs text-gray-500 mt-1">Lien direct vers l'image</p>
          </div>
          <div>
            <label for="imageFile" class="block text-sm font-medium text-gray-700 mb-2">Ou télécharger un fichier</label>
            <div class="relative">
              <input 
                id="imageFile" 
                class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                type="file" 
                accept="image/*" 
                on:change={handleFileChange}
              />
              {#if imageFile}
                <div class="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div class="flex items-center">
                    <svg class="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span class="text-sm text-green-700">Fichier sélectionné: {imageFile.name}</span>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Buttons -->
      <div class="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
        <a 
          href="/vendeur" 
          class="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Annuler
        </a>
        <button 
          type="submit" 
          class="inline-flex items-center px-6 py-3 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style="background-color: #0C766C"
          disabled={loading}
          on:mouseover={(e) => !loading && (e.currentTarget.style.backgroundColor = '#0A5D54')}
          on:mouseout={(e) => !loading && (e.currentTarget.style.backgroundColor = '#0C766C')}
        >
          {#if loading}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Création en cours...
          {:else}
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Créer le produit
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>



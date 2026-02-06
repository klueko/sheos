<script lang="ts">
  import { onMount } from 'svelte';
  export let params: { id: string };
  let brands: any[] = [];
  let categories: any[] = [];
  let productId = Number(params.id);
  let product: any = null;
  let variants: any[] = [];
  let images: any[] = [];
  let categoryIds: number[] = [];
  let customerStats: any[] = [];
  let error = '';

  async function fetchMeta() {
    const [brandsRes, catsRes] = await Promise.all([
      fetch('/api/brands'),
      fetch('/api/categories')
    ]);
    brands = (await brandsRes.json()).brands || [];
    categories = (await catsRes.json()).categories || [];
  }

  async function load() {
    const res = await fetch(`/api/vendeur/products/${productId}`);
    if (!res.ok) return;
    const data = await res.json();
    product = data.product;
    variants = data.variants || [];
    images = data.images || [];
    categoryIds = data.categoryIds || [];
    customerStats = data.customerStats || [];
  }

  async function save() {
    error = '';
    if (!product?.name || !product?.slug || !product?.brandId || !product?.price) {
      error = 'Champs requis manquants';
      return;
    }
    const res = await fetch('/api/vendeur/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        product,
        variants,
        images,
        categoryIds
      })
    });
    if (res.ok) {
      window.location.href = '/vendeur';
    } else {
      const data = await res.json();
      error = data.error || 'Erreur lors de la mise à jour';
    }
  }

  onMount(async () => { await Promise.all([fetchMeta(), load()]); });
</script>

<div class="p-6 space-y-6">
  <h1 class="text-2xl font-semibold">Modifier le produit</h1>

  {#if error}
    <div class="text-red-600 text-sm">{error}</div>
  {/if}

  {#if product}
    <div class="space-y-4 max-w-3xl">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="name" class="block text-sm">Nom</label>
          <input id="name" class="border px-3 py-2 rounded w-full" bind:value={product.name} />
        </div>
        <div>
          <label for="slug" class="block text-sm">Slug</label>
          <input id="slug" class="border px-3 py-2 rounded w-full" bind:value={product.slug} />
        </div>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label for="brand" class="block text-sm">Marque</label>
          <select id="brand" class="border px-3 py-2 rounded w-full" bind:value={product.brandId}>
            {#each brands as b}
              <option value={b.id}>{b.name}</option>
            {/each}
          </select>
        </div>
        <div>
          <label for="price" class="block text-sm">Prix (€)</label>
          <input id="price" class="border px-3 py-2 rounded w-full" type="number" min="0" step="0.01" bind:value={product.price} />
        </div>
      </div>
      <div>
        <label for="description" class="block text-sm">Description</label>
        <textarea id="description" class="border px-3 py-2 rounded w-full" rows="4" bind:value={product.description}></textarea>
      </div>

      <div>
        <fieldset class="border-0 p-0 m-0">
        <div class="flex flex-wrap gap-2">
          {#each categories as c}
            <label class="inline-flex items-center gap-2 border px-2 py-1 rounded" for={`cat-${c.id}`}>
              <input id={`cat-${c.id}`} type="checkbox" value={c.id} checked={categoryIds.includes(c.id)} on:change={(e: any) => {
                const id = Number(e.currentTarget.value);
                categoryIds = e.currentTarget.checked ? [...categoryIds, id] : categoryIds.filter((x) => x !== id);
              }} />
              <span>{c.name}</span>
            </label>
          {/each}
        </div>
        </fieldset>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <h2 class="font-medium">Variantes (remplace)</h2>
          <button class="px-2 py-1 rounded border" on:click={() => variants = [...variants, { size: 40, stock: 0 }]} type="button">Ajouter</button>
        </div>
        {#each variants as v, i}
          <div class="grid grid-cols-5 gap-2 items-end">
            <div>
              <label for={`size-${i}`} class="block text-sm">Taille (EU)</label>
              <input id={`size-${i}`} class="border px-2 py-1 rounded w-full" type="number" bind:value={v.size} />
            </div>
            <div>
              <label for={`color-${i}`} class="block text-sm">Couleur</label>
              <input id={`color-${i}`} class="border px-2 py-1 rounded w-full" bind:value={v.color} />
            </div>
            <div>
              <label for={`sku-${i}`} class="block text-sm">SKU</label>
              <input id={`sku-${i}`} class="border px-2 py-1 rounded w-full" bind:value={v.sku} />
            </div>
            <div>
              <label for={`stock-${i}`} class="block text-sm">Stock</label>
              <input id={`stock-${i}`} class="border px-2 py-1 rounded w-full" type="number" min="0" bind:value={v.stock} />
            </div>
            <div class="flex gap-2">
              <button class="px-2 py-1 rounded border" type="button" on:click={() => variants = variants.filter((_, idx) => idx !== i)}>Supprimer</button>
            </div>
          </div>
        {/each}
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <h2 class="font-medium">Images (remplace)</h2>
          <button class="px-2 py-1 rounded border" on:click={() => images = [...images, { url: '' }]} type="button">Ajouter</button>
        </div>
        {#each images as img, i}
          <div class="grid grid-cols-3 gap-2 items-end">
            <div>
              <label for={`img-url-${i}`} class="block text-sm">URL</label>
              <input id={`img-url-${i}`} class="border px-2 py-1 rounded w-full" bind:value={img.url} />
            </div>
            <div>
              <label for={`img-alt-${i}`} class="block text-sm">Alt</label>
              <input id={`img-alt-${i}`} class="border px-2 py-1 rounded w-full" bind:value={img.alt} />
            </div>
            <div class="flex gap-2">
              <label class="inline-flex items-center gap-2">
                <input type="checkbox" bind:checked={img.isPrimary} /> Principal
              </label>
              <button class="px-2 py-1 rounded border" type="button" on:click={() => images = images.filter((_, idx) => idx !== i)}>Supprimer</button>
            </div>
          </div>
        {/each}
      </div>

      <div>
        <button class="px-4 py-2 rounded bg-gray-800 text-white" on:click={save} type="button">Enregistrer</button>
        <a class="ml-2 px-4 py-2 rounded border" href="/vendeur">Annuler</a>
      </div>

      <!-- Statistiques clients pour ce produit -->
      <div class="mt-10 border-t pt-6">
        <h2 class="text-xl font-semibold mb-4">Statistiques clients</h2>

        {#if customerStats.length > 0}
          <div class="overflow-x-auto bg-white border rounded-lg">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left font-medium text-gray-700">Client</th>
                  <th class="px-4 py-2 text-left font-medium text-gray-700">Email</th>
                  <th class="px-4 py-2 text-right font-medium text-gray-700">Nb de commandes</th>
                  <th class="px-4 py-2 text-right font-medium text-gray-700">Paires totales</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                {#each customerStats as c}
                  <tr>
                    <td class="px-4 py-2">
                      {c.firstName} {c.lastName}
                    </td>
                    <td class="px-4 py-2 text-gray-600">
                      {c.email}
                    </td>
                    <td class="px-4 py-2 text-right font-semibold">
                      {c.orderCount}
                    </td>
                    <td class="px-4 py-2 text-right">
                      {c.totalQuantity}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <p class="text-sm text-gray-500">
            Aucune commande enregistrée pour ce produit pour le moment.
          </p>
        {/if}
      </div>
    </div>
  {:else}
    <p>Chargement…</p>
  {/if}
</div>



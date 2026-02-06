<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import ProductCard from '$lib/components/ProductCard.svelte';
  
  interface ProductImage {
    id: number;
    url: string;
    alt: string;
    isPrimary: boolean;
    sortOrder: number;
  }
  
  interface ProductVariant {
    id: number;
    size: number;
    color: string | null;
    sku: string | null;
    price: number | null;
    stock: number;
    onHand: number;
    reserved: number;
    isActive: boolean;
  }
  
  interface Brand {
    id: number;
    name: string;
    description: string | null;
    logoUrl: string | null;
    website: string | null;
  }
  
  interface Product {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    shortDescription: string | null;
    price: number;
    compareAtPrice: number | null;
    sku: string | null;
    isVegan: boolean;
    hasSteelToe: boolean;
    brand: Brand;
    variants: ProductVariant[];
    images: ProductImage[];
    availableSizes: number[];
    availableColors: string[];
    metaTitle?: string | null;
    metaDescription?: string | null;
  }
  
  let product: Product | null = null;
  let relatedProducts: Product[] = [];
  let loading = true;
  let error = '';
  let selectedSize: number | null = null;
  let selectedColor: string | null = null;
  let selectedVariant: ProductVariant | null = null;
  let currentImageIndex = 0;
  let quantity = 1;
  
  $: if (product) {
    // Find selected variant based on size and color
    selectedVariant = product.variants.find(v => 
      v.size === selectedSize && 
      (selectedColor ? v.color === selectedColor : !v.color)
    ) || null;
  }
  
  onMount(async () => {
    try {
      const slug = $page.params.slug;
      const response = await fetch(`/api/products/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          error = 'Produit non trouvé';
        } else {
          error = 'Erreur lors du chargement du produit';
        }
        return;
      }
      
      const data = await response.json();
      product = data.product;
      
      
      // Load related products by brand
      if (product) {
        await loadRelatedProducts(product.brand.id, product.id);
      }
    } catch (err) {
      console.error('Erreur:', err);
      error = 'Erreur lors du chargement du produit';
    } finally {
      loading = false;
    }
  });
  
  async function loadRelatedProducts(brandId: number, excludeProductId: number) {
    try {
      const response = await fetch(`/api/products?brand=${brandId}&limit=4`);
      if (response.ok) {
        const data = await response.json();
        relatedProducts = data.products
          .filter((p: any) => p.id !== excludeProductId)
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description,
            shortDescription: p.shortDescription,
            price: p.price,
            compareAtPrice: p.compareAtPrice,
            sku: p.sku,
            isVegan: p.isVegan,
            hasSteelToe: p.hasSteelToe,
            brand: { id: p.brandId, name: p.brandName, logoUrl: p.brandLogoUrl },
            image: p.imageUrl ? { url: p.imageUrl, alt: p.imageAlt || p.name } : null,
            stock: p.stock || 0
          }));
      }
    } catch (err) {
      console.error('Erreur lors du chargement des produits associés:', err);
    }
  }
  
  function selectSize(size: number) {
    selectedSize = size;
    selectedColor = null; // Reset color when size changes
  }
  
  function selectColor(color: string) {
    selectedColor = color;
  }
  
  function nextImage() {
    if (product && product.images.length > 1) {
      currentImageIndex = (currentImageIndex + 1) % product.images.length;
    }
  }
  
  function prevImage() {
    if (product && product.images.length > 1) {
      currentImageIndex = currentImageIndex === 0 ? product.images.length - 1 : currentImageIndex - 1;
    }
  }
  
  function goToImage(index: number) {
    currentImageIndex = index;
  }
  
  async function addToCart() {
    if (!selectedVariant || selectedVariant.stock === 0) return;
    
    try {
      // Check if user is authenticated
      const response = await fetch('/api/auth/me');
      const isAuthenticated = response.ok;
      
      if (isAuthenticated) {
        // User is authenticated, use server-side cart
        const cartResponse = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            variantId: selectedVariant.id,
            quantity: quantity
          })
        });

        if (cartResponse.ok) {
          showSuccessMessage();
          quantity = 1;
          window.dispatchEvent(new CustomEvent('cartUpdated'));
        } else {
          const errorData = await cartResponse.json();
          alert(`Erreur: ${errorData.error || 'Impossible d\'ajouter au panier'}`);
        }
      } else {
        // User is not authenticated, use localStorage cart
        addToLocalCart();
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      // Fallback to localStorage cart
      addToLocalCart();
    }
  }

  function addToLocalCart() {
    if (!selectedVariant || !product) return;
    
    // Always use base product price
    const finalPrice = product.price ? Number(product.price) : 0;
    
    if (finalPrice <= 0) {
      alert('Erreur: Prix non disponible pour ce produit');
      return;
    }
    
    const cartItem = {
      id: Date.now(), // Simple ID for localStorage
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      brandName: product.brand.name,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: finalPrice,
      quantity: quantity,
      imageUrl: product.images[0]?.url || null
    };

    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if item already exists
    const existingItemIndex = existingCart.findIndex(
      (item: any) => item.variantId === selectedVariant?.id
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      existingCart.push(cartItem);
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    showSuccessMessage();
    quantity = 1;
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }

  function showSuccessMessage() {
    // Create a temporary success indicator
    const button = document.querySelector('[aria-label="Ajouter au panier"]') as HTMLButtonElement;
    if (button) {
      const originalText = button.textContent;
      button.textContent = '✓ Ajouté !';
      button.classList.add('bg-green-600', 'hover:bg-green-700');
      button.classList.remove('bg-gray-900', 'hover:bg-gray-800');
      
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('bg-green-600', 'hover:bg-green-700');
        button.classList.add('bg-gray-900', 'hover:bg-gray-800');
      }, 2000);
    }
  }
  
  function formatPrice(price: number) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }
  
  function getStockForVariant(variant: ProductVariant | null): number {
    if (!variant) return 0;
    // Préférer le champ stock s'il est fourni (déjà onHand - reserved), sinon fallback
    const hasStockField = typeof (variant as any).stock === 'number' && !Number.isNaN((variant as any).stock);
    if (hasStockField) return Math.max(0, (variant as any).stock as number);
    return Math.max(0, variant.onHand - variant.reserved);
  }
  
  function isVariantAvailable(variant: ProductVariant | null): boolean {
    return variant !== null && getStockForVariant(variant) > 0;
  }
</script>

<svelte:head>
  <title>{product?.metaTitle || product?.name || 'Produit'} | Sheos</title>
  <meta name="description" content={product?.metaDescription || product?.description || product?.shortDescription || ''} />
</svelte:head>

{#if loading}
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
      <p class="text-gray-600">Chargement du produit...</p>
    </div>
  </div>
{:else if error}
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <div class="text-red-500 text-6xl mb-4">⚠️</div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
      <p class="text-gray-600 mb-4">{error}</p>
      <a href="/products" class="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">
        Retour aux produits
      </a>
    </div>
  </div>
{:else if product}
  <div class="min-h-screen bg-gray-50">
    <!-- Breadcrumb -->
    <nav class="bg-white border-b border-gray-200" aria-label="Fil d'Ariane">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ol class="flex items-center space-x-2 text-sm">
          <li><a href="/" class="text-gray-500 hover:text-gray-700">Accueil</a></li>
          <li class="text-gray-400">/</li>
          <li><a href="/products" class="text-gray-500 hover:text-gray-700">Produits</a></li>
          <li class="text-gray-400">/</li>
          <li class="text-gray-900 font-medium">{product.name}</li>
        </ol>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Images -->
        <div class="space-y-4">
          {#if product.images.length > 0}
            <!-- Main Image -->
            <div class="relative aspect-square bg-white rounded-lg overflow-hidden">
              <img
                src={product.images[currentImageIndex].url}
                alt={product.images[currentImageIndex].alt || product.name}
                class="w-full h-full object-cover"
                loading="eager"
              />
              
              {#if product.images.length > 1}
                <!-- Navigation arrows -->
                <button
                  on:click={prevImage}
                  class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
                  aria-label="Image précédente"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                <button
                  on:click={nextImage}
                  class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
                  aria-label="Image suivante"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              {/if}
            </div>
            
            <!-- Thumbnail Images -->
            {#if product.images.length > 1}
              <div class="grid grid-cols-4 gap-2">
                {#each product.images as image, index}
                  <button
                    on:click={() => goToImage(index)}
                    class="aspect-square bg-white rounded-lg overflow-hidden border-2 {index === currentImageIndex ? 'border-gray-900' : 'border-gray-200 hover:border-gray-400'}"
                    aria-label="Voir l'image {index + 1}"
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `${product.name} - Image ${index + 1}`}
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                {/each}
              </div>
            {/if}
          {:else}
            <!-- Placeholder when no images -->
            <div class="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              <svg class="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          {/if}
        </div>

        <!-- Product Info -->
        <div class="space-y-6">
          <!-- Brand -->
          <div class="flex items-center space-x-2">
            {#if product.brand.logoUrl}
              <img src={product.brand.logoUrl} alt={product.brand.name} class="h-8 w-auto" />
            {/if}
            <span class="text-sm font-medium text-gray-600">{product.brand.name}</span>
          </div>

          <!-- Title -->
          <h1 class="text-3xl font-bold text-gray-900">{product.name}</h1>

          <!-- Price -->
          <div class="flex items-center space-x-3">
            <span class="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            {#if product.compareAtPrice && product.compareAtPrice > product.price}
              <span class="text-xl text-gray-500 line-through">{formatPrice(product.compareAtPrice)}</span>
              <span class="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
              </span>
            {/if}
          </div>

          <!-- Features -->
          <div class="flex flex-wrap gap-2">
            {#if product.isVegan}
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                🌱 Végétalien
              </span>
            {/if}
            {#if product.hasSteelToe}
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                🛡️ Embout d'acier
              </span>
            {/if}
          </div>

          <!-- Description -->
          {#if product.description}
            <div class="prose max-w-none">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p class="text-gray-600 whitespace-pre-line">{product.description}</p>
            </div>
          {/if}

          <!-- Size Selection -->
          {#if product.availableSizes.length > 0}
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Taille</h3>
              <div class="grid grid-cols-6 gap-2">
                {#each product.availableSizes as size}
                  {@const variantForSize = product.variants.find(v => v.size === size)}
                  {@const stockForSize = variantForSize
                    ? (typeof variantForSize.stock === 'number' && !Number.isNaN(variantForSize.stock)
                        ? Math.max(0, variantForSize.stock)
                        : Math.max(0, variantForSize.onHand - variantForSize.reserved))
                    : 0}
                  <button
                    on:click={() => selectSize(size)}
                    disabled={stockForSize === 0}
                    class="px-4 py-2 border rounded-lg text-center font-medium transition-colors relative {selectedSize === size ? 'border-gray-900 bg-gray-900 text-white' : stockForSize === 0 ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-gray-300 hover:border-gray-400'}"
                    aria-label="Sélectionner la taille {size} - {stockForSize} en stock"
                  >
                    <div class="flex flex-col items-center">
                      <span>{size}</span>
                      {#if stockForSize > 0}
                        <span class="text-xs opacity-75">{stockForSize}</span>
                      {:else}
                        <span class="text-xs">Rupture</span>
                      {/if}
                    </div>
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Color Selection -->
          {#if product.availableColors.length > 0}
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Couleur</h3>
              <div class="flex flex-wrap gap-2">
                {#each product.availableColors as color}
                  <button
                    on:click={() => selectColor(color)}
                    class="px-4 py-2 border rounded-lg text-center font-medium transition-colors {selectedColor === color ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 hover:border-gray-400'}"
                    aria-label="Sélectionner la couleur {color}"
                  >
                    {color}
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Quantity -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Quantité</h3>
            <div class="flex items-center space-x-3">
              <button
                on:click={() => quantity = Math.max(1, quantity - 1)}
                class="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                aria-label="Diminuer la quantité"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                </svg>
              </button>
              <span class="w-12 text-center font-medium">{quantity}</span>
              <button
                on:click={() => quantity = Math.min(getStockForVariant(selectedVariant), quantity + 1)}
                class="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                aria-label="Augmenter la quantité"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Stock Status -->
          <div class="flex items-center space-x-2">
            {#if isVariantAvailable(selectedVariant)}
              <span class="text-green-600 font-medium">✓ En stock ({getStockForVariant(selectedVariant)} disponibles)</span>
            {:else if selectedVariant}
              <span class="text-red-600 font-medium">✗ Rupture de stock</span>
            {:else}
              <span class="text-gray-600">Sélectionnez une taille</span>
            {/if}
          </div>

          <!-- Add to Cart Button -->
          <button
            on:click={addToCart}
            disabled={!isVariantAvailable(selectedVariant)}
            class="w-full bg-gray-900 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            aria-label="Ajouter au panier"
          >
            {#if isVariantAvailable(selectedVariant)}
              Ajouter au panier - {formatPrice(product.price)}
            {:else}
              {selectedVariant ? 'Rupture de stock' : 'Sélectionnez une taille'}
            {/if}
          </button>

          <!-- Product Details -->
          <div class="border-t pt-6 space-y-4">
            {#if product.sku}
              <div class="flex justify-between">
                <span class="text-gray-600">Référence:</span>
                <span class="font-medium">{product.sku}</span>
              </div>
            {/if}
            <div class="flex justify-between">
              <span class="text-gray-600">Marque:</span>
              <span class="font-medium">{product.brand.name}</span>
            </div>
            {#if product.brand.website}
              <div class="flex justify-between">
                <span class="text-gray-600">Site web:</span>
                <a href={product.brand.website} target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">
                  {product.brand.name}
                </a>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Related Products -->
      {#if relatedProducts.length > 0}
        <div class="mt-16">
          <h2 class="text-2xl font-bold text-gray-900 mb-8">Produits associés de {product.brand.name}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {#each relatedProducts as relatedProduct}
              <ProductCard product={relatedProduct} />
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let variants: any[] = [];
  export const productName = '';
  
  const dispatch = createEventDispatcher();
  
  let editingStock: { variantId: number; currentStock: number } | null = null;
  let stockInput = '';
  
  // Calculate chart data
  $: chartData = variants.map(v => ({
    size: v.size,
    stock: v.stock || 0,
    color: v.color || '#0C766C',
    variantId: v.id
  }));
  
  // Find max stock for scaling
  $: maxStock = Math.max(...chartData.map(d => d.stock), 1);
  
  // Calculate percentage for each bar
  $: chartDataWithPercent = chartData.map(d => ({
    ...d,
    percentage: Math.round((d.stock / maxStock) * 100)
  }));
  
  function startStockEdit(variantId: number, currentStock: number) {
    editingStock = { variantId, currentStock };
    stockInput = currentStock.toString();
  }
  
  function cancelStockEdit() {
    editingStock = null;
    stockInput = '';
  }
  
  function updateStock(variantId: number) {
    const newStock = parseInt(stockInput);
    if (isNaN(newStock) || newStock < 0) return;
    
    dispatch('stockUpdate', { variantId, stock: newStock });
    editingStock = null;
    stockInput = '';
  }
</script>

<div class="bg-white rounded-lg border border-gray-100 p-4">
  <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #0C766C">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
    </svg>
    Stock par taille
  </h4>
  
  {#if chartDataWithPercent.length > 0}
    <div class="space-y-2">
      {#each chartDataWithPercent as item}
        <div class="flex items-center gap-3">
          <div class="w-12 text-xs font-medium text-gray-600 text-right">
            {item.size}
          </div>
          <div class="flex-1">
            <div class="relative h-4 bg-gray-100 rounded-full overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-300"
                style="width: {item.percentage}%; background-color: {item.stock > 0 ? item.color : '#EF4444'}"
              ></div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            {#if editingStock && editingStock.variantId === item.variantId}
              <input 
                type="number" 
                class="w-12 px-1 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500" 
                bind:value={stockInput}
                on:keydown={(e) => e.key === 'Enter' && updateStock(item.variantId)}
                on:keydown={(e) => e.key === 'Escape' && cancelStockEdit()}
              />
              <button 
                class="p-0.5 text-green-600 hover:text-green-800 transition-colors" 
                on:click={() => updateStock(item.variantId)}
                title="Confirmer"
                aria-label="Confirmer la modification"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </button>
              <button 
                class="p-0.5 text-red-600 hover:text-red-800 transition-colors" 
                on:click={cancelStockEdit}
                title="Annuler"
                aria-label="Annuler la modification"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            {:else}
              <div class="w-8 text-xs font-semibold text-right {item.stock > 0 ? 'text-gray-900' : 'text-red-600'}">
                {item.stock}
              </div>
              <button 
                class="p-0.5 transition-colors" 
                style="color: #0C766C"
                on:click={() => startStockEdit(item.variantId, item.stock)}
                title="Modifier le stock"
                aria-label="Modifier le stock pour taille {item.size}"
                on:mouseover={(e) => e.currentTarget.style.color = '#0A5D54'}
                on:mouseout={(e) => e.currentTarget.style.color = '#0C766C'}
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
    
    <div class="mt-3 pt-3 border-t border-gray-100">
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>Total: <strong class="text-gray-900">{chartData.reduce((sum, d) => sum + d.stock, 0)}</strong></span>
        <span>Max: <strong class="text-gray-900">{maxStock}</strong></span>
      </div>
    </div>
  {:else}
    <div class="text-center py-4">
      <svg class="mx-auto h-8 w-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
      </svg>
      <p class="text-xs text-gray-400">Aucune donnée de stock</p>
    </div>
  {/if}
</div>

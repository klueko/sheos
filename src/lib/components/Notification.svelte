<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let type: 'success' | 'error' | 'warning' | 'info' = 'info';
  export let message: string = '';
  export let show: boolean = false;
  export let autoHide: boolean = true;
  export let duration: number = 5000;
  
  const dispatch = createEventDispatcher();
  
  let timeoutId: any;
  
  $: if (show && autoHide) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      show = false;
      dispatch('hide');
    }, duration);
  }
  
  function handleClose() {
    show = false;
    dispatch('hide');
  }
  
  const icons = {
    success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    error: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  };
  
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-green-50 border-green-200 text-green-800'
  };
  
  const iconStyles = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-green-400'
  };
</script>

{#if show}
  <div class="fixed top-4 right-4 z-50 max-w-sm w-full">
    <div class="p-4 {styles[type]} border rounded-lg shadow-lg" role="alert">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5 {iconStyles[type]}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={icons[type]}></path>
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium">{message}</p>
        </div>
        <div class="ml-auto pl-3">
          <button 
            class="inline-flex {iconStyles[type]} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
            on:click={handleClose}
            aria-label="Fermer la notification"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  div {
    animation: slideIn 0.3s ease-out;
  }
</style>

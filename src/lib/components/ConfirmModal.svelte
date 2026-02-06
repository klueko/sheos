<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let show: boolean = false;
  export let title: string = 'Confirmer';
  export let message: string = 'Êtes-vous sûr de vouloir continuer ?';
  export let confirmText: string = 'Confirmer';
  export let cancelText: string = 'Annuler';
  export let variant: 'danger' | 'warning' | 'info' = 'danger';
  
  const dispatch = createEventDispatcher();
  
  function handleConfirm() {
    dispatch('confirm');
    show = false;
  }
  
  function handleCancel() {
    dispatch('cancel');
    show = false;
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleCancel();
    }
  }
  
  const buttonStyles = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    info: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
  };
  
  const iconStyles = {
    danger: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-green-400'
  };
  
  const icons = {
    danger: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  };
</script>

{#if show}
  <!-- Backdrop -->
  <div 
    class="fixed inset-0 z-50 overflow-y-auto"
    on:keydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
  >
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div 
        class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
        on:click={handleCancel}
        on:keydown={(e) => e.key === 'Enter' && handleCancel()}
        role="button"
        tabindex="0"
      ></div>

      <!-- Modal -->
      <div class="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <div class="sm:flex sm:items-start">
          <div class="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
            <svg class="w-6 h-6 {iconStyles[variant]}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={icons[variant]}></path>
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 id="modal-title" class="text-lg font-medium leading-6 text-gray-900">
              {title}
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            class="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm {buttonStyles[variant]}"
            on:click={handleConfirm}
          >
            {confirmText}
          </button>
          <button
            type="button"
            class="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:w-auto sm:text-sm"
            on:click={handleCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

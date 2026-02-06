<script lang="ts">
  import { goto } from '$app/navigation';
</script>

<svelte:head>
  <title>Payment Cancelled - Sheos</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <div class="text-center">
    <!-- Cancel Icon -->
    <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
      <svg class="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
      </svg>
    </div>

    <h1 class="text-3xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
    <p class="text-lg text-gray-600 mb-8">
      Your payment was cancelled. No charges have been made to your account.
    </p>

    <div class="space-y-4">
      <p class="text-gray-600">
        If you encountered any issues during checkout, please try again or contact our support team.
      </p>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a 
          href="/cart" 
          class="bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
        >
          Return to Cart
        </a>
        <a 
          href="/products" 
          class="border-2 border-gray-800 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
        >
          Continue Shopping
        </a>
      </div>
    </div>
  </div>
</div>

<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import CookieBanner from '$lib/components/CookieBanner.svelte';
	import { user } from '$lib/stores/auth';
	import { initializeCookiePreferences } from '$lib/stores/cookies';
  
	// Initialize auth state and cookie preferences
	onMount(() => {
	  if (browser) {
		// Initialize cookie preferences
		initializeCookiePreferences();
		
		// Check if user is logged in by making a request to /api/auth/me
		fetch('/api/auth/me')
		  .then(res => res.json())
		  .then(data => {
			if (data.user) {
			  user.set(data.user);
			}
		  })
		  .catch(() => {
			// User not authenticated
		  });
	  }
	});
  </script>
  
  <svelte:head>
	<title>Sheos - Alternative & Gothic Footwear</title>
	<meta name="description" content="Discover alternative and gothic footwear from New Rock, T.U.K., Demonia and more. Vegan options available." />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
  </svelte:head>
  
  <div class="min-h-screen bg-gray-50 flex flex-col">
	<Header />
	
	<main class="flex-1">
	  <slot />
	</main>
	
	<Footer />
	
	<!-- Cookie Banner -->
	<CookieBanner />
  </div>
  
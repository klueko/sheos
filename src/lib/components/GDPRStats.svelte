<script lang="ts">
  import { onMount } from 'svelte';

  interface GDPRStats {
    totalDeletionRequests: number;
    pendingRequests: number;
    completedRequests: number;
    rejectedRequests: number;
    cookieConsents: number;
    dataExports: number;
  }

  let stats: GDPRStats = {
    totalDeletionRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    rejectedRequests: 0,
    cookieConsents: 0,
    dataExports: 0
  };

  let isLoading = true;

  onMount(async () => {
    try {
      const response = await fetch('/api/admin/gdpr-stats');
      if (response.ok) {
        stats = await response.json();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques RGPD:', error);
    } finally {
      isLoading = false;
    }
  });
</script>

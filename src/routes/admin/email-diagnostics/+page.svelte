<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '@iconify/svelte';

  let diagnostics: any = {};
  let loading = true;

  async function loadDiagnostics() {
    try {
      const response = await fetch('/api/email-diagnostics');
      const data = await response.json();
      diagnostics = data;
    } catch (error) {
      diagnostics = { error: 'Failed to load diagnostics' };
    } finally {
      loading = false;
    }
  }

  async function sendTestEmail() {
    const email = prompt('Enter your email address for testing:');
    if (!email) return;

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      alert(result.success ? 'Test email sent!' : `Error: ${result.message}`);
    } catch (error) {
      alert('Failed to send test email');
    }
  }

  onMount(loadDiagnostics);
</script>

<svelte:head>
  <title>Email Diagnostics - Sheos Admin</title>
</svelte:head>

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Email Diagnostics</h1>
    <p class="text-gray-600">Check email configuration and troubleshoot issues</p>
  </div>

  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Configuration Status -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Configuration Status</h2>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">SMTP Host</span>
            <span class="px-2 py-1 rounded text-xs {diagnostics.smtpHost ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
              {diagnostics.smtpHost || 'Not configured'}
            </span>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">SMTP Port</span>
            <span class="px-2 py-1 rounded text-xs {diagnostics.smtpPort ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
              {diagnostics.smtpPort || 'Not configured'}
            </span>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">SMTP User</span>
            <span class="px-2 py-1 rounded text-xs {diagnostics.smtpUser ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
              {diagnostics.smtpUser ? '***@' + diagnostics.smtpUser.split('@')[1] : 'Not configured'}
            </span>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">SMTP Password</span>
            <span class="px-2 py-1 rounded text-xs {diagnostics.smtpPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
              {diagnostics.smtpPass ? 'Configured' : 'Not configured'}
            </span>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">SMTP From</span>
            <span class="px-2 py-1 rounded text-xs {diagnostics.smtpFrom ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
              {diagnostics.smtpFrom || 'Not configured'}
            </span>
          </div>
        </div>

        <div class="mt-6">
          <div class="flex items-center">
            <Icon icon="lucide:info" class="w-5 h-5 text-blue-600 mr-2" />
            <span class="text-sm font-medium text-blue-900">Overall Status</span>
          </div>
          <p class="text-sm text-blue-800 mt-1">
            {diagnostics.overallStatus}
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
        
        <div class="space-y-4">
          <button
            on:click={sendTestEmail}
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Send Test Email
          </button>
          
          <button
            on:click={loadDiagnostics}
            class="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            Refresh Diagnostics
          </button>
        </div>

        {#if diagnostics.overallStatus?.includes('Not configured')}
          <div class="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 class="font-semibold text-yellow-900 mb-2">Configuration Required</h3>
            <p class="text-sm text-yellow-800 mb-3">
              Create a .env file with your SMTP settings:
            </p>
            <div class="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono">
              SMTP_HOST=smtp.gmail.com<br>
              SMTP_PORT=587<br>
              SMTP_USER=your.email@gmail.com<br>
              SMTP_PASS=your_app_password<br>
              SMTP_FROM=your.email@gmail.com
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Recent Logs -->
    <div class="mt-8 bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Recent Email Activity</h2>
      
      {#if diagnostics.recentEmails && diagnostics.recentEmails.length > 0}
        <div class="space-y-2">
          {#each diagnostics.recentEmails as email}
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <span class="font-medium">{email.orderNumber}</span>
                <span class="text-sm text-gray-600 ml-2">to {email.to}</span>
              </div>
              <span class="px-2 py-1 rounded text-xs {email.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                {email.success ? 'Sent' : 'Failed'}
              </span>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-gray-600">No recent email activity</p>
      {/if}
    </div>
  {/if}
</div>

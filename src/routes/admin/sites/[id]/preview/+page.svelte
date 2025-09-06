<script>
  import { ArrowLeft, ExternalLink } from '@lucide/svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import * as m from '$lib/paraglide/messages';

  // Get site ID from params
  const siteId = $page.params.id;

  // Site data
  let site = $state(null);
  let loading = $state(true);
  let error = $state(null);

  // Load site data
  async function loadSite() {
    try {
      loading = true;
      error = null;

      const response = await fetch(`/api/sites/${siteId}`);
      if (!response.ok) {
        throw new Error('Failed to load site');
      }

      const siteData = await response.json();
      site = siteData;
    } catch (err) {
      console.error('Failed to load site:', err);
      error = err.message;
    } finally {
      loading = false;
    }
  }

  // Navigate back to sites list
  function goBackToSites() {
    goto('/admin/sites');
  }

  // Open site in full-screen mode
  function openFullScreen() {
    if (!site) return;
    
    // Use sites symlink serving (like Finder)
    const previewUrl = `/sites/${site.slug}`;
    window.open(previewUrl, '_blank');
  }

  onMount(() => {
    loadSite();
  });
</script>

<!-- Loading State -->
{#if loading}
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4 text-base-content/70">Loading site preview...</p>
    </div>
  </div>
{:else if error}
  <!-- Error State -->
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="alert alert-error max-w-md">
        <span>{error}</span>
      </div>
      <button class="btn btn-primary mt-4" onclick={goBackToSites}>
        <ArrowLeft class="h-4 w-4" />
        Back to Sites
      </button>
    </div>
  </div>
{:else if site}
  <!-- Preview Interface -->
  <div class="min-h-screen bg-base-100">
    <!-- Fixed Header -->
    <div class="fixed top-0 left-0 right-0 bg-white border-b border-base-200 z-10">
      <div class="flex justify-between items-center px-6 py-4">
        <!-- Back Button -->
        <button 
          class="btn btn-ghost gap-2"
          onclick={goBackToSites}
        >
          <ArrowLeft class="h-4 w-4" />
          Back to Sites
        </button>

        <!-- Site Info -->
        <div class="text-center">
          <h1 class="text-lg font-semibold">{site.name}</h1>
          <p class="text-sm text-base-content/60">Preview Mode</p>
        </div>

        <!-- Full-Screen Button -->
        <button 
          class="btn btn-primary gap-2"
          onclick={openFullScreen}
        >
          <ExternalLink class="h-4 w-4" />
          Open Fullscreen
        </button>
      </div>
    </div>

    <!-- Preview Content -->
    <div class="pt-20">
      <!-- Check if site is built -->
      {#if site.buildStatus !== 'success'}
        <div class="flex items-center justify-center py-16">
          <div class="text-center">
            <div class="alert alert-warning max-w-md">
              <span>Site needs to be generated before preview</span>
            </div>
            <button 
              class="btn btn-primary mt-4"
              onclick={() => goto(`/admin/sites/${site?.id}/config`)}
            >
              Generate Site
            </button>
          </div>
        </div>
      {:else}
        <!-- Iframe Preview -->
        <div class="w-full">
          <iframe 
            src="/sites/{site.slug}"
            class="w-full border-0"
            style="height: calc(100vh - 80px);"
            title="Site Preview"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          ></iframe>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  /* Ensure no scrollbars on the main container when iframe is present */
  :global(html, body) {
    overflow-x: hidden;
  }
  
  /* Make sure iframe takes full available space */
  iframe {
    display: block;
    background: white;
  }
</style>
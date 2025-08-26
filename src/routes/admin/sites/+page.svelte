<script>
  import { 
    Eye, 
    Globe2, 
    Play, 
    Settings, 
    Upload, 
    Zap,
    ExternalLink,
    Calendar,
    User
  } from '@lucide/svelte';
  
  import * as m from '$lib/paraglide/messages';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  // Sites data loaded from API
  let sites = $state([]);

  let loading = $state(false);
  let generatingId = $state(null);

  // Generate site static files
  async function generateSite(site) {
    generatingId = site.id;
    loading = true;
    
    try {
      console.log(`🏗️ Starting site generation for: ${site.name}`);
      
      // TODO: Implement actual site generation API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate generation
      
      // Update build status
      const updatedSites = sites.map(s => 
        s.id === site.id 
          ? { ...s, buildStatus: 'success', lastBuildAt: new Date() }
          : s
      );
      sites = updatedSites;
      
      console.log(`✅ Site generation completed for: ${site.name}`);
    } catch (error) {
      console.error('❌ Site generation failed:', error);
      
      // Update build status to error
      const updatedSites = sites.map(s => 
        s.id === site.id 
          ? { ...s, buildStatus: 'error', lastBuildAt: new Date() }
          : s
      );
      sites = updatedSites;
    } finally {
      loading = false;
      generatingId = null;
    }
  }

  // Preview site
  function previewSite(site) {
    console.log(`👁️ Opening preview for: ${site.name}`);
    // TODO: Open preview in new window/tab
    window.open(`/preview/${site.id}`, '_blank');
  }

  // Configure site
  function configureSite(site) {
    console.log(`⚙️ Opening configuration for: ${site.name}`);
    // TODO: Navigate to site configuration page
  }

  // Get build status badge class
  function getBuildStatusClass(status) {
    switch (status) {
      case 'building': return 'badge-info';
      case 'success': return 'badge-success';
      case 'error': return 'badge-error';
      default: return 'badge-ghost';
    }
  }

  // Get build status text
  function getBuildStatusText(status) {
    switch (status) {
      case 'building': return 'Building';
      case 'success': return 'Built';
      case 'error': return 'Failed';
      default: return 'Idle';
    }
  }

  // Format date for display
  function formatDate(date) {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  // Load sites from API
  async function loadSites() {
    loading = true;
    try {
      const response = await fetch('/api/sites');
      if (!response.ok) {
        throw new Error(`Failed to load sites: ${response.statusText}`);
      }
      
      const sitesData = await response.json();
      sites = sitesData;
      
      console.log('✅ Loaded sites:', sites);
    } catch (error) {
      console.error('❌ Failed to load sites:', error);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    console.log('📡 Loading sites...');
    loadSites();
  });
</script>

<!-- Page Header -->
<div class="flex justify-between items-start mb-8">
  <div>
    <h1 class="text-3xl font-bold mb-2">{m.sites_title()}</h1>
    <p class="text-base-content/70">{m.sites_subtitle()}</p>
  </div>
  
  <div class="flex gap-3">
    <button class="btn btn-outline" disabled>
      <Settings class="h-4 w-4" />
      {m.sites_global_settings()}
    </button>
    
    <button class="btn btn-primary" disabled>
      <Globe2 class="h-4 w-4" />
      {m.sites_create_new()}
    </button>
  </div>
</div>

<!-- Sites List -->
<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
  {#each sites as site (site.id)}
    <div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
      <div class="card-body">
        <!-- Site Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1 min-w-0">
            <h3 class="card-title text-lg truncate">
              {site.name}
              {#if site.isDefault}
                <div class="badge badge-primary badge-sm">Default</div>
              {/if}
            </h3>
            {#if site.domain}
              <p class="text-sm text-base-content/60 truncate">
                <ExternalLink class="h-3 w-3 inline mr-1" />
                {site.domain}
              </p>
            {/if}
          </div>
          
          <div class="badge {getBuildStatusClass(site.buildStatus)} badge-sm">
            {getBuildStatusText(site.buildStatus)}
          </div>
        </div>

        <!-- Site Description -->
        {#if site.description}
          <p class="text-sm text-base-content/70 mb-4 line-clamp-2">
            {site.description}
          </p>
        {/if}

        <!-- Site Metadata -->
        <div class="text-xs text-base-content/60 mb-4 space-y-1">
          <div class="flex items-center gap-1">
            <User class="h-3 w-3" />
            Template: {site.templateName}
          </div>
          
          {#if site.lastBuildAt}
            <div class="flex items-center gap-1">
              <Calendar class="h-3 w-3" />
              Last built: {formatDate(site.lastBuildAt)}
            </div>
          {/if}
        </div>

        <!-- Action Buttons -->
        <div class="card-actions justify-end gap-2">
          <button 
            class="btn btn-ghost btn-sm"
            onclick={() => configureSite(site)}
            disabled={loading}
          >
            <Settings class="h-3 w-3" />
            Config
          </button>
          
          <button 
            class="btn btn-outline btn-sm"
            onclick={() => previewSite(site)}
            disabled={loading}
          >
            <Eye class="h-3 w-3" />
            Preview
          </button>
          
          <button 
            class="btn btn-primary btn-sm"
            onclick={() => generateSite(site)}
            disabled={loading}
          >
            {#if generatingId === site.id}
              <span class="loading loading-spinner loading-xs"></span>
              Building
            {:else}
              <Zap class="h-3 w-3" />
              Generate
            {/if}
          </button>
        </div>
      </div>
    </div>
  {/each}
</div>

<!-- Empty State (if no sites) -->
{#if sites.length === 0}
  <div class="text-center py-16">
    <Globe2 class="h-16 w-16 mx-auto text-base-content/30 mb-4" />
    <h3 class="text-xl font-semibold mb-2">{m.sites_empty_title()}</h3>
    <p class="text-base-content/70 mb-6">{m.sites_empty_description()}</p>
    <button class="btn btn-primary">
      <Globe2 class="h-4 w-4" />
      {m.sites_create_first()}
    </button>
  </div>
{/if}

<!-- Loading Overlay (if needed) -->
{#if loading && !generatingId}
  <div class="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
    <div class="bg-base-100 p-8 rounded-lg shadow-xl text-center">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4 text-base-content/70">{m.sites_loading()}</p>
    </div>
  </div>
{/if}

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
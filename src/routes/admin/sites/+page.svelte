<script>
  import { 
    Eye, 
    Globe2, 
    Globe,
    Play, 
    Settings, 
    Upload, 
    Zap,
    Rocket,
    ExternalLink,
    Calendar,
    Clock,
    User,
    Server,
    FileDown,
    MoreVertical,
    Edit3,
    Trash2
  } from '@lucide/svelte';
  
  import * as m from '$lib/paraglide/messages';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  // Sites data loaded from API
  let sites = $state([]);

  let loading = $state(false);
  let generatingId = $state(null);
  let toggleGenerationId = $state(null);
  
  // Create site modal state
  let showCreateModal = $state(false);
  let creating = $state(false);
  
  // Create site form state
  let createForm = $state({
    name: '',
    description: '',
    slug: '',
    generationMode: 'dynamic'
  });

  // Generate site static files
  async function generateSite(site) {
    generatingId = site.id;
    loading = true;
    
    try {
      console.log(`🏗️ Starting site generation for: ${site.name}`);
      
      // Update site status to building immediately
      const updatedSites = sites.map(s => 
        s.id === site.id 
          ? { ...s, buildStatus: 'building' }
          : s
      );
      sites = updatedSites;
      
      // Call actual site generation API
      const response = await fetch(`/api/sites/${site.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Site generation failed');
      }
      
      console.log(`✅ Site generation completed for: ${site.name}`, result);
      
      // Reload sites to get updated build status
      await loadSites();
      
    } catch (error) {
      console.error('❌ Site generation failed:', error);
      
      // Update build status to error
      const updatedSites = sites.map(s => 
        s.id === site.id 
          ? { ...s, buildStatus: 'error', lastBuildAt: new Date() }
          : s
      );
      sites = updatedSites;
      
      // Show error to user
      alert(`Site generation failed: ${error.message}`);
    } finally {
      loading = false;
      generatingId = null;
    }
  }

  // Preview site
  function previewSite(site) {
    console.log(`👁️ Opening preview for: ${site.name}`);
    
    // Check if site has been generated
    if (site.buildStatus !== 'success') {
      alert('Please generate the site first before previewing.');
      return;
    }
    
    // Open preview in new window/tab using slug
    const previewUrl = site.slug ? `/preview/${site.slug}` : `/preview/${site.id}`;
    window.open(previewUrl, '_blank');
  }

  // Configure site
  function configureSite(site) {
    console.log(`⚙️ Opening configuration for: ${site.name}`);
    goto(`/admin/sites/${site.id}/config`);
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

  // Toggle generation mode
  async function toggleGenerationMode(site) {
    toggleGenerationId = site.id;
    
    try {
      const newMode = site.generationMode === 'dynamic' ? 'static' : 'dynamic';
      
      const response = await fetch(`/api/sites/${site.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...site,
          generationMode: newMode
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update generation mode');
      }
      
      const updatedSite = await response.json();
      
      // Update the sites array with the new data
      sites = sites.map(s => s.id === site.id ? updatedSite : s);
      
    } catch (error) {
      console.error('Failed to toggle generation mode:', error);
      alert(`Failed to update generation mode: ${error.message}`);
    } finally {
      toggleGenerationId = null;
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

  // Get generation mode colors and styling
  function getGenerationModeStyle(mode) {
    return mode === 'dynamic' 
      ? { color: 'indigo', buttonClass: 'bg-indigo-600 hover:bg-indigo-700', textClass: 'text-indigo-600' }
      : { color: 'emerald', buttonClass: 'bg-emerald-600 hover:bg-emerald-700', textClass: 'text-emerald-600' };
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
      
      console.log('✅ Loaded sites:', $state.snapshot(sites));
    } catch (error) {
      console.error('❌ Failed to load sites:', error);
    } finally {
      loading = false;
    }
  }

  // Create new site
  async function createSite() {
    if (!createForm.name.trim() || !createForm.slug.trim()) {
      alert('Please fill in required fields');
      return;
    }
    
    creating = true;
    
    try {
      const response = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name.trim(),
          description: createForm.description.trim() || null,
          slug: createForm.slug.trim(),
          generationMode: createForm.generationMode,
          // Default deployment settings
          deploymentSettings: {
            target: 'cloudflare',
            environment: 'production',
            autoDeploy: false,
            previewDeploys: true
          },
          // Default optimization settings
          optimizationSettings: {
            buildStrategy: 'full',
            outputFormat: 'html',
            minifyHtml: true,
            minifyCSS: true,
            minifyJS: true,
            optimizeImages: true,
            generateSitemap: true,
            enableGzip: true
          }
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create site');
      }
      
      const newSite = await response.json();
      
      // Add to sites list
      sites = [...sites, newSite];
      
      // Reset form and close modal
      createForm = {
        name: '',
        description: '',
        slug: '',
        generationMode: 'dynamic'
      };
      showCreateModal = false;
      
      // Redirect to configuration page
      goto(`/admin/sites/${newSite.id}/config`);
      
    } catch (error) {
      console.error('Failed to create site:', error);
      alert(`Failed to create site: ${error.message}`);
    } finally {
      creating = false;
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
    
    <button 
      class="btn btn-primary"
      onclick={() => showCreateModal = true}
    >
      <Globe2 class="h-4 w-4" />
      {m.sites_create_new()}
    </button>
  </div>
</div>

<!-- Sites List -->
<div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(380px, 540px));">
  {#each sites as site (site.id)}
    {@const modeStyle = getGenerationModeStyle(site.generationMode)}
    <div class="card bg-base-100 shadow-sm border border-base-200">
      <div class="card-body">
        <!-- Site Header - Single Line -->
        <div class="flex items-start justify-between mb-3 flex-wrap gap-2">
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <h3 class="text-lg font-semibold">
              {site.name}
            </h3>
            {#if site.isDefault}
              <div class="badge badge-sm bg-primary/10 text-primary">Default</div>
            {/if}
            <div class="badge badge-sm {site.buildStatus === 'success' ? 'bg-success/10 text-success' : site.buildStatus === 'error' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'}">
              {getBuildStatusText(site.buildStatus)}
            </div>
          </div>
          
          <div class="flex items-center gap-2 text-sm text-base-content/60">
            <Globe class="h-4 w-4" />
            <span>{site.domain || site.slug || 'localhost:5173'}</span>
          </div>
        </div>

        <!-- Deployment Platform -->
        <div class="flex items-center gap-2 mb-2 text-sm text-base-content/70">
          {#if !site.deploymentSettings?.target || site.deploymentSettings?.target === 'cloudflare'}
            <span class="text-orange-500">☁️</span>
            <span>Deployed on Cloudflare Pages</span>
          {:else if site.deploymentSettings?.target === 'vercel'}
            <span class="text-black dark:text-white text-base">▲</span>
            <span>Deployed on Vercel</span>
          {:else if site.deploymentSettings?.target === 'netlify'}
            <span class="text-teal-500">◆</span>
            <span>Deployed on Netlify</span>
          {:else if site.deploymentSettings?.target === 'github'}
            <svg class="w-4 h-4 inline" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>Deployed on GitHub Pages</span>
          {/if}
        </div>

        <!-- Site Description -->
        {#if site.description}
          <p class="text-sm text-base-content/70 mb-4">
            {site.description}
          </p>
        {/if}

        <!-- Generation Mode Section -->
        <div class="bg-base-200 rounded-lg p-4 mb-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium mb-1">Generation Mode</h4>
              <p class="text-xs text-base-content/60">Choose how your site will be generated</p>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm font-medium">
                {site.generationMode === 'dynamic' ? 'Dynamic' : 'Static'}
              </span>
              <input 
                type="checkbox"
                class="toggle toggle-sm bg-indigo-600 border-transparent checked:bg-emerald-600 checked:border-transparent shadow-inner [&:before]:!bg-white"
                checked={site.generationMode === 'static'}
                onchange={() => toggleGenerationMode(site)}
                disabled={toggleGenerationId === site.id || loading}
              />
            </div>
          </div>
          
          <div class="mt-3 text-xs text-base-content/70">
            {#if site.generationMode === 'dynamic'}
              <strong class="{modeStyle.textClass}">Dynamic Generation:</strong> Real-time content updates, server-side rendering, interactive features
            {:else}
              <strong class="{modeStyle.textClass}">Static Generation:</strong> Pre-built HTML files, ultra-fast loading, CDN-optimized, perfect for SEO
            {/if}
          </div>
        </div>

        <!-- Site Metadata -->
        <div class="text-xs text-base-content/60 mb-4 space-y-1">
          <div class="flex items-center gap-2">
            <Calendar class="h-3 w-3" />
            Template: {site.templateName || 'None'}
          </div>
          {#if site.lastBuildAt}
            <div class="flex items-center gap-2">
              <Clock class="h-3 w-3" />
              Last built: {formatDate(site.lastBuildAt)}
            </div>
          {/if}
        </div>

        <!-- Action Buttons -->
        <div class="card-actions justify-end gap-2">
          <button 
            class="btn btn-outline btn-sm"
            onclick={() => configureSite(site)}
            disabled={loading}
          >
            <Settings class="h-4 w-4" />
            Config
          </button>
          
          <button 
            class="btn btn-outline btn-sm"
            onclick={() => previewSite(site)}
            disabled={loading}
          >
            <Eye class="h-4 w-4" />
            Preview
          </button>
          
          <button 
            class="btn {modeStyle.buttonClass} btn-sm text-white"
            onclick={() => generateSite(site)}
            disabled={loading}
          >
            {#if generatingId === site.id}
              <span class="loading loading-spinner loading-xs"></span>
              Building
            {:else if site.generationMode === 'static'}
              <Rocket class="h-4 w-4" />
              Build Static
            {:else}
              <Zap class="h-4 w-4" />
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
    <button 
      class="btn btn-primary"
      onclick={() => showCreateModal = true}
    >
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

<!-- Create Site Modal -->
{#if showCreateModal}
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-base-100 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-base-200">
        <h2 class="text-2xl font-bold">Create New Site</h2>
        <button 
          class="btn btn-ghost btn-sm btn-circle"
          onclick={() => showCreateModal = false}
        >
          ✕
        </button>
      </div>
      
      <!-- Modal Content -->
      <div class="p-6">
        <p class="text-base-content/70 mb-6">Create a new site with your preferred generation mode and configuration.</p>
        
        <!-- Basic Information -->
        <div class="space-y-4 mb-6">
          <h3 class="text-lg font-semibold">Site Information</h3>
          <div class="grid gap-4">
            <div>
              <label class="label">
                <span class="label-text">Site Name *</span>
              </label>
              <input 
                type="text" 
                class="input input-bordered w-full" 
                placeholder="My Awesome Site"
                bind:value={createForm.name}
              />
            </div>
            <div>
              <label class="label">
                <span class="label-text">Description</span>
              </label>
              <textarea 
                class="textarea textarea-bordered w-full" 
                placeholder="A brief description of your site"
                rows="3"
                bind:value={createForm.description}
              ></textarea>
            </div>
            <div>
              <label class="label">
                <span class="label-text">Site Slug *</span>
              </label>
              <input 
                type="text" 
                class="input input-bordered w-full" 
                placeholder="my-awesome-site"
                bind:value={createForm.slug}
              />
              <div class="label">
                <span class="label-text-alt text-base-content/60">Will be used for preview URL and deployment</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Generation Mode Selection -->
        <div class="space-y-4 mb-6">
          <h3 class="text-lg font-semibold">Generation Mode</h3>
          <div class="grid gap-4 md:grid-cols-2">
            <!-- Dynamic Option -->
            <div class="card bg-base-200 border border-indigo-200 cursor-pointer hover:border-indigo-300 transition-colors">
              <div class="card-body p-4">
                <div class="flex items-center gap-3 mb-3">
                  <input type="radio" name="generationMode" value="dynamic" class="radio radio-primary" bind:group={createForm.generationMode} />
                  <Zap class="h-5 w-5 text-indigo-600" />
                  <span class="font-semibold text-indigo-700">Dynamic Generation</span>
                </div>
                <ul class="text-sm space-y-1 text-base-content/80">
                  <li>• Real-time content updates</li>
                  <li>• Server-side rendering</li>
                  <li>• Interactive features</li>
                  <li>• User authentication</li>
                </ul>
              </div>
            </div>
            
            <!-- Static Option -->
            <div class="card bg-base-200 border border-emerald-200 cursor-pointer hover:border-emerald-300 transition-colors">
              <div class="card-body p-4">
                <div class="flex items-center gap-3 mb-3">
                  <input type="radio" name="generationMode" value="static" class="radio radio-success" bind:group={createForm.generationMode} />
                  <Rocket class="h-5 w-5 text-emerald-600" />
                  <span class="font-semibold text-emerald-700">Static Generation</span>
                </div>
                <ul class="text-sm space-y-1 text-base-content/80">
                  <li>• Ultra-fast loading</li>
                  <li>• Perfect SEO</li>
                  <li>• CDN distribution</li>
                  <li>• High security</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal Footer -->
      <div class="flex items-center justify-end gap-3 p-6 border-t border-base-200">
        <button 
          class="btn btn-ghost"
          onclick={() => showCreateModal = false}
          disabled={creating}
        >
          Cancel
        </button>
        <button 
          class="btn btn-primary"
          onclick={createSite}
          disabled={creating}
        >
          {#if creating}
            <span class="loading loading-spinner loading-sm"></span>
            Creating...
          {:else}
            Create Site
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Custom text colors for generation modes */
  .text-indigo-600 {
    color: rgb(79 70 229);
  }
  
  .text-emerald-600 {
    color: rgb(5 150 105);
  }
</style>
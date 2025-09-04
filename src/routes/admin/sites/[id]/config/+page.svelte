<script>
  import { 
    ArrowLeft, 
    Zap, 
    Rocket, 
    Check, 
    Clock, 
    Globe,
    Users,
    Search,
    Shield,
    Database,
    Smartphone,
    Settings
  } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  import * as m from '$lib/paraglide/messages';
  
  let { data } = $props();
  
  let site = $state(data.site);
  let activeTab = $state();
  let saving = $state(false);
  
  // General tab form states
  let siteName = $state();
  let siteDescription = $state();
  let siteSlug = $state();
  
  // Form states - Use derived for initial values, separate state for user input
  let deploymentTarget = $state();
  let environment = $state();
  let autoDeploy = $state();
  let previewDeploys = $state();
  let edgeFunctions = $state();
  
  let buildStrategy = $state();
  let outputFormat = $state();
  let minifyHtml = $state();
  let minifyCSS = $state();
  let minifyJS = $state();
  let optimizeImages = $state();
  let generateSitemap = $state();
  let enableGzip = $state();
  
  // Initialize form state when site data is available
  $effect(() => {
    if (site) {
      activeTab = activeTab || 'general';
      
      // General settings
      siteName = site.name || '';
      siteDescription = site.description || '';
      siteSlug = site.slug || '';
      
      deploymentTarget = site.deploymentSettings?.target || 'cloudflare';
      environment = site.deploymentSettings?.environment || 'production';
      autoDeploy = site.deploymentSettings?.autoDeploy || false;
      previewDeploys = site.deploymentSettings?.previewDeploys || true;
      edgeFunctions = site.deploymentSettings?.edgeFunctions || false;
      
      buildStrategy = site.optimizationSettings?.buildStrategy || 'full';
      outputFormat = site.optimizationSettings?.outputFormat || 'html';
      minifyHtml = site.optimizationSettings?.minifyHtml !== false;
      minifyCSS = site.optimizationSettings?.minifyCSS !== false;
      minifyJS = site.optimizationSettings?.minifyJS !== false;
      optimizeImages = site.optimizationSettings?.optimizeImages !== false;
      generateSitemap = site.optimizationSettings?.generateSitemap !== false;
      enableGzip = site.optimizationSettings?.enableGzip !== false;
    }
  });
  
  // Save configuration
  async function saveConfiguration() {
    saving = true;
    
    try {
      const response = await fetch(`/api/sites/${site.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...site,
          name: siteName?.trim(),
          description: siteDescription?.trim() || null,
          slug: siteSlug?.trim(),
          generationMode: activeTab === 'general' ? site.generationMode : activeTab,
          deploymentSettings: {
            target: deploymentTarget,
            environment,
            autoDeploy,
            previewDeploys,
            edgeFunctions
          },
          optimizationSettings: {
            buildStrategy,
            outputFormat,
            minifyHtml,
            minifyCSS,
            minifyJS,
            optimizeImages,
            generateSitemap,
            enableGzip
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }
      
      const updatedSite = await response.json();
      site = updatedSite;
      
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert('Failed to save configuration');
    } finally {
      saving = false;
    }
  }
  
  
  // Format date
  function formatDate(date) {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }
</script>

<div class="min-h-screen bg-base-100 p-6">
  <!-- Back Navigation with Top Save Button -->
  <div class="mb-6 flex items-center justify-between">
    <button 
      onclick={() => goto('/admin/sites')}
      class="flex items-center gap-2 text-base-content/70 hover:text-base-content transition-colors"
    >
      <ArrowLeft class="h-4 w-4" />
      Back to Sites
    </button>
    
    <button 
      class="btn btn-sm text-white {activeTab === 'dynamic' ? 'bg-indigo-600 hover:bg-indigo-700' : activeTab === 'static' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-primary-focus'}"
      disabled={saving}
      onclick={saveConfiguration}
    >
      {#if saving}
        <span class="loading loading-spinner loading-xs"></span>
        Saving...
      {:else}
        Save Changes
      {/if}
    </button>
  </div>
  
  <!-- Configuration Container -->
  <div class="max-w-[740px]">
    <div class="card bg-base-100 shadow-xl border border-base-200">
      <!-- Site Header -->
      <div class="p-6 border-b border-base-200">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold">{site.name}</h1>
            {#if site.isDefault}
              <div class="badge badge-sm bg-primary/10 text-primary">Default</div>
            {/if}
            <div class="badge badge-sm {site.buildStatus === 'success' ? 'bg-success/10 text-success' : site.buildStatus === 'error' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'}">
              {site.buildStatus === 'success' ? 'Built' : site.buildStatus === 'error' ? 'Failed' : 'Building'}
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm text-base-content/60">
            <Globe class="h-4 w-4" />
            <span>{site.domain || site.slug || 'localhost:5173'}</span>
          </div>
        </div>
        {#if site.description}
          <p class="text-base-content/70">{site.description}</p>
        {/if}
      </div>
      
      <!-- Configuration Tabs -->
      <div class="border-b border-base-200">
        <nav class="flex">
          <button
            onclick={() => activeTab = 'general'}
            class="flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors {
              activeTab === 'general'
                ? 'border-primary text-primary'
                : 'border-transparent text-base-content/60 hover:text-base-content hover:border-base-300'
            }"
          >
            <Settings class="h-4 w-4" />
            General
          </button>
          <button
            onclick={() => activeTab = 'dynamic'}
            class="flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors {
              activeTab === 'dynamic'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-base-content/60 hover:text-base-content hover:border-base-300'
            }"
          >
            <Zap class="h-4 w-4" />
            Dynamic Generation
          </button>
          <button
            onclick={() => activeTab = 'static'}
            class="flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors {
              activeTab === 'static'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-base-content/60 hover:text-base-content hover:border-base-300'
            }"
          >
            <Rocket class="h-4 w-4" />
            Static Generation
          </button>
        </nav>
      </div>
      
      <!-- Tab Content -->
      <div class="p-6">
        {#if activeTab === 'general'}
          <!-- General Settings Tab -->
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings class="h-5 w-5 text-primary" />
                General Settings
              </h3>
              <p class="text-base-content/70 mb-6">Manage your site's basic information and settings.</p>
            </div>
            
            <div class="space-y-4">
              <div>
                <label for="site-name" class="label">
                  <span class="label-text">Site Name <span class="text-error">*</span></span>
                </label>
                <input 
                  id="site-name"
                  type="text" 
                  class="input input-bordered w-full" 
                  placeholder="My Awesome Site"
                  bind:value={siteName}
                />
              </div>
              
              <div>
                <label for="site-slug" class="label">
                  <span class="label-text">Site Slug <span class="text-error">*</span></span>
                </label>
                <div class="flex items-center">
                  <span class="text-sm text-base-content/60 bg-base-200 px-3 py-2 rounded-l-lg border border-r-0">yoursite.com/</span>
                  <input 
                    id="site-slug"
                    type="text" 
                    class="input input-bordered w-full rounded-l-none" 
                    placeholder="my-awesome-site"
                    bind:value={siteSlug}
                  />
                </div>
              </div>
              
              <div>
                <label for="site-description" class="label">
                  <span class="label-text">Description</span>
                </label>
                <textarea 
                  id="site-description"
                  class="textarea textarea-bordered w-full" 
                  placeholder="A brief description of your site..."
                  rows="3"
                  bind:value={siteDescription}
                ></textarea>
              </div>
            </div>
          </div>
          
        {:else if activeTab === 'dynamic'}
          <!-- Dynamic Generation Tab -->
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap class="h-5 w-5 text-indigo-600" />
                Dynamic Generation
              </h3>
              <ul class="space-y-2 text-sm text-base-content/80 mb-4">
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-success" />
                  Real-time content updates
                </li>
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-success" />
                  Server-side rendering (SSR)
                </li>
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-success" />
                  Interactive features & forms
                </li>
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-success" />
                  Database-driven content
                </li>
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-success" />
                  User authentication
                </li>
              </ul>
              
              <div class="alert border-2 border-indigo-200 bg-indigo-600/10">
                <Users class="h-4 w-4 text-indigo-600" />
                <div>
                  <div class="font-semibold text-indigo-700">Best for:</div>
                  <p class="text-sm text-indigo-700">Sites with frequently changing content, user interactions, or complex backend requirements</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 class="text-lg font-semibold mb-4">Deployment Configuration</h3>
              <div class="space-y-4">
                <div>
                  <label for="deployment-target" class="label">
                    <span class="label-text">Deployment Target</span>
                  </label>
                  <select 
                    id="deployment-target"
                    class="select select-bordered w-full"
                    bind:value={deploymentTarget}
                  >
                    <option value="cloudflare">Cloudflare Pages</option>
                    <option value="vercel">Vercel</option>
                    <option value="netlify">Netlify</option>
                  </select>
                </div>
                
                <div>
                  <label for="environment" class="label">
                    <span class="label-text">Environment</span>
                  </label>
                  <select 
                    id="environment"
                    class="select select-bordered w-full"
                    bind:value={environment}
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                  </select>
                </div>
                
                <div class="space-y-3">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-primary checkbox-sm"
                      bind:checked={autoDeploy}
                    />
                    <span class="label-text">Auto-deploy on content changes</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-primary checkbox-sm"
                      bind:checked={previewDeploys}
                    />
                    <span class="label-text">Generate preview deployments</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <h3 class="text-lg font-semibold mb-4">Dynamic Server Options</h3>
              <div class="space-y-4">
                <div class="space-y-3">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-primary checkbox-sm"
                      bind:checked={edgeFunctions}
                    />
                    <span class="label-text">Enable edge functions</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        {:else}
          <!-- Static Generation Tab -->
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <Rocket class="h-5 w-5 text-emerald-600" />
                Static Generation
              </h3>
              <ul class="space-y-2 text-sm text-base-content/80 mb-4">
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-success" />
                  Ultra-fast loading times
                </li>
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-success" />
                  Perfect SEO optimization
                </li>
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-success" />
                  Global CDN distribution
                </li>
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-success" />
                  High security & stability
                </li>
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-success" />
                  Low hosting costs
                </li>
              </ul>
              
              <div class="alert border-2 border-emerald-200 bg-emerald-600/10">
                <Search class="h-4 w-4 text-emerald-600" />
                <div>
                  <div class="font-semibold text-emerald-700">Best for:</div>
                  <p class="text-sm text-emerald-700">Marketing sites, portfolios, blogs, and content that doesn't change frequently</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 class="text-lg font-semibold mb-4">Deployment Configuration</h3>
              <div class="space-y-4">
                <div>
                  <label for="deployment-target-static" class="label">
                    <span class="label-text">Deployment Target</span>
                  </label>
                  <select 
                    id="deployment-target-static"
                    class="select select-bordered w-full"
                    bind:value={deploymentTarget}
                  >
                    <option value="cloudflare">Cloudflare Pages</option>
                    <option value="vercel">Vercel</option>
                    <option value="netlify">Netlify</option>
                  </select>
                </div>
                
                <div>
                  <label for="environment-static" class="label">
                    <span class="label-text">Environment</span>
                  </label>
                  <select 
                    id="environment-static"
                    class="select select-bordered w-full"
                    bind:value={environment}
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                  </select>
                </div>
                
                <div class="space-y-3">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-success checkbox-sm"
                      bind:checked={autoDeploy}
                    />
                    <span class="label-text">Auto-deploy on content changes</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-success checkbox-sm"
                      bind:checked={previewDeploys}
                    />
                    <span class="label-text">Generate preview deployments</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <h3 class="text-lg font-semibold mb-4">Static Build Options</h3>
              <div class="space-y-4">
                <div>
                  <label for="build-strategy" class="label">
                    <span class="label-text">Build Strategy</span>
                  </label>
                  <select 
                    id="build-strategy"
                    class="select select-bordered w-full"
                    bind:value={buildStrategy}
                  >
                    <option value="full">Full Site Generation</option>
                    <option value="incremental">Incremental Builds</option>
                    <option value="ondemand">On-Demand ISR</option>
                  </select>
                </div>
                
                <div>
                  <label for="output-format" class="label">
                    <span class="label-text">Output Format</span>
                  </label>
                  <select 
                    id="output-format"
                    class="select select-bordered w-full"
                    bind:value={outputFormat}
                  >
                    <option value="html">HTML + Assets</option>
                    <option value="spa">SPA (Single Page App)</option>
                    <option value="hybrid">Hybrid (SSG + SPA)</option>
                  </select>
                </div>
                
                <div class="space-y-2">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-success checkbox-sm"
                      bind:checked={minifyHtml}
                    />
                    <span class="label-text">Minify HTML</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-success checkbox-sm"
                      bind:checked={minifyCSS}
                    />
                    <span class="label-text">Minify CSS</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-success checkbox-sm"
                      bind:checked={minifyJS}
                    />
                    <span class="label-text">Minify JavaScript</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-success checkbox-sm"
                      bind:checked={optimizeImages}
                    />
                    <span class="label-text">Optimize images</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-success checkbox-sm"
                      bind:checked={generateSitemap}
                    />
                    <span class="label-text">Generate sitemap</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-success checkbox-sm"
                      bind:checked={enableGzip}
                    />
                    <span class="label-text">Enable Gzip compression</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        {/if}
        
        <!-- Footer Actions -->
        <div class="mt-6 flex items-center justify-between pt-4 border-t border-base-200">
          <div class="text-sm text-base-content/60 flex items-center gap-2">
            <Clock class="h-4 w-4" />
            {#if activeTab === 'general'}
              Site created: {formatDate(site.createdAt)}
            {:else if activeTab === 'dynamic'}
              Last deployed: {formatDate(site.lastBuildAt)}
            {:else}
              Last static build: {formatDate(site.lastBuildAt)}
            {/if}
          </div>
          <div>
            <button 
              class="btn btn-sm text-white {activeTab === 'dynamic' ? 'bg-indigo-600 hover:bg-indigo-700' : activeTab === 'static' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-primary-focus'}"
              disabled={saving}
              onclick={saveConfiguration}
            >
              {#if saving}
                <span class="loading loading-spinner loading-xs"></span>
                Saving...
              {:else}
                Save Changes
              {/if}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* Custom text colors for generation modes */
  .text-indigo-600 {
    color: rgb(79 70 229);
  }
  
  .text-emerald-600 {
    color: rgb(5 150 105);
  }
  
  .bg-indigo-600 {
    background-color: rgb(79 70 229);
  }
  
  .hover\:bg-indigo-700:hover {
    background-color: rgb(67 56 202);
  }
  
  .bg-emerald-600 {
    background-color: rgb(5 150 105);
  }
  
  .hover\:bg-emerald-700:hover {
    background-color: rgb(4 120 87);
  }
  
  .border-indigo-500 {
    border-color: rgb(99 102 241);
  }
  
  .border-emerald-500 {
    border-color: rgb(16 185 129);
  }
</style>
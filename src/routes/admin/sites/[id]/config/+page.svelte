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
    Settings,
    Languages,
    Plus,
    X,
    Archive,
    AlertTriangle,
    Trash2,
    RotateCcw
  } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  import * as m from '$lib/paraglide/messages';
  
  let { data } = $props();
  
  let site = $state(data.site);
  let activeTab = $state();
  let saving = $state(false);
  
  // Archive functionality state
  let showArchiveModal = $state(false);
  let showPermanentDeleteModal = $state(false);
  let archiving = $state(false);
  let archivedSites = $state([]); // Mock data - in real implementation this would come from API
  
  // General tab form states
  let siteName = $state();
  let siteDescription = $state();
  let siteSlug = $state();
  let siteLanguages = $state([]);
  let siteDefaultLanguage = $state('en');
  
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
      siteLanguages = typeof site.languages === 'string' 
        ? JSON.parse(site.languages) 
        : site.languages || ['en'];
      siteDefaultLanguage = site.defaultLanguage || 'en';
      
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
  
  // Archive site functionality (UI only)
  async function archiveSite() {
    archiving = true;
    
    try {
      // TODO: Implement actual archive API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      
      // Mock response - in real implementation this would update the database
      console.log('Site would be archived:', site.id);
      alert('Site archive functionality - UI implementation complete. Backend logic needed.');
      
      showArchiveModal = false;
    } catch (error) {
      console.error('Archive failed:', error);
      alert(`Archive failed: ${error.message}`);
    } finally {
      archiving = false;
    }
  }
  
  // Restore site functionality (UI only)
  async function restoreSite(archivedSite) {
    try {
      // TODO: Implement actual restore API call
      console.log('Site would be restored:', archivedSite.id);
      alert('Site restore functionality - UI implementation complete. Backend logic needed.');
    } catch (error) {
      console.error('Restore failed:', error);
      alert(`Restore failed: ${error.message}`);
    }
  }
  
  // Permanent delete functionality (UI only)
  async function permanentDeleteSite(archivedSite) {
    try {
      // TODO: Implement actual permanent delete API call
      console.log('Site would be permanently deleted:', archivedSite.id);
      alert('Permanent delete functionality - UI implementation complete. Backend logic needed.');
      
      showPermanentDeleteModal = false;
    } catch (error) {
      console.error('Permanent delete failed:', error);
      alert(`Permanent delete failed: ${error.message}`);
    }
  }
  
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
          languages: siteLanguages,
          defaultLanguage: siteDefaultLanguage,
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
      
      alert(m.sites_config_save_success());
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert(m.sites_config_save_error());
    } finally {
      saving = false;
    }
  }

  // Available languages with their display names
  const availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'pt-br', name: 'Português (Brasil)' },
    { code: 'ru', name: 'Русский' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'zh', name: '中文' },
    { code: 'ar', name: 'العربية' },
    { code: 'hi', name: 'हिन्दी' }
  ];

  // Language management functions
  const addLanguage = (languageCode) => {
    if (!siteLanguages.includes(languageCode)) {
      siteLanguages = [...siteLanguages, languageCode];
      
      // Set as default if it's the first language
      if (siteLanguages.length === 1) {
        siteDefaultLanguage = languageCode;
      }
    }
  };

  const removeLanguage = (languageCode) => {
    if (siteLanguages.length > 1) { // Don't allow removing the last language
      siteLanguages = siteLanguages.filter(lang => lang !== languageCode);
      
      // Update default language if removed
      if (siteDefaultLanguage === languageCode) {
        siteDefaultLanguage = siteLanguages[0];
      }
    }
  };

  const getLanguageName = (code) => {
    const lang = availableLanguages.find(l => l.code === code);
    return lang ? lang.name : code.toUpperCase();
  };
  
  
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
      {m.sites_config_back_to_sites()}
    </button>
    
    <button 
      class="btn btn-sm text-white {activeTab === 'dynamic' ? 'bg-indigo-600 hover:bg-indigo-700' : activeTab === 'static' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-primary-focus'}"
      disabled={saving}
      onclick={saveConfiguration}
    >
      {#if saving}
        <span class="loading loading-spinner loading-xs"></span>
        {m.sites_config_saving()}
      {:else}
        {m.sites_config_save_changes()}
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
              {site.buildStatus === 'success' ? m.sites_config_status_built() : site.buildStatus === 'error' ? m.sites_config_status_failed() : m.sites_config_status_building()}
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
            {m.sites_config_tab_general()}
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
            {m.sites_config_tab_dynamic()}
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
            {m.sites_config_tab_static()}
          </button>
          <button
            onclick={() => activeTab = 'archive'}
            class="flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors {
              activeTab === 'archive'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-base-content/60 hover:text-base-content hover:border-base-300'
            }"
          >
            <Archive class="h-4 w-4" />
            {m.sites_config_tab_archive()}
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
                {m.sites_config_general_title()}
              </h3>
              <p class="text-base-content/70 mb-6">{m.sites_config_general_description()}</p>
            </div>
            
            <div class="space-y-4">
              <div>
                <label for="site-name" class="label">
                  <span class="label-text">{m.sites_config_form_site_name()} <span class="text-error">*</span></span>
                </label>
                <input 
                  id="site-name"
                  type="text" 
                  class="input input-bordered w-full" 
                  placeholder={m.sites_config_form_site_name_placeholder()}
                  bind:value={siteName}
                />
              </div>
              
              <div>
                <label for="site-slug" class="label">
                  <span class="label-text">{m.sites_config_form_site_slug()} <span class="text-error">*</span></span>
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
                  <span class="label-text">{m.sites_config_form_description()}</span>
                </label>
                <textarea 
                  id="site-description"
                  class="textarea textarea-bordered w-full" 
                  placeholder={m.sites_config_form_description_placeholder()}
                  rows="3"
                  bind:value={siteDescription}
                ></textarea>
              </div>
              
              <!-- Language Configuration Section -->
              <div>
                <label class="label">
                  <span class="label-text flex items-center gap-2">
                    <Languages class="h-4 w-4" />
                    {m.sites_config_languages_title()}
                  </span>
                </label>
                <div class="space-y-4">
                  <!-- Current Languages -->
                  <div class="space-y-2">
                    {#each siteLanguages as language}
                      <div class="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                        <div class="flex items-center gap-3">
                          <span class="text-sm font-medium">{getLanguageName(language)}</span>
                          <span class="text-xs text-base-content/60 font-mono bg-base-300 px-2 py-1 rounded">
                            {language}
                          </span>
                          {#if language === siteDefaultLanguage}
                            <div class="badge badge-primary badge-sm">{m.sites_config_languages_default()}</div>
                          {/if}
                        </div>
                        <div class="flex items-center gap-2">
                          {#if language !== siteDefaultLanguage && siteLanguages.length > 1}
                            <button
                              type="button"
                              class="btn btn-xs btn-outline"
                              onclick={() => siteDefaultLanguage = language}
                              title="Set as default language"
                            >
                              {m.sites_config_languages_set_default()}
                            </button>
                          {/if}
                          {#if siteLanguages.length > 1}
                            <button
                              type="button"
                              class="btn btn-xs btn-ghost text-error hover:bg-error/10"
                              onclick={() => removeLanguage(language)}
                              title="Remove language"
                            >
                              <X class="h-3 w-3" />
                            </button>
                          {/if}
                        </div>
                      </div>
                    {/each}
                  </div>
                  
                  <!-- Add Language -->
                  <div class="flex gap-2">
                    <select 
                      class="select select-bordered select-sm flex-1"
                      onchange={(e) => {
                        if (e.target.value) {
                          addLanguage(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">{m.sites_config_languages_add()}</option>
                      {#each availableLanguages as lang}
                        {#if !siteLanguages.includes(lang.code)}
                          <option value={lang.code}>{lang.name} ({lang.code})</option>
                        {/if}
                      {/each}
                    </select>
                  </div>
                  
                  <!-- Language Configuration Info -->
                  <div class="text-xs text-base-content/70 bg-info/10 border border-info/20 rounded-lg p-3">
                    <div class="flex items-start gap-2">
                      <Globe class="h-4 w-4 text-info flex-shrink-0 mt-0.5" />
                      <div>
                        <p class="font-medium text-info mb-1">{m.sites_config_languages_config_title()}</p>
                        {#if siteLanguages.length === 1}
                          <p>{@html m.sites_config_languages_single({language: getLanguageName(siteDefaultLanguage)})}</p>
                        {:else}
                          <p>{@html m.sites_config_languages_multi({count: siteLanguages.length, language: getLanguageName(siteDefaultLanguage)})}</p>
                        {/if}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        {:else if activeTab === 'dynamic'}
          <!-- Dynamic Generation Tab -->
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap class="h-5 w-5 text-indigo-600" />
                {m.sites_config_dynamic_title()}
              </h3>
              <ul class="space-y-2 text-sm text-base-content/80 mb-4">
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-success" />
                  {m.sites_config_dynamic_feature_1()}
                </li>
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-success" />
                  {m.sites_config_dynamic_feature_2()}
                </li>
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-success" />
                  {m.sites_config_dynamic_feature_3()}
                </li>
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-success" />
                  {m.sites_config_dynamic_feature_4()}
                </li>
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-success" />
                  {m.sites_config_dynamic_feature_5()}
                </li>
              </ul>
              
              <div class="alert border-2 border-indigo-200 bg-indigo-600/10">
                <Users class="h-4 w-4 text-indigo-600" />
                <div>
                  <div class="font-semibold text-indigo-700">{m.sites_config_dynamic_best_for()}</div>
                  <p class="text-sm text-indigo-700">{m.sites_config_dynamic_best_for_description()}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 class="text-lg font-semibold mb-4">{m.sites_config_deployment_title()}</h3>
              <div class="space-y-4">
                <div>
                  <label for="deployment-target" class="label">
                    <span class="label-text">{m.sites_config_deployment_target()}</span>
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
                    <span class="label-text">{m.sites_config_environment()}</span>
                  </label>
                  <select 
                    id="environment"
                    class="select select-bordered w-full"
                    bind:value={environment}
                  >
                    <option value="production">{m.sites_config_environment_production()}</option>
                    <option value="staging">{m.sites_config_environment_staging()}</option>
                    <option value="development">{m.sites_config_environment_development()}</option>
                  </select>
                </div>
                
                <div class="space-y-3">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-primary checkbox-sm"
                      bind:checked={autoDeploy}
                    />
                    <span class="label-text">{m.sites_config_auto_deploy()}</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-primary checkbox-sm"
                      bind:checked={previewDeploys}
                    />
                    <span class="label-text">{m.sites_config_preview_deploys()}</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <h3 class="text-lg font-semibold mb-4">{m.sites_config_dynamic_server_title()}</h3>
              <div class="space-y-4">
                <div class="space-y-3">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-primary checkbox-sm"
                      bind:checked={edgeFunctions}
                    />
                    <span class="label-text">{m.sites_config_edge_functions()}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        {:else if activeTab === 'static'}
          <!-- Static Generation Tab -->
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <Rocket class="h-5 w-5 text-emerald-600" />
                {m.sites_config_static_title()}
              </h3>
              <ul class="space-y-2 text-sm text-base-content/80 mb-4">
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-success" />
                  {m.sites_config_static_feature_1()}
                </li>
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-success" />
                  {m.sites_config_static_feature_2()}
                </li>
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-success" />
                  {m.sites_config_static_feature_3()}
                </li>
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-success" />
                  {m.sites_config_static_feature_4()}
                </li>
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-success" />
                  {m.sites_config_static_feature_5()}
                </li>
              </ul>
              
              <div class="alert border-2 border-emerald-200 bg-emerald-600/10">
                <Search class="h-4 w-4 text-emerald-600" />
                <div>
                  <div class="font-semibold text-emerald-700">{m.sites_config_static_best_for()}</div>
                  <p class="text-sm text-emerald-700">{m.sites_config_static_best_for_description()}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 class="text-lg font-semibold mb-4">{m.sites_config_deployment_title()}</h3>
              <div class="space-y-4">
                <div>
                  <label for="deployment-target-static" class="label">
                    <span class="label-text">{m.sites_config_deployment_target()}</span>
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
                    <span class="label-text">{m.sites_config_environment()}</span>
                  </label>
                  <select 
                    id="environment-static"
                    class="select select-bordered w-full"
                    bind:value={environment}
                  >
                    <option value="production">{m.sites_config_environment_production()}</option>
                    <option value="staging">{m.sites_config_environment_staging()}</option>
                    <option value="development">{m.sites_config_environment_development()}</option>
                  </select>
                </div>
                
                <div class="space-y-3">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-success checkbox-sm"
                      bind:checked={autoDeploy}
                    />
                    <span class="label-text">{m.sites_config_auto_deploy()}</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-success checkbox-sm"
                      bind:checked={previewDeploys}
                    />
                    <span class="label-text">{m.sites_config_preview_deploys()}</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <h3 class="text-lg font-semibold mb-4">{m.sites_config_static_build_title()}</h3>
              <div class="space-y-4">
                <div>
                  <label for="build-strategy" class="label">
                    <span class="label-text">{m.sites_config_build_strategy()}</span>
                  </label>
                  <select 
                    id="build-strategy"
                    class="select select-bordered w-full"
                    bind:value={buildStrategy}
                  >
                    <option value="full">{m.sites_config_build_strategy_full()}</option>
                    <option value="incremental">{m.sites_config_build_strategy_incremental()}</option>
                    <option value="ondemand">{m.sites_config_build_strategy_ondemand()}</option>
                  </select>
                </div>
                
                <div>
                  <label for="output-format" class="label">
                    <span class="label-text">{m.sites_config_output_format()}</span>
                  </label>
                  <select 
                    id="output-format"
                    class="select select-bordered w-full"
                    bind:value={outputFormat}
                  >
                    <option value="html">{m.sites_config_output_format_html()}</option>
                    <option value="spa">{m.sites_config_output_format_spa()}</option>
                    <option value="hybrid">{m.sites_config_output_format_hybrid()}</option>
                  </select>
                </div>
                
                <div class="space-y-2">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-success checkbox-sm"
                      bind:checked={minifyHtml}
                    />
                    <span class="label-text">{m.sites_config_minify_html()}</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-success checkbox-sm"
                      bind:checked={minifyCSS}
                    />
                    <span class="label-text">{m.sites_config_minify_css()}</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-success checkbox-sm"
                      bind:checked={minifyJS}
                    />
                    <span class="label-text">{m.sites_config_minify_js()}</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-success checkbox-sm"
                      bind:checked={optimizeImages}
                    />
                    <span class="label-text">{m.sites_config_optimize_images()}</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-success checkbox-sm"
                      bind:checked={generateSitemap}
                    />
                    <span class="label-text">{m.sites_config_generate_sitemap()}</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      class="checkbox checkbox-success checkbox-sm"
                      bind:checked={enableGzip}
                    />
                    <span class="label-text">{m.sites_config_enable_gzip()}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        {:else if activeTab === 'archive'}
          <!-- Archive Tab -->
          <div class="space-y-6">
            <!-- Archive Current Site Section -->
            <div>
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <Archive class="h-5 w-5 text-red-600" />
                {m.sites_archive_title()}
              </h3>
              <p class="text-base-content/70 mb-6">{m.sites_archive_description()}</p>
              
              <!-- Warning Alert -->
              <div class="alert border-2 border-orange-200 bg-orange-600/10 mb-6">
                <AlertTriangle class="h-4 w-4 text-orange-600" />
                <div>
                  <div class="font-semibold text-orange-700">{m.sites_archive_warning_title()}</div>
                  <p class="text-sm text-orange-700">{m.sites_archive_warning_message()}</p>
                </div>
              </div>
              
              <!-- Archive Button -->
              <button 
                class="btn btn-outline border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600"
                onclick={() => showArchiveModal = true}
                disabled={archiving}
              >
                <Archive class="h-4 w-4" />
                {m.sites_archive_button()}
              </button>
            </div>
            
            <!-- Archived Sites List -->
            <div class="border-t border-base-200 pt-6">
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trash2 class="h-5 w-5 text-base-content/60" />
                {m.sites_archive_list_title()}
              </h3>
              
              {#if archivedSites.length === 0}
                <!-- Empty State -->
                <div class="text-center py-12">
                  <Archive class="h-12 w-12 mx-auto text-base-content/30 mb-4" />
                  <h4 class="text-lg font-medium text-base-content/70 mb-2">{m.sites_archive_list_empty()}</h4>
                  <p class="text-base-content/50 text-sm">{m.sites_archive_list_empty_description()}</p>
                </div>
              {:else}
                <!-- Archived Sites Cards -->
                <div class="space-y-4">
                  {#each archivedSites as archivedSite}
                    <div class="border border-base-200 rounded-lg p-4 bg-base-50">
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <h4 class="font-medium text-base-content/80 mb-1">{archivedSite.name}</h4>
                          <p class="text-sm text-base-content/60 mb-2">{archivedSite.description || 'No description'}</p>
                          <div class="flex items-center gap-4 text-xs text-base-content/50">
                            <div class="flex items-center gap-1">
                              <Clock class="h-3 w-3" />
                              {m.sites_archive_archived_on()} {formatDate(archivedSite.archivedAt)}
                            </div>
                            <div class="flex items-center gap-1">
                              <Globe class="h-3 w-3" />
                              {archivedSite.domain || archivedSite.slug}
                            </div>
                          </div>
                        </div>
                        
                        <div class="flex items-center gap-2 ml-4">
                          <button 
                            class="btn btn-sm btn-outline border-success text-success hover:bg-success hover:text-white"
                            onclick={() => restoreSite(archivedSite)}
                            title="Restore site"
                          >
                            <RotateCcw class="h-3 w-3" />
                            {m.sites_archive_restore_button()}
                          </button>
                          <button 
                            class="btn btn-sm btn-outline border-error text-error hover:bg-error hover:text-white"
                            onclick={() => showPermanentDeleteModal = true}
                            title="Delete permanently"
                          >
                            <Trash2 class="h-3 w-3" />
                            {m.sites_archive_permanent_delete_button()}
                          </button>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        {/if}
        
        <!-- Footer Actions -->
        <div class="mt-6 flex items-center justify-between pt-4 border-t border-base-200">
          <div class="text-sm text-base-content/60 flex items-center gap-2">
            <Clock class="h-4 w-4" />
            {#if activeTab === 'general'}
              {m.sites_config_site_created()} {formatDate(site.createdAt)}
            {:else if activeTab === 'dynamic'}
              {m.sites_config_last_deployed()} {formatDate(site.lastBuildAt)}
            {:else if activeTab === 'static'}
              {m.sites_config_last_static_build()} {formatDate(site.lastBuildAt)}
            {:else if activeTab === 'archive'}
              {m.sites_config_site_created()} {formatDate(site.createdAt)}
            {/if}
          </div>
          <div>
            {#if activeTab !== 'archive'}
              <button 
                class="btn btn-sm text-white {activeTab === 'dynamic' ? 'bg-indigo-600 hover:bg-indigo-700' : activeTab === 'static' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-primary-focus'}"
                disabled={saving}
                onclick={saveConfiguration}
              >
              {#if saving}
                <span class="loading loading-spinner loading-xs"></span>
                {m.sites_config_saving()}
                {:else}
                  {m.sites_config_save_changes()}
                {/if}
              </button>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Archive Confirmation Modal -->
{#if showArchiveModal}
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-base-100 rounded-lg shadow-xl w-full max-w-md">
      <!-- Modal Header -->
      <div class="p-6 border-b border-base-200">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold flex items-center gap-2">
            <Archive class="h-5 w-5 text-orange-600" />
            {m.sites_archive_confirm_title()}
          </h2>
          <button 
            class="btn btn-ghost btn-sm btn-circle"
            onclick={() => showArchiveModal = false}
            disabled={archiving}
          >
            ✕
          </button>
        </div>
      </div>
      
      <!-- Modal Content -->
      <div class="p-6">
        <div class="alert border-2 border-orange-200 bg-orange-600/10 mb-4">
          <AlertTriangle class="h-4 w-4 text-orange-600" />
          <p class="text-sm text-orange-700">{m.sites_archive_confirm_message()}</p>
        </div>
        
        <div class="text-sm text-base-content/70 space-y-2">
          <p><strong>Site:</strong> {site.name}</p>
          {#if site.domain || site.slug}
            <p><strong>URL:</strong> {site.domain || site.slug}</p>
          {/if}
        </div>
      </div>
      
      <!-- Modal Footer -->
      <div class="flex items-center justify-end gap-3 p-6 border-t border-base-200 bg-base-50">
        <button 
          class="btn btn-outline"
          onclick={() => showArchiveModal = false}
          disabled={archiving}
        >
          Cancel
        </button>
        <button 
          class="btn bg-orange-600 hover:bg-orange-700 text-white"
          onclick={archiveSite}
          disabled={archiving}
        >
          {#if archiving}
            <span class="loading loading-spinner loading-sm"></span>
            Archiving...
          {:else}
            <Archive class="h-4 w-4" />
            {m.sites_archive_button()}
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Permanent Delete Confirmation Modal -->
{#if showPermanentDeleteModal}
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-base-100 rounded-lg shadow-xl w-full max-w-md">
      <!-- Modal Header -->
      <div class="p-6 border-b border-base-200">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold flex items-center gap-2">
            <Trash2 class="h-5 w-5 text-red-600" />
            {m.sites_archive_permanent_delete_confirm_title()}
          </h2>
          <button 
            class="btn btn-ghost btn-sm btn-circle"
            onclick={() => showPermanentDeleteModal = false}
          >
            ✕
          </button>
        </div>
      </div>
      
      <!-- Modal Content -->
      <div class="p-6">
        <div class="alert border-2 border-red-200 bg-red-600/10 mb-4">
          <AlertTriangle class="h-4 w-4 text-red-600" />
          <p class="text-sm text-red-700">{m.sites_archive_permanent_delete_confirm_message()}</p>
        </div>
        
        <div class="text-sm text-base-content/70">
          <p>This action <strong>cannot be undone</strong> and will permanently remove all associated data.</p>
        </div>
      </div>
      
      <!-- Modal Footer -->
      <div class="flex items-center justify-end gap-3 p-6 border-t border-base-200 bg-base-50">
        <button 
          class="btn btn-outline"
          onclick={() => showPermanentDeleteModal = false}
        >
          Cancel
        </button>
        <button 
          class="btn btn-error text-white"
          onclick={() => permanentDeleteSite(null)} 
        >
          <Trash2 class="h-4 w-4" />
          Delete Permanently
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
  
  .text-red-600 {
    color: rgb(220 38 38);
  }
  
  .border-red-500 {
    border-color: rgb(239 68 68);
  }
  
  .bg-orange-600 {
    background-color: rgb(234 88 12);
  }
  
  .hover\:bg-orange-700:hover {
    background-color: rgb(194 65 12);
  }
</style>
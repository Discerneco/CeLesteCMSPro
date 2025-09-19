<script>
  import { 
    Eye, 
    Globe2, 
    Globe,
    Computer,
    Play, 
    Settings, 
    Upload, 
    Zap,
    Rocket,
    ExternalLink,
    Calendar,
    Clock,
    Check,
    User,
    Server,
    FileDown,
    MoreVertical,
    Edit3,
    Trash2,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    FileText,
    FileImage,
    Settings2,
    Layout,
    X,
    Info,
    Star
  } from '@lucide/svelte';
  
  import * as m from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime.js';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import BuildProgressModal from '$lib/components/BuildProgressModal.svelte';

  // Sites data loaded from API
  let sites = $state([]);

  let loading = $state(false);
  let generatingId = $state(null);
  let toggleGenerationId = $state(null);
  
  // Create site modal state
  let showCreateModal = $state(false);
  let creating = $state(false);
  
  // Build progress modal state
  let showBuildModal = $state(false);
  let buildingSite = $state(null);
  
  
  
  // Create site form state
  let createForm = $state({
    name: '',
    description: '',
    slug: '',
    generationMode: 'dynamic'
  });
  
  // Wizard state management
  let currentStep = $state(1);
  const totalSteps = 3;
  
  // Auto-slug generation with accent conversion
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .normalize('NFD')                    // Decompose accents from letters
      .replace(/[\u0300-\u036f]/g, '')     // Remove the accent marks
      .replace(/[^a-z0-9\s-]/g, '')        // Remove remaining special characters
      .replace(/\s+/g, '-')                // Convert spaces to hyphens
      .replace(/^-+|-+$/g, '');           // Remove leading/trailing hyphens
  };
  
  // Wizard navigation
  const nextStep = () => {
    if (currentStep < totalSteps) {
      currentStep += 1;
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      currentStep -= 1;
    }
  };
  
  // Auto-generate slug from name
  const handleNameChange = (event) => {
    const newName = event.target.value;
    const previousSlug = createForm.slug;
    const expectedSlug = generateSlug(createForm.name);
    
    createForm.name = newName;
    
    // Auto-generate slug if it's empty or matches the previously generated slug
    if (!previousSlug || previousSlug === expectedSlug) {
      createForm.slug = generateSlug(newName);
    }
  };
  
  // Step validation
  const canProceed = (step) => {
    switch (step) {
      case 1:
        return createForm.name.trim() && createForm.slug.trim();
      case 2:
        return createForm.generationMode;
      default:
        return true;
    }
  };

  // Generate site static files
  async function generateSite(site) {
    console.log(`🏗️ Starting site generation for: ${site.name}`);
    
    // Show build modal
    buildingSite = site;
    showBuildModal = true;
    
    // Update site status to building immediately
    const updatedSites = sites.map(s => 
      s.id === site.id 
        ? { ...s, buildStatus: 'building' }
        : s
    );
    sites = updatedSites;
    
    try {
      // Call actual site generation API in background
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
      
      // Close modal and show error
      showBuildModal = false;
      alert(`Site generation failed: ${error.message}`);
    }
  }

  // Preview site (navigate to dedicated preview page)
  function previewSite(site) {
    console.log(`👁️ Opening preview for: ${site.name}`);
    
    // Check if site has been generated
    if (site.buildStatus !== 'success') {
      alert('Please generate the site first before previewing.');
      return;
    }
    
    // Navigate to dedicated preview page
    goto(`/admin/sites/${site.id}/preview`);
  }

  // Quick external preview (open in new tab)
  function quickPreviewSite(site) {
    console.log(`🔗 Opening external preview for: ${site.name}`);
    
    // Check if site has been generated
    if (site.buildStatus !== 'success') {
      alert('Please generate the site first before previewing.');
      return;
    }
    
    // Use sites symlink serving (like Finder)
    const previewUrl = `/sites/${site.slug}`;
    window.open(previewUrl, '_blank');
  }

  // Configure site
  function configureSite(site) {
    console.log(`⚙️ Opening configuration for: ${site.name}`);
    goto(`/admin/sites/${site.id}/config`);
  }

  // Duplicate site
  function duplicateSite(site) {
    console.log(`📋 Duplicating site: ${site.name}`);
    // TODO: Implement site duplication functionality
    alert('Site duplication feature coming soon!');
  }

  // Export site
  function exportSite(site) {
    console.log(`📤 Exporting site: ${site.name}`);
    // TODO: Implement site export functionality
    alert('Site export feature coming soon!');
  }

  // Delete site
  function deleteSite(site) {
    console.log(`🗑️ Deleting site: ${site.name}`);
    // TODO: Implement site deletion functionality
    if (confirm(`Are you sure you want to delete "${site.name}"? This action cannot be undone.`)) {
      alert('Site deletion feature coming soon!');
    }
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
      case 'building': return m.sites_status_building();
      case 'success': return m.sites_status_success();
      case 'error': return m.sites_status_failed();
      default: return m.sites_status_ready();
    }
  }

  // Get sync status text and styling
  function getSyncStatusInfo(syncStatus) {
    switch (syncStatus) {
      case 'up-to-date':
        return {
          text: m.sites_sync_status_up_to_date(),
          className: 'bg-success/10 text-success',
          icon: CheckCircle2,
          tooltip: m.sites_sync_tooltip_up_to_date()
        };
      case 'out-of-sync':
        return {
          text: m.sites_sync_status_out_of_sync(),
          className: 'bg-warning/10 text-warning',
          icon: RefreshCw,
          tooltip: m.sites_sync_tooltip_out_of_sync()
        };
      default:
        return {
          text: m.sites_sync_status_unknown(),
          className: 'bg-base-content/10 text-base-content/70',
          icon: AlertTriangle,
          tooltip: 'Unable to determine sync status'
        };
    }
  }

  // Format sync changes for tooltip
  function formatSyncChanges(contentChanges) {
    if (!contentChanges) return '';
    
    const changes = [];
    if (contentChanges.hasNewPosts) changes.push(m.sites_sync_changes_new_posts());
    if (contentChanges.hasUpdatedPosts) changes.push(m.sites_sync_changes_updated_posts());
    if (contentChanges.hasNewPages) changes.push(m.sites_sync_changes_new_pages());
    if (contentChanges.hasUpdatedPages) changes.push(m.sites_sync_changes_updated_pages());
    if (contentChanges.hasNewMedia) changes.push(m.sites_sync_changes_new_media());
    if (contentChanges.hasSettingsChanges) changes.push(m.sites_sync_changes_settings());
    if (contentChanges.hasTemplateChanges) changes.push(m.sites_sync_changes_template());
    
    return changes.join(', ');
  }


  // Get icon for content type
  function getContentTypeIcon(type) {
    switch (type) {
      case 'posts': return FileText;
      case 'pages': return FileText;
      case 'media': return FileImage;
      case 'settings': return Settings2;
      case 'template': return Layout;
      default: return FileText;
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

  // Format date for display with locale-aware formatting
  function formatDate(date) {
    if (!date) return m.common_never();
    const currentLocale = getLocale();
    
    // Use different time formats based on locale
    const timeFormat = currentLocale === 'pt-br' ? 
      { hour: '2-digit', minute: '2-digit', hour12: false } :  // 24-hour for Portuguese
      { hour: '2-digit', minute: '2-digit', hour12: true };    // 12-hour for English
      
    return new Intl.DateTimeFormat(currentLocale, {
      month: 'short',
      day: 'numeric',
      ...timeFormat
    }).format(new Date(date));
  }

  // Get generation mode colors and styling
  function getGenerationModeStyle(mode) {
    return mode === 'dynamic' 
      ? { color: 'indigo', buttonClass: 'bg-indigo-600 hover:bg-indigo-700', textClass: 'text-indigo-600' }
      : { color: 'emerald', buttonClass: 'bg-emerald-600 hover:bg-emerald-700', textClass: 'text-emerald-600' };
  }

  // Get DaisyUI status class based on status
  function getStatusClass(status) {
    switch (status) {
      case 'green': return 'status status-success status-lg';
      case 'yellow': return 'status status-warning status-lg';
      case 'red': return 'status status-error status-lg';
      case 'blue': return 'status status-info status-lg';
      case 'purple': return 'status status-primary status-lg';
      case 'gray': return 'status status-neutral status-lg';
      default: return 'status status-neutral status-lg';
    }
  }

  // Get actual status message instead of generic category names
  function getActualStatusMessage(statusDot, fallbackMessage = 'Unknown') {
    if (statusDot?.message) {
      return statusDot.message;
    }
    return fallbackMessage;
  }

  // Get meaningful health status message based on status color
  function getHealthStatusMessage(statusDot) {
    if (statusDot?.message) {
      return statusDot.message;
    }
    
    // Generate meaningful message based on status color
    switch (statusDot?.status) {
      case 'green':
        return m.sites_health_all_ok();
      case 'red':
        return m.sites_health_issues();
      case 'yellow':
        return m.sites_health_database_slow();
      default:
        return m.sites_status_health_title(); // Fallback to generic
    }
  }

  // Get sync status message based on site data
  function getSyncStatusMessage(site) {
    if (site.generationMode === 'dynamic') {
      // For dynamic sites, show data layer status
      if (site.statusDots?.syncData?.message) {
        return site.statusDots.syncData.message;
      }
      return 'Data layer status unknown';
    } else {
      // For static sites, show sync status with more specific messages
      if (site.syncStatus === 'up-to-date') {
        return m.sites_sync_status_up_to_date();
      } else if (site.syncStatus === 'out-of-sync') {
        return m.sites_sync_not_synced(); // More specific than "Content updated"
      } else {
        return m.sites_sync_never_built(); // More specific than "Unknown"
      }
    }
  }

  // Get clean display URL (short version for cards)
  function getDisplayUrl(site) {
    if (!site.domain && (!site.deploymentSettings?.target || site.deploymentSettings.target === 'development')) {
      // Localhost development
      const serverUrl = site.statusDots?.health?.serverUrl || 'localhost:5173';
      // Extract just the base part: localhost:5173 (without /sites/slug)
      return serverUrl.split('/sites/')[0] || serverUrl;
    }
    
    if (site.domain) {
      // Has external domain
      return site.domain;
    }
    
    // Check if site is actually published/built
    if (site.buildStatus === 'success' && site.lastBuildAt) {
      return site.slug;
    }
    
    // Not published - show "Not available"
    return 'Not available';
  }

  // Get full URL for tooltips and actions
  function getFullUrl(site) {
    if (!site.domain && (!site.deploymentSettings?.target || site.deploymentSettings.target === 'development')) {
      return site.statusDots?.health?.serverUrl || 'localhost:5173';
    }
    return site.domain || site.slug;
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
      currentStep = 1;
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
<div class="cms-page-header">
  <div>
    <h1 class="cms-page-title">{m.sites_title()}</h1>
    <p class="cms-page-subtitle">{m.sites_subtitle()}</p>
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
    {@const syncInfo = getSyncStatusInfo(site.syncStatus)}
    <div class="card bg-base-100 shadow-sm border border-base-200">
      <div class="card-body">
        <!-- Content Area (Header + Deployment + Description) -->
        <div class="content-area mb-2">
          <!-- Site Header - Uncluttered Structure -->
        <div class="site-header">
          <!-- Line 1: Site Name + Badges -->
          <div class="flex items-center gap-2 mb-2">
            <h3 class="site-title text-lg font-semibold flex-grow flex items-center">
              {#if site.isDefault}
                <Star class="h-4 w-4 text-warning fill-warning mr-2" title="Default Site" />
              {/if}
              {site.name}
            </h3>
            <div class="flex items-center gap-2 flex-shrink-0">
              <!-- Three Status Dots -->
              <div class="flex items-center gap-2">
                <!-- Publication Status Dot -->
                <div class="tooltip tooltip-top cursor-pointer" data-tip="{getActualStatusMessage(site.statusDots?.publication, m.sites_status_publication_title())}">
                  <div class="{getStatusClass(site.statusDots?.publication?.status)}"></div>
                </div>
                
                <!-- Health Status Dot -->
                <div class="tooltip tooltip-top cursor-pointer" data-tip="{getHealthStatusMessage(site.statusDots?.health)}">
                  <div class="{getStatusClass(site.statusDots?.health?.status)}"></div>
                </div>
                
                <!-- Sync/Data Layer Status Dot -->
                <div class="tooltip tooltip-top cursor-pointer" data-tip="{getSyncStatusMessage(site)}">
                  <div class="{getStatusClass(
                    site.syncStatus === 'out-of-sync' ? 'red' : 
                    site.syncStatus === 'up-to-date' ? 'green' : 
                    'gray'
                  )}"></div>
                </div>
              </div>
              
              <!-- Interactive Sync Status Info Dot -->
              {#if site.syncStatus === 'out-of-sync' && site.contentChanges?.counts && Object.values(site.contentChanges.counts).some(count => count > 0)}
                <div class="dropdown dropdown-end ml-2">
                  <div 
                    tabindex="0" 
                    role="button"
                    class="w-4 h-4 bg-black dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                    title="{m.sites_sync_details_click_to_see()}"
                  >
                    <span class="text-white text-xs font-semibold">i</span>
                  </div>

                <!-- Sync Details Popover -->
                <div tabindex="-1" class="dropdown-content z-[1] bg-base-100 border border-base-200 rounded-lg shadow-lg p-4 min-w-80">
                    <!-- Header -->
                    <div class="flex items-center justify-between mb-3">
                      <div>
                        <h4 class="font-semibold text-sm">{m.sites_sync_details_title()}</h4>
                        <p class="text-xs text-base-content/70">{m.sites_sync_details_subtitle()}</p>
                      </div>
                      <button 
                        class="btn btn-ghost btn-xs btn-circle"
                        onclick={() => {
                          // Use DaisyUI's recommended approach to close dropdown
                          document.activeElement?.blur();
                        }}
                      >
                        <X class="h-3 w-3" />
                      </button>
                    </div>

                    <!-- Content Changes List -->
                    <div class="space-y-2">
                      {#if site.contentChanges.counts.newPosts > 0}
                        {@const PostIcon = getContentTypeIcon('posts')}
                        <div class="flex items-center justify-between py-1">
                          <div class="flex items-center gap-2">
                            <PostIcon class="h-4 w-4 text-blue-500" />
                            <span class="text-sm">{m.sites_sync_details_new_posts()}</span>
                          </div>
                          <div class="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                            {site.contentChanges.counts.newPosts}
                          </div>
                        </div>
                      {/if}

                      {#if site.contentChanges.counts.updatedPosts > 0}
                        {@const PostIcon = getContentTypeIcon('posts')}
                        <div class="flex items-center justify-between py-1">
                          <div class="flex items-center gap-2">
                            <PostIcon class="h-4 w-4 text-blue-500" />
                            <span class="text-sm">{m.sites_sync_details_updated_posts()}</span>
                          </div>
                          <div class="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                            {site.contentChanges.counts.updatedPosts}
                          </div>
                        </div>
                      {/if}

                      {#if site.contentChanges.counts.newPages > 0}
                        {@const PageIcon = getContentTypeIcon('pages')}
                        <div class="flex items-center justify-between py-1">
                          <div class="flex items-center gap-2">
                            <PageIcon class="h-4 w-4 text-green-500" />
                            <span class="text-sm">{m.sites_sync_details_new_pages()}</span>
                          </div>
                          <div class="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                            {site.contentChanges.counts.newPages}
                          </div>
                        </div>
                      {/if}

                      {#if site.contentChanges.counts.updatedPages > 0}
                        {@const PageIcon = getContentTypeIcon('pages')}
                        <div class="flex items-center justify-between py-1">
                          <div class="flex items-center gap-2">
                            <PageIcon class="h-4 w-4 text-green-500" />
                            <span class="text-sm">{m.sites_sync_details_updated_pages()}</span>
                          </div>
                          <div class="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                            {site.contentChanges.counts.updatedPages}
                          </div>
                        </div>
                      {/if}

                      {#if site.contentChanges.counts.newMedia > 0}
                        {@const MediaIcon = getContentTypeIcon('media')}
                        <div class="flex items-center justify-between py-1">
                          <div class="flex items-center gap-2">
                            <MediaIcon class="h-4 w-4 text-purple-500" />
                            <span class="text-sm">{m.sites_sync_details_new_media()}</span>
                          </div>
                          <div class="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                            {site.contentChanges.counts.newMedia}
                          </div>
                        </div>
                      {/if}

                      {#if site.contentChanges.counts.settingsChanges > 0}
                        {@const SettingsIcon = getContentTypeIcon('settings')}
                        <div class="flex items-center justify-between py-1">
                          <div class="flex items-center gap-2">
                            <SettingsIcon class="h-4 w-4 text-orange-500" />
                            <span class="text-sm">{m.sites_sync_details_settings_changes()}</span>
                          </div>
                          <div class="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                            {site.contentChanges.counts.settingsChanges}
                          </div>
                        </div>
                      {/if}

                      {#if site.contentChanges.counts.templateChanges > 0}
                        {@const TemplateIcon = getContentTypeIcon('template')}
                        <div class="flex items-center justify-between py-1">
                          <div class="flex items-center gap-2">
                            <TemplateIcon class="h-4 w-4 text-pink-500" />
                            <span class="text-sm">{m.sites_sync_details_template_changes()}</span>
                          </div>
                          <div class="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                            {site.contentChanges.counts.templateChanges}
                          </div>
                        </div>
                      {/if}

                      <!-- Show message if no changes -->
                      {#if !Object.values(site.contentChanges.counts).some(count => count > 0)}
                        <div class="text-center py-3 text-base-content/70">
                          <CheckCircle2 class="h-8 w-8 mx-auto text-success mb-2" />
                          <p class="text-sm">{m.sites_sync_details_no_changes()}</p>
                        </div>
                      {/if}
                    </div>

                    <!-- Footer with last build info -->
                    {#if site.lastBuildAt}
                      <div class="mt-3 pt-3 border-t border-base-200">
                        <div class="flex items-center gap-2 text-xs text-base-content/60">
                          <Clock class="h-3 w-3" />
                          <span>{m.sites_sync_details_last_build()}: {formatDate(site.lastBuildAt)}</span>
                        </div>
                      </div>
                    {/if}
                  </div>
                </div>
              {/if}
              
              <!-- Site Menu Dropdown (Three dots) -->
              <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="btn btn-ghost btn-xs btn-circle" title="Site options">
                  <MoreVertical class="h-5 w-5 text-base-content/70 hover:text-base-content transition-colors" />
                </div>
                
                <!-- Dropdown Menu -->
                <ul tabindex="-1" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li>
                      <button onclick={() => configureSite(site)}>
                        {m.sites_menu_settings()}
                      </button>
                    </li>
                    <li>
                      <button onclick={() => duplicateSite(site)} class="text-gray-500">
                        {m.sites_menu_duplicate()}
                      </button>
                    </li>
                    <li>
                      <button onclick={() => exportSite(site)} class="text-gray-500">
                        {m.sites_menu_export()}
                      </button>
                    </li>
                    <li>
                      <button onclick={() => deleteSite(site)} class="text-gray-500">
                        {m.sites_menu_delete()}
                      </button>
                    </li>
                  </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Line 2: Description -->
        <p class="card-description text-sm text-base-content/70 mb-2">
          {site.description?.trim() || 'No description provided'}
        </p>

        <!-- Spacer Line -->
        <div class="h-4"></div>

        <!-- Line 3: Deployment Platform + URL -->
        <div class="deployment-info flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 text-sm text-base-content/70">
            {#if !site.deploymentSettings?.target || site.deploymentSettings?.target === 'cloudflare'}
              <svg class="w-6 h-6 inline" viewBox="0 0 512 512" fill="none">
                <path fill="#f38020" d="M331 326c11-26-4-38-19-38l-148-2c-4 0-4-6 1-7l150-2c17-1 37-15 43-33 0 0 10-21 9-24a97 97 0 0 0-187-11c-38-25-78 9-69 46-48 3-65 46-60 72 0 1 1 2 3 2h274c1 0 3-1 3-3z"/>
                <path fill="#faae40" d="M381 224c-4 0-6-1-7 1l-5 21c-5 16 3 30 20 31l32 2c4 0 4 6-1 7l-33 1c-36 4-46 39-46 39 0 2 0 3 2 3h113l3-2a81 81 0 0 0-78-103"/>
              </svg>
              <span>{m.sites_deployment_cloudflare()}</span>
            {:else if site.deploymentSettings?.target === 'vercel'}
              <svg class="w-3 h-3 inline" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L24 22H0L12 1Z"/>
              </svg>
              <span>{m.sites_deployment_vercel()}</span>
            {:else if site.deploymentSettings?.target === 'netlify'}
              <!-- Light mode Netlify logo -->
              <svg class="w-5 h-5 netlify-logo-light" viewBox="0 0 128 113" fill="none">
                <path d="M34.593 94.0509H33.3844L27.3514 88.0179V86.8094L36.5743 77.5866H42.9639L43.8158 78.4385V84.8281L34.593 94.0509Z" fill="#05BDBA"/>
                <path d="M27.3514 25.816V24.6074L33.3844 18.5744H34.593L43.8158 27.7972V34.1868L42.9639 35.0388H36.5743L27.3514 25.816Z" fill="#05BDBA"/>
                <path d="M80.4594 74.6047H71.6824L70.9493 73.8717V53.3259C70.9493 49.6705 69.5129 46.8372 65.1046 46.7382C62.836 46.6787 60.2405 46.7382 57.4668 46.8471L57.0507 47.2731V73.8618L56.3176 74.5948H47.5406L46.8075 73.8618V38.7636L47.5406 38.0305H67.2939C74.9713 38.0305 81.1925 44.2517 81.1925 51.9291V73.8717L80.4594 74.6047Z" fill="#014847"/>
                <path d="M35.8412 61.4491H0.73307L0 60.716V51.9192L0.73307 51.1861H35.8412L36.5743 51.9192V60.716L35.8412 61.4491Z" fill="#05BDBA"/>
                <path d="M127.277 61.4491H92.1687L91.4356 60.716V51.9192L92.1687 51.1861H127.277L128.01 51.9192V60.716L127.277 61.4491Z" fill="#05BDBA"/>
                <path d="M58.9428 27.0642V0.73307L59.6759 0H68.4727L69.2058 0.73307V27.0642L68.4727 27.7972H59.6759L58.9428 27.0642Z" fill="#05BDBA"/>
                <path d="M58.9428 111.902V85.5711L59.6759 84.838H68.4727L69.2058 85.5711V111.902L68.4727 112.635H59.6759L58.9428 111.902Z" fill="#05BDBA"/>
              </svg>
              <!-- Dark mode Netlify logo -->
              <svg class="w-5 h-5 netlify-logo" viewBox="0 0 128 113" fill="none">
                <path d="M34.593 94.0509H33.3844L27.3514 88.0179V86.8094L36.5743 77.5866H42.9639L43.8158 78.4385V84.8281L34.593 94.0509Z" fill="#32E6E2"/>
                <path d="M27.3514 25.816V24.6074L33.3844 18.5744H34.593L43.8158 27.7972V34.1868L42.9639 35.0388H36.5743L27.3514 25.816Z" fill="#32E6E2"/>
                <path d="M80.4594 74.6047H71.6824L70.9493 73.8717V53.3259C70.9493 49.6705 69.5129 46.8372 65.1046 46.7382C62.836 46.6787 60.2405 46.7382 57.4668 46.8471L57.0507 47.2731V73.8618L56.3176 74.5948H47.5406L46.8075 73.8618V38.7636L47.5406 38.0305H67.2939C74.9713 38.0305 81.1925 44.2517 81.1925 51.9291V73.8717L80.4594 74.6047Z" fill="white"/>
                <path d="M35.8412 61.4491H0.73307L0 60.716V51.9192L0.73307 51.1861H35.8412L36.5743 51.9192V60.716L35.8412 61.4491Z" fill="#32E6E2"/>
                <path d="M127.277 61.4491H92.1687L91.4356 60.716V51.9192L92.1687 51.1861H127.277L128.01 51.9192V60.716L127.277 61.4491Z" fill="#32E6E2"/>
                <path d="M58.9428 27.0642V0.73307L59.6759 0H68.4727L69.2058 0.73307V27.0642L68.4727 27.7972H59.6759L58.9428 27.0642Z" fill="#32E6E2"/>
                <path d="M58.9428 111.902V85.5711L59.6759 84.838H68.4727L69.2058 85.5711V111.902L68.4727 112.635H59.6759L58.9428 111.902Z" fill="#32E6E2"/>
              </svg>
              <span>{m.sites_deployment_netlify()}</span>
            {:else if site.deploymentSettings?.target === 'github'}
              <svg class="w-4 h-4 inline" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>{m.sites_deployment_github()}</span>
            {/if}
          </div>
          
          <div class="flex items-center gap-2 text-sm text-base-content/60">
            {#if !site.domain && (!site.deploymentSettings?.target || site.deploymentSettings.target === 'development')}
              <Computer class="h-4 w-4" />
            {:else if site.domain || (site.buildStatus === 'success' && site.lastBuildAt)}
              <Globe class="h-4 w-4" />
            {:else}
              <AlertTriangle class="h-4 w-4" />
            {/if}
            <div class="tooltip tooltip-top cursor-pointer inline-block" 
                 data-tip="Full URL: {getFullUrl(site)}{site.statusDots?.health?.serverStatus ? ` - Status: ${site.statusDots.health.serverStatus}` : ''}">
              <span class="{site.statusDots?.health?.serverStatus === 'offline' ? 'text-base-content/50' : ''}">
                {getDisplayUrl(site)}
              </span>
            </div>
          </div>
        </div>
        </div>

        <!-- Generation Mode Section -->
        <div class="bg-base-200 rounded-lg p-4 mb-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium mb-1">{m.sites_generation_mode_title()}</h4>
              <p class="text-xs text-base-content/60">{m.sites_generation_mode_description()}</p>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm font-medium">
                {site.generationMode === 'dynamic' ? m.sites_generation_mode_dynamic() : m.sites_generation_mode_static()}
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
              <strong class="{modeStyle.textClass}">{m.sites_generation_dynamic_description()}</strong> {m.sites_generation_dynamic_features()}
            {:else}
              <strong class="{modeStyle.textClass}">{m.sites_generation_static_description()}</strong> {m.sites_generation_static_features()}
            {/if}
          </div>
        </div>

        <!-- Site Metadata -->
        <div class="text-xs text-base-content/60 mb-4 space-y-1">
          <div class="flex items-center gap-2">
            <Calendar class="h-3 w-3" />
            {m.sites_metadata_template()} {site.templateName || m.sites_metadata_template_none()}
          </div>
          <div class="flex items-center gap-2">
            <Clock class="h-3 w-3" />
            {#if site.generationMode === 'dynamic'}
              {m.sites_metadata_last_updated()} {formatDate(site.lastBuildAt)}
            {:else}
              {m.sites_metadata_last_built()} {formatDate(site.lastBuildAt)}
            {/if}
          </div>
          
        </div>

        <!-- Action Buttons -->
        <div class="card-actions justify-end gap-2">
          
          <button 
            class="btn btn-outline btn-sm"
            onclick={() => previewSite(site)}
            disabled={loading}
          >
            <Eye class="h-4 w-4" />
            {m.sites_button_preview()}
          </button>
          
          <button 
            class="btn btn-outline btn-sm"
            onclick={() => quickPreviewSite(site)}
            disabled={loading}
            title="{m.sites_button_go_to_site()}"
          >
            <ExternalLink class="h-4 w-4" />
            {m.sites_button_go_to_site()}
          </button>
          
          <button 
            class="btn {modeStyle.buttonClass} btn-sm text-white"
            onclick={() => generateSite(site)}
            disabled={showBuildModal && buildingSite?.id === site.id}
          >
            {#if site.generationMode === 'static'}
              {#if site.syncStatus === 'out-of-sync'}
                <RefreshCw class="h-4 w-4" />
              {:else}
                <Rocket class="h-4 w-4" />
              {/if}
              {m.sites_button_generate()}
            {:else}
              {#if site.syncStatus === 'out-of-sync'}
                <RefreshCw class="h-4 w-4" />
              {:else}
                <Zap class="h-4 w-4" />
              {/if}
              {m.sites_button_generate()}
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

<!-- Create Site Modal - Wizard -->
{#if showCreateModal}
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-base-100 rounded-lg shadow-xl w-full {currentStep === 2 ? 'max-w-4xl' : 'max-w-[668px]'} max-h-[90vh] overflow-y-auto">
      <!-- Modal Header -->
      <div class="p-6 border-b border-base-200">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold">{m.sites_modal_create_title()}</h2>
            <p class="text-sm text-base-content/60 mt-1">
              {m.sites_modal_create_subtitle()}
            </p>
          </div>
          <button 
            class="btn btn-ghost btn-sm btn-circle"
            onclick={() => showCreateModal = false}
          >
            ✕
          </button>
        </div>
      </div>
      
      <!-- Progress Section -->
      <div class="py-4 px-6 bg-base-200 border-b border-base-300">
        <!-- Progress Indicator -->
        <div class="flex items-center justify-center mb-3">
          <div class="flex items-center space-x-4">
            <div class="w-8 h-8 rounded-full {currentStep >= 1 ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content/60'} flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div class="w-8 h-1 {currentStep >= 2 ? 'bg-primary' : 'bg-base-300'}"></div>
            <div class="w-8 h-8 rounded-full {currentStep >= 2 ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content/60'} flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <div class="w-8 h-1 {currentStep >= 3 ? 'bg-primary' : 'bg-base-300'}"></div>
            <div class="w-8 h-8 rounded-full {currentStep >= 3 ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content/60'} flex items-center justify-center text-sm font-semibold">
              3
            </div>
          </div>
        </div>
        
        <!-- Current Step Name -->
        <div class="text-center">
          <p class="text-sm font-medium text-base-content/60">
            {currentStep === 1 ? m.sites_wizard_step_details() : currentStep === 2 ? m.sites_wizard_step_generation() : m.sites_wizard_step_review()}
          </p>
        </div>
      </div>
      
      <!-- Step Content -->
      <div class="p-6">
        {#if currentStep === 1}
          <!-- Step 1: Site Details -->
          <div class="space-y-4">
            <div>
              <label class="label" for="site-name">
                <span class="label-text">{m.sites_modal_form_name()} <span class="text-error">*</span></span>
              </label>
              <input 
                id="site-name"
                type="text" 
                class="input input-bordered w-full" 
                placeholder={m.sites_modal_form_name_placeholder()}
                value={createForm.name}
                oninput={handleNameChange}
              />
            </div>
            
            <div>
              <label class="label" for="site-slug">
                <span class="label-text">{m.sites_modal_form_slug()} <span class="text-error">*</span></span>
              </label>
              <div class="flex items-center">
                <span class="text-sm text-base-content/60 bg-base-200 px-3 py-2 rounded-l-lg border border-r-0">yoursite.com/</span>
                <input 
                  id="site-slug"
                  type="text" 
                  class="input input-bordered w-full rounded-l-none" 
                  placeholder={m.sites_modal_form_slug_placeholder()}
                  bind:value={createForm.slug}
                />
              </div>
            </div>
            
            <div>
              <label class="label" for="site-description">
                <span class="label-text">{m.sites_modal_form_description()}</span>
              </label>
              <textarea 
                id="site-description"
                class="textarea textarea-bordered w-full" 
                placeholder={m.sites_modal_form_description_placeholder()}
                rows="3"
                bind:value={createForm.description}
              ></textarea>
            </div>
          </div>
          
        {:else if currentStep === 2}
          <!-- Step 2: Generation Mode -->
          <div class="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            <!-- Dynamic Site Card -->
            <div 
              class="border-2 rounded-xl p-6 cursor-pointer transition-all {createForm.generationMode === 'dynamic' ? 'border-indigo-500 bg-indigo-50' : 'border-base-300 hover:border-indigo-300'}"
              role="button"
              tabindex="0"
              onclick={() => createForm.generationMode = 'dynamic'}
              onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); createForm.generationMode = 'dynamic'; } }}
              aria-label="Select Dynamic Site Generation Mode"
            >
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                    <Zap class="w-5 h-5" />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold">{m.sites_generation_card_dynamic_title()}</h3>
                    <p class="text-sm text-base-content/60">{m.sites_generation_card_dynamic_subtitle()}</p>
                  </div>
                </div>
                <input 
                  type="radio" 
                  name="generationMode" 
                  value="dynamic" 
                  class="radio radio-primary" 
                  bind:group={createForm.generationMode}
                />
              </div>
              
              <ul class="space-y-2 text-sm text-base-content/80 mb-4">
                <li class="flex items-center gap-2">
                  <Check class="w-4 h-4 text-success" />
                  {m.sites_generation_card_dynamic_feature_1()}
                </li>
                <li class="flex items-center gap-2">
                  <Check class="w-4 h-4 text-success" />
                  {m.sites_generation_card_dynamic_feature_2()}
                </li>
                <li class="flex items-center gap-2">
                  <Check class="w-4 h-4 text-success" />
                  {m.sites_generation_card_dynamic_feature_3()}
                </li>
                <li class="flex items-center gap-2">
                  <Check class="w-4 h-4 text-success" />
                  {m.sites_generation_card_dynamic_feature_4()}
                </li>
              </ul>
              
              <div class="bg-indigo-600/10 border border-indigo-200 rounded-lg p-3 mb-4">
                <p class="text-xs text-indigo-700">
                  <strong>{m.sites_generation_card_dynamic_perfect_for()}</strong>
                </p>
              </div>
              
              <div class="pt-3 border-t border-base-200">
                <div class="text-xs text-base-content/60 space-y-1">
                  <div class="flex items-center gap-2">
                    <Clock class="w-3 h-3" />
                    <span><strong>{m.sites_generation_card_dynamic_setup_time()}</strong></span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Globe class="w-3 h-3" />
                    <span><strong>{m.sites_generation_card_dynamic_hosting()}</strong></span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Static Site Card -->
            <div 
              class="border-2 rounded-xl p-6 cursor-pointer transition-all {createForm.generationMode === 'static' ? 'border-emerald-500 bg-emerald-50' : 'border-base-300 hover:border-emerald-300'}"
              role="button"
              tabindex="0"
              onclick={() => createForm.generationMode = 'static'}
              onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); createForm.generationMode = 'static'; } }}
              aria-label="Select Static Site Generation Mode"
            >
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                    <Rocket class="w-5 h-5" />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold">{m.sites_generation_card_static_title()}</h3>
                    <p class="text-sm text-base-content/60">{m.sites_generation_card_static_subtitle()}</p>
                  </div>
                </div>
                <input 
                  type="radio" 
                  name="generationMode" 
                  value="static" 
                  class="radio radio-success" 
                  bind:group={createForm.generationMode}
                />
              </div>
              
              <ul class="space-y-2 text-sm text-base-content/80 mb-4">
                <li class="flex items-center gap-2">
                  <Check class="w-4 h-4 text-success" />
                  {m.sites_generation_card_static_feature_1()}
                </li>
                <li class="flex items-center gap-2">
                  <Check class="w-4 h-4 text-success" />
                  {m.sites_generation_card_static_feature_2()}
                </li>
                <li class="flex items-center gap-2">
                  <Check class="w-4 h-4 text-success" />
                  {m.sites_generation_card_static_feature_3()}
                </li>
                <li class="flex items-center gap-2">
                  <Check class="w-4 h-4 text-success" />
                  {m.sites_generation_card_static_feature_4()}
                </li>
              </ul>
              
              <div class="bg-emerald-600/10 border border-emerald-200 rounded-lg p-3 mb-4">
                <p class="text-xs text-emerald-700">
                  <strong>{m.sites_generation_card_static_perfect_for()}</strong>
                </p>
              </div>
              
              <div class="pt-3 border-t border-base-200">
                <div class="text-xs text-base-content/60 space-y-1">
                  <div class="flex items-center gap-2">
                    <Clock class="w-3 h-3" />
                    <span><strong>{m.sites_generation_card_static_setup_time()}</strong></span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Globe class="w-3 h-3" />
                    <span><strong>{m.sites_generation_card_static_hosting()}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        {:else if currentStep === 3}
          <!-- Step 3: Review & Create -->
          <div class="space-y-6">
            <h3 class="text-lg font-semibold">Review your site configuration</h3>
            
            <div class="space-y-4">
              <div class="flex justify-between items-center py-2">
                <span class="font-medium">Site Type:</span>
                <div class="flex items-center gap-2">
                  {#if createForm.generationMode === 'dynamic'}
                    <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                      <Zap class="w-4 h-4" />
                    </div>
                    <span class="text-indigo-600 font-semibold">Dynamic Site</span>
                  {:else}
                    <div class="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                      <Rocket class="w-4 h-4" />
                    </div>
                    <span class="text-emerald-600 font-semibold">Static Site</span>
                  {/if}
                </div>
              </div>
              
              <div class="flex justify-between items-center py-2">
                <span class="font-medium">Name:</span>
                <span>{createForm.name}</span>
              </div>
              
              <div class="flex justify-between items-center py-2">
                <span class="font-medium">URL:</span>
                <span class="text-base-content/70">yoursite.com/{createForm.slug}</span>
              </div>
              
              {#if createForm.description}
                <div class="py-2">
                  <span class="font-medium">Description:</span>
                  <p class="text-base-content/70 mt-1">{createForm.description}</p>
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
      
      <!-- Modal Footer -->
      <div class="flex items-center justify-between p-6 border-t border-base-200 bg-base-200">
        <div class="flex items-center gap-3">
          {#if currentStep > 1}
            <button 
              class="btn btn-outline"
              onclick={prevStep}
              disabled={creating}
            >
              {m.sites_wizard_back()}
            </button>
          {/if}
        </div>
        
        <div class="flex items-center gap-3">
          <button 
            class="btn btn-outline"
            onclick={() => {
              createForm = {
                name: '',
                description: '',
                slug: '',
                generationMode: 'dynamic'
              };
              currentStep = 1;
              showCreateModal = false;
            }}
            disabled={creating}
          >
            {m.sites_modal_form_cancel()}
          </button>
          
          {#if currentStep < totalSteps}
            <button 
              class="btn btn-primary"
              onclick={nextStep}
              disabled={!canProceed(currentStep)}
            >
              {m.sites_wizard_next()}
            </button>
          {:else}
            <button 
              class="btn text-white {createForm.generationMode === 'static' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}"
              onclick={createSite}
              disabled={creating}
            >
              {#if creating}
                <span class="loading loading-spinner loading-sm"></span>
                {m.sites_modal_form_creating()}
              {:else}
                {m.sites_modal_form_create()}
              {/if}
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Build Progress Modal -->
<BuildProgressModal
  isOpen={showBuildModal}
  siteName={buildingSite?.name || ''}
  buildId={`build_${buildingSite?.id}_${Date.now()}`}
  onClose={() => {
    showBuildModal = false;
    buildingSite = null;
  }}
/>

<style>
  /* Custom text colors for generation modes */
  .text-indigo-600 {
    color: rgb(79 70 229);
  }
  
  .text-emerald-600 {
    color: rgb(5 150 105);
  }
  
  /* Site card layout improvements */
  .card {
    min-height: 420px;
  }
  
  .card-body {
    display: flex;
    flex-direction: column;
    min-height: inherit;
  }
  
  .content-area {
    /* Natural height with predictable layout structure */
    display: flex;
    flex-direction: column;
  }
  
  .site-header {
    /* Clean two-line structure: name + badges/URL */
  }
  
  .site-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0; /* Allow flexbox shrinking */
  }
  
  .deployment-info {
    min-height: 24px; /* Consistent deployment line height */
  }
  
  .card-description {
    display: -webkit-box;
    -webkit-line-clamp: 1; /* Changed from 2 to 1 */
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
    height: calc(1.4em * 1); /* Height for 1 line */
    margin-bottom: 0.5rem; /* Reduced margin */
  }
  
  .card-actions {
    margin-top: auto;
  }
  
  /* DaisyUI-compatible Netlify logo visibility */
  .netlify-logo-light { 
    display: block; 
  }
  
  .netlify-logo { 
    display: none; 
  }
  
  :global([data-theme="light"]) .netlify-logo-light { 
    display: block; 
  }
  
  :global([data-theme="light"]) .netlify-logo { 
    display: none; 
  }
  
  :global([data-theme="dark"]) .netlify-logo-light { 
    display: none; 
  }
  
  :global([data-theme="dark"]) .netlify-logo { 
    display: block; 
  }
</style>
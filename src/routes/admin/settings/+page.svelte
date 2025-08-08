<script>
  import { 
    Settings,
    Palette,
    Globe,
    Monitor,
    Sun,
    Moon,
    RotateCcw,
    Save,
    BarChart3,
    TrendingUp
  } from '@lucide/svelte';
  
  // Import i18n with modern Paraglide pattern
  import * as m from '$lib/paraglide/messages';
  
  // Svelte 5 runes for state management
  let activeTab = $state('general');
  let selectedTimeframe = $state('login');
  let statsLoading = $state(false);
  let statsData = $state(null);
  let statsError = $state(null);
  let primaryColor = $state('#8b5cf6');
  let secondaryColor = $state('#64748b');
  let accentColor = $state('#06b6d4');
  let isDarkMode = $state(false);
  let siteTitle = $state('CeLeste CMS');
  let siteDescription = $state('A modern headless CMS built with SvelteKit');
  let timezone = $state('UTC');
  let defaultLanguage = $state('en');
  
  // Preset color schemes
  const colorSchemes = [
    {
      name: 'default',
      label: m.settings_appearance_preset_default(),
      primary: '#8b5cf6',
      secondary: '#64748b',
      accent: '#06b6d4'
    },
    {
      name: 'ocean',
      label: m.settings_appearance_preset_ocean(),
      primary: '#0ea5e9',
      secondary: '#0f172a',
      accent: '#06b6d4'
    },
    {
      name: 'forest',
      label: m.settings_appearance_preset_forest(),
      primary: '#059669',
      secondary: '#374151',
      accent: '#f59e0b'
    },
    {
      name: 'sunset',
      label: m.settings_appearance_preset_sunset(),
      primary: '#dc2626',
      secondary: '#7c2d12',
      accent: '#ea580c'
    }
  ];
  
  // Tab switching function
  function switchTab(tab) {
    activeTab = tab;
  }
  
  // Color scheme application
  function applyColorScheme(scheme) {
    primaryColor = scheme.primary;
    secondaryColor = scheme.secondary;
    accentColor = scheme.accent;
    applyColors();
  }
  
  // Apply colors to CSS custom properties
  function applyColors() {
    if (typeof window !== 'undefined') {
      document.documentElement.style.setProperty('--color-primary', primaryColor);
      document.documentElement.style.setProperty('--color-secondary', secondaryColor);
      document.documentElement.style.setProperty('--color-accent', accentColor);
    }
  }
  
  // Dark mode toggle
  function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }
  }
  
  // Reset to defaults
  function resetToDefaults() {
    const defaultScheme = colorSchemes[0];
    applyColorScheme(defaultScheme);
    isDarkMode = false;
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }
  
  // Save settings (localStorage for now)
  function saveSettings() {
    if (typeof window !== 'undefined') {
      const settings = {
        primaryColor,
        secondaryColor, 
        accentColor,
        isDarkMode,
        siteTitle,
        siteDescription,
        timezone,
        defaultLanguage
      };
      localStorage.setItem('cms-settings', JSON.stringify(settings));
      // Show success message (could use toast notification)
      console.log(m.settings_changes_saved());
    }
  }
  
  // Initialize settings on mount
  $effect(() => {
    if (typeof window !== 'undefined') {
      // Load saved settings
      const savedSettings = localStorage.getItem('cms-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        primaryColor = settings.primaryColor || primaryColor;
        secondaryColor = settings.secondaryColor || secondaryColor;
        accentColor = settings.accentColor || accentColor;
        isDarkMode = settings.isDarkMode || false;
        siteTitle = settings.siteTitle || siteTitle;
        siteDescription = settings.siteDescription || siteDescription;
        timezone = settings.timezone || timezone;
        defaultLanguage = settings.defaultLanguage || defaultLanguage;
      }
      
      // Load theme
      const savedTheme = localStorage.getItem('theme') || 'light';
      isDarkMode = savedTheme === 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
      
      // Apply colors
      applyColors();
    }
  });
  
  // Auto-apply colors when they change
  $effect(() => {
    applyColors();
  });
  
  // Load statistics when Statistics tab is active or timeframe changes
  $effect(() => {
    if (activeTab === 'statistics') {
      loadStatistics(selectedTimeframe);
    }
  });
  
  // Statistics loading function
  async function loadStatistics(timeframe) {
    statsLoading = true;
    statsError = null;
    
    try {
      const response = await fetch(`/api/stats?timeframe=${timeframe}`);
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      statsData = await response.json();
    } catch (error) {
      console.error('Error loading statistics:', error);
      statsError = error.message;
      statsData = null;
    } finally {
      statsLoading = false;
    }
  }
  
  // Handle timeframe selection
  function selectTimeframe(timeframe) {
    selectedTimeframe = timeframe;
    loadStatistics(timeframe);
  }
</script>

<!-- Page Header - Following exact Posts page pattern -->
<div class="cms-page-header">
  <div>
    <h1 class="cms-page-title">{m.settings_title()}</h1>
    <p class="cms-page-subtitle">{m.settings_subtitle()}</p>
  </div>
  <button 
    onclick={saveSettings}
    class="btn btn-primary gap-2"
  >
    <Save class="h-4 w-4" />
    {m.settings_save_changes()}
  </button>
</div>

<!-- Tab Navigation using DaisyUI tabs - Mobile responsive -->
<div class="tabs tabs-bordered mb-6 overflow-x-auto">
  <button 
    class="tab tab-sm md:tab-md {activeTab === 'general' ? 'tab-active' : ''} whitespace-nowrap"
    onclick={() => switchTab('general')}
  >
    <Globe class="h-4 w-4 mr-1 md:mr-2" />
    <span class="hidden sm:inline">{m.settings_tab_general()}</span>
    <span class="sm:hidden">General</span>
  </button>
  <button 
    class="tab tab-sm md:tab-md {activeTab === 'appearance' ? 'tab-active' : ''} whitespace-nowrap"
    onclick={() => switchTab('appearance')}
  >
    <Palette class="h-4 w-4 mr-1 md:mr-2" />
    <span class="hidden sm:inline">{m.settings_tab_appearance()}</span>
    <span class="sm:hidden">Theme</span>
  </button>
  <button 
    class="tab tab-sm md:tab-md {activeTab === 'statistics' ? 'tab-active' : ''} whitespace-nowrap"
    onclick={() => switchTab('statistics')}
  >
    <BarChart3 class="h-4 w-4 mr-1 md:mr-2" />
    <span class="hidden sm:inline">{m.settings_tab_statistics()}</span>
    <span class="sm:hidden">Stats</span>
  </button>
  <button 
    class="tab tab-sm md:tab-md {activeTab === 'advanced' ? 'tab-active' : ''} whitespace-nowrap"
    onclick={() => switchTab('advanced')}
  >
    <Settings class="h-4 w-4 mr-1 md:mr-2" />
    <span class="hidden sm:inline">{m.settings_tab_advanced()}</span>
    <span class="sm:hidden">Advanced</span>
  </button>
</div>

<!-- Tab Content -->
{#if activeTab === 'general'}
  <!-- General Settings Tab -->
  <div class="cms-grid-content">
    <div class="cms-card md:col-span-2">
      <div class="cms-card-body">
        <h2 class="cms-card-title">Site Configuration</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <!-- Site Title -->
          <div class="form-control">
            <label class="label" for="siteTitle">
              <span class="label-text">{m.settings_general_site_title()}</span>
            </label>
            <input 
              id="siteTitle"
              type="text" 
              bind:value={siteTitle}
              class="input w-full" 
              placeholder="Enter site title"
            />
          </div>
          
          <!-- Default Language -->
          <div class="form-control">
            <label class="label" for="defaultLanguage">
              <span class="label-text">{m.settings_general_language()}</span>
            </label>
            <select id="defaultLanguage" bind:value={defaultLanguage} class="select w-full">
              <option value="en">English</option>
              <option value="pt-br">Português (Brasil)</option>
            </select>
          </div>
        </div>
        
        <!-- Site Description -->
        <div class="form-control mt-6">
          <label class="label" for="siteDescription">
            <span class="label-text">{m.settings_general_site_description()}</span>
          </label>
          <textarea 
            id="siteDescription"
            bind:value={siteDescription}
            class="textarea w-full" 
            rows="3"
            placeholder="Enter site description"
          ></textarea>
        </div>
        
        <!-- Timezone -->
        <div class="form-control mt-6">
          <label class="label" for="timezone">
            <span class="label-text">{m.settings_general_timezone()}</span>
          </label>
          <select id="timezone" bind:value={timezone} class="select w-full max-w-xs">
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="America/Sao_Paulo">Brasília Time (BRT)</option>
            <option value="Europe/London">Greenwich Mean Time (GMT)</option>
            <option value="Europe/Paris">Central European Time (CET)</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="cms-card">
      <div class="cms-card-body">
        <h2 class="cms-card-title">Quick Actions</h2>
        
        <div class="space-y-4">
          <button onclick={resetToDefaults} class="btn btn-outline w-full gap-2">
            <RotateCcw class="h-4 w-4" />
            {m.settings_reset_defaults()}
          </button>
          
          <button onclick={saveSettings} class="btn btn-primary w-full gap-2">
            <Save class="h-4 w-4" />
            {m.settings_save_changes()}
          </button>
        </div>
      </div>
    </div>
  </div>

{:else if activeTab === 'appearance'}
  <!-- Appearance Settings Tab -->
  <div class="cms-grid-content">
    <div class="cms-card md:col-span-2">
      <div class="cms-card-body">
        <h2 class="cms-card-title">{m.settings_appearance_color_scheme()}</h2>
        
        <!-- Color Pickers -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <!-- Primary Color -->
          <div class="form-control">
            <label class="label" for="primaryColor">
              <span class="label-text">{m.settings_appearance_primary_color()}</span>
            </label>
            <div class="flex gap-2">
              <input 
                id="primaryColor"
                type="color" 
                bind:value={primaryColor}
                class="w-12 h-12 rounded-lg border border-base-300 cursor-pointer"
              />
              <input 
                type="text" 
                bind:value={primaryColor}
                class="input flex-1" 
                placeholder="#8b5cf6"
              />
            </div>
          </div>
          
          <!-- Secondary Color -->
          <div class="form-control">
            <label class="label" for="secondaryColor">
              <span class="label-text">{m.settings_appearance_secondary_color()}</span>
            </label>
            <div class="flex gap-2">
              <input 
                id="secondaryColor"
                type="color" 
                bind:value={secondaryColor}
                class="w-12 h-12 rounded-lg border border-base-300 cursor-pointer"
              />
              <input 
                type="text" 
                bind:value={secondaryColor}
                class="input flex-1" 
                placeholder="#64748b"
              />
            </div>
          </div>
          
          <!-- Accent Color -->
          <div class="form-control">
            <label class="label" for="accentColor">
              <span class="label-text">{m.settings_appearance_accent_color()}</span>
            </label>
            <div class="flex gap-2">
              <input 
                id="accentColor"
                type="color" 
                bind:value={accentColor}
                class="w-12 h-12 rounded-lg border border-base-300 cursor-pointer"
              />
              <input 
                type="text" 
                bind:value={accentColor}
                class="input flex-1" 
                placeholder="#06b6d4"
              />
            </div>
          </div>
        </div>
        
        <!-- Dark Mode Toggle -->
        <div class="divider"></div>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold">{m.settings_appearance_dark_mode()}</h3>
            <p class="text-sm text-base-content/60">Toggle between light and dark themes</p>
          </div>
          <button 
            onclick={toggleDarkMode}
            class="btn btn-circle {isDarkMode ? 'btn-primary' : 'btn-outline'}"
          >
            {#if isDarkMode}
              <Moon class="h-5 w-5" />
            {:else}
              <Sun class="h-5 w-5" />
            {/if}
          </button>
        </div>
        
        <!-- Preset Color Schemes -->
        <div class="divider"></div>
        <h3 class="font-semibold mb-4">{m.settings_appearance_preset_schemes()}</h3>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {#each colorSchemes as scheme}
            <button 
              onclick={() => applyColorScheme(scheme)}
              class="p-4 rounded-lg border border-base-300 hover:border-primary transition-colors"
            >
              <div class="flex gap-2 mb-2">
                <div class="w-4 h-4 rounded-full" style="background-color: {scheme.primary}"></div>
                <div class="w-4 h-4 rounded-full" style="background-color: {scheme.secondary}"></div>
                <div class="w-4 h-4 rounded-full" style="background-color: {scheme.accent}"></div>
              </div>
              <span class="text-sm font-medium">{scheme.label}</span>
            </button>
          {/each}
        </div>
      </div>
    </div>
    
    <!-- Preview Section -->
    <div class="cms-card">
      <div class="cms-card-body">
        <h2 class="cms-card-title">{m.settings_appearance_preview()}</h2>
        
        <!-- Preview Components -->
        <div class="space-y-4">
          <!-- Button Preview -->
          <div>
            <p class="text-sm text-base-content/60 mb-2">Buttons</p>
            <div class="flex gap-2 flex-wrap">
              <button class="btn btn-primary btn-xs sm:btn-sm">Primary</button>
              <button class="btn btn-secondary btn-xs sm:btn-sm">Secondary</button>
              <button class="btn btn-outline btn-xs sm:btn-sm">Outline</button>
            </div>
          </div>
          
          <!-- Badge Preview -->
          <div>
            <p class="text-sm text-base-content/60 mb-2">Status Badges</p>
            <div class="flex gap-2 flex-wrap">
              <span class="badge badge-primary badge-sm">Primary</span>
              <span class="badge badge-secondary badge-sm">Secondary</span>
              <span class="badge badge-accent badge-sm">Accent</span>
            </div>
          </div>
          
          <!-- Card Preview -->
          <div class="card bg-base-100 shadow-sm border">
            <div class="card-body p-4">
              <h3 class="card-title text-sm">Sample Card</h3>
              <p class="text-xs">This is how cards will look with your color scheme.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

{:else if activeTab === 'statistics'}
  <!-- Statistics Tab -->
  <div class="cms-grid-content">
    <div class="cms-card md:col-span-2">
      <div class="cms-card-body">
        <h2 class="cms-card-title">{m.settings_statistics_title()}</h2>
        <p class="text-sm text-base-content/60 mb-6">{m.settings_statistics_subtitle()}</p>
        
        <!-- Time Period Selector -->
        <div class="form-control mb-6">
          <div class="label">
            <span class="label-text font-medium">{m.settings_statistics_time_period()}</span>
          </div>
          <div class="join">
            <button 
              class="join-item btn btn-sm {selectedTimeframe === 'total' ? 'btn-active' : 'btn-outline'}"
              onclick={() => selectTimeframe('total')}
            >
              {m.settings_statistics_total()}
            </button>
            <button 
              class="join-item btn btn-sm {selectedTimeframe === 'hour' ? 'btn-active' : 'btn-outline'}"
              onclick={() => selectTimeframe('hour')}
            >
              {m.settings_statistics_last_hour()}
            </button>
            <button 
              class="join-item btn btn-sm {selectedTimeframe === '24hrs' ? 'btn-active' : 'btn-outline'}"
              onclick={() => selectTimeframe('24hrs')}
            >
              {m.settings_statistics_24_hours()}
            </button>
            <button 
              class="join-item btn btn-sm {selectedTimeframe === 'week' ? 'btn-active' : 'btn-outline'}"
              onclick={() => selectTimeframe('week')}
            >
              {m.settings_statistics_week()}
            </button>
            <button 
              class="join-item btn btn-sm {selectedTimeframe === 'month' ? 'btn-active' : 'btn-outline'}"
              onclick={() => selectTimeframe('month')}
            >
              {m.settings_statistics_month()}
            </button>
            <button 
              class="join-item btn btn-sm {selectedTimeframe === 'login' ? 'btn-active' : 'btn-outline'}"
              onclick={() => selectTimeframe('login')}
            >
              {m.settings_statistics_since_login()}
            </button>
          </div>
        </div>
        
        <!-- Statistics Display -->
        {#if statsLoading}
          <div class="flex items-center justify-center py-12">
            <span class="loading loading-spinner loading-lg"></span>
            <span class="ml-3">{m.settings_statistics_loading()}</span>
          </div>
        {:else if statsError}
          <div class="alert alert-error">
            <span>{m.settings_statistics_error()}: {statsError}</span>
          </div>
        {:else if statsData}
          <!-- Statistics Table -->
          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th class="font-semibold">Content Type</th>
                  <th class="text-center font-semibold">Current Period</th>
                  <th class="text-center text-xs text-base-content/60">
                    {#if selectedTimeframe === 'total'}
                      All Time
                    {:else if selectedTimeframe === 'hour'}
                      Last Hour
                    {:else if selectedTimeframe === '24hrs'}
                      Last 24 Hours
                    {:else if selectedTimeframe === 'week'}
                      Last Week
                    {:else if selectedTimeframe === 'month'}
                      Last Month
                    {:else if selectedTimeframe === 'login'}
                      Since Login
                    {/if}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr class="hover">
                  <td class="font-medium">
                    <div class="flex items-center gap-3">
                      <TrendingUp class="w-5 h-5 text-primary" />
                      {m.settings_statistics_posts_count()}
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="stat-value text-lg font-bold text-primary">{statsData.posts}</div>
                  </td>
                  <td class="text-center text-sm text-base-content/60">
                    {selectedTimeframe === 'total' ? 'Total posts created' : `Posts created in selected period`}
                  </td>
                </tr>
                
                <tr class="hover">
                  <td class="font-medium">
                    <div class="flex items-center gap-3">
                      <svg class="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                      </svg>
                      {m.settings_statistics_media_count()}
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="stat-value text-lg font-bold text-secondary">{statsData.media}</div>
                  </td>
                  <td class="text-center text-sm text-base-content/60">
                    {selectedTimeframe === 'total' ? 'Total media files uploaded' : `Media files uploaded in selected period`}
                  </td>
                </tr>
                
                <tr class="hover">
                  <td class="font-medium">
                    <div class="flex items-center gap-3">
                      <svg class="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      {m.settings_statistics_users_count()}
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="stat-value text-lg font-bold text-accent">{statsData.users}</div>
                  </td>
                  <td class="text-center text-sm text-base-content/60">
                    {selectedTimeframe === 'total' ? 'Total users registered' : `Users registered in selected period`}
                  </td>
                </tr>
                
                <tr class="hover">
                  <td class="font-medium">
                    <div class="flex items-center gap-3">
                      <Globe class="w-5 h-5 text-info" />
                      {m.settings_statistics_sites_count()}
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="stat-value text-lg font-bold text-info">{statsData.sites}</div>
                  </td>
                  <td class="text-center text-sm text-base-content/60">
                    {selectedTimeframe === 'total' ? 'Total active sites' : `Sites activity in selected period`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Summary Info -->
          <div class="mt-6 p-4 bg-base-200 rounded-lg">
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium">
                Statistics for: 
                <span class="badge badge-primary badge-sm ml-1">
                  {#if selectedTimeframe === 'total'}
                    All Time
                  {:else if selectedTimeframe === 'hour'}
                    Last Hour
                  {:else if selectedTimeframe === '24hrs'}
                    Last 24 Hours
                  {:else if selectedTimeframe === 'week'}
                    Last Week
                  {:else if selectedTimeframe === 'month'}
                    Last Month
                  {:else if selectedTimeframe === 'login'}
                    Since Last Login
                  {/if}
                </span>
              </span>
              <span class="text-base-content/60">
                Last updated: just now
              </span>
            </div>
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Statistics Info Panel -->
    <div class="cms-card">
      <div class="cms-card-body">
        <h3 class="font-semibold mb-4">Time Period Information</h3>
        <div class="space-y-3 text-sm">
          <div>
            <strong>Total:</strong> All records since installation
          </div>
          <div>
            <strong>Last Hour:</strong> Records created in the past 60 minutes
          </div>
          <div>
            <strong>24 Hours:</strong> Records created in the past day
          </div>
          <div>
            <strong>Week:</strong> Records created in the past 7 days
          </div>
          <div>
            <strong>Month:</strong> Records created in the past 30 days
          </div>
          <div>
            <strong>Since Login:</strong> Records created since your last login
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="text-xs text-base-content/60">
          Statistics are updated in real-time and reflect the current state of your CMS database.
        </div>
      </div>
    </div>
  </div>

{:else if activeTab === 'advanced'}
  <!-- Advanced Settings Tab -->
  <div class="cms-grid-content">
    <div class="cms-card md:col-span-3">
      <div class="cms-card-body">
        <h2 class="cms-card-title">Advanced Configuration</h2>
        <div class="alert alert-info">
          <Monitor class="h-5 w-5" />
          <span>Advanced settings will be available in future updates. This includes API configuration, backup settings, and developer options.</span>
        </div>
      </div>
    </div>
  </div>
{/if}
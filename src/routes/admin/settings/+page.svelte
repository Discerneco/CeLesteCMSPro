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
  let timezone = $state('');
  let defaultLanguage = $state('en');
  let detectedTimezone = $state(null);
  let currentTime = $state('');
  let timeInterval = null;
  let isInitialized = $state(false);
  
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
  
  // Auto-detect timezone
  function detectTimezone() {
    if (typeof window !== 'undefined') {
      try {
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
        detectedTimezone = detected;
        // If no timezone is set yet, use the detected one
        if (!timezone && detected) {
          timezone = detected;
        }
      } catch (error) {
        console.warn('Timezone auto-detection failed:', error);
        detectedTimezone = null;
      }
    }
  }
  
  // Update current time display
  function updateCurrentTime() {
    if (typeof window !== 'undefined' && timezone) {
      try {
        const now = new Date();
        currentTime = now.toLocaleTimeString('en-US', {
          timeZone: timezone,
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        currentTime = '';
      }
    }
  }
  
  // Initialize settings on mount (run only once)
  $effect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      isInitialized = true;
      
      // Detect timezone first
      detectTimezone();
      
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
        timezone = settings.timezone || detectedTimezone || timezone;
        defaultLanguage = settings.defaultLanguage || defaultLanguage;
      }
      
      // Load theme
      const savedTheme = localStorage.getItem('theme') || 'light';
      isDarkMode = savedTheme === 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
      
      // Apply colors
      applyColors();
      
      // Start time updates
      updateCurrentTime();
      timeInterval = setInterval(updateCurrentTime, 1000);
    }
    
    // Cleanup interval on unmount
    return () => {
      if (timeInterval) {
        clearInterval(timeInterval);
      }
    };
  });
  
  // Auto-apply colors when they change
  $effect(() => {
    applyColors();
  });
  
  // Update current time when timezone changes
  $effect(() => {
    updateCurrentTime();
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

<!-- Tabs -->
<div class="flex border-b border-base-200 mb-6 overflow-x-auto">
  <button 
    class="flex items-center gap-2 px-4 py-2 border-b-[3px] transition-colors duration-150 {activeTab === 'general' ? 'border-primary text-base-content' : 'border-transparent text-base-content/60 hover:text-base-content/80'} whitespace-nowrap"
    onclick={() => switchTab('general')}
  >
    <Globe class="h-4 w-4" />
    <span class="hidden sm:inline">{m.settings_tab_general()}</span>
    <span class="sm:hidden">General</span>
  </button>
  <button 
    class="flex items-center gap-2 px-4 py-2 border-b-[3px] transition-colors duration-150 {activeTab === 'appearance' ? 'border-primary text-base-content' : 'border-transparent text-base-content/60 hover:text-base-content/80'} whitespace-nowrap"
    onclick={() => switchTab('appearance')}
  >
    <Palette class="h-4 w-4" />
    <span class="hidden sm:inline">{m.settings_tab_appearance()}</span>
    <span class="sm:hidden">Theme</span>
  </button>
  <button 
    class="flex items-center gap-2 px-4 py-2 border-b-[3px] transition-colors duration-150 {activeTab === 'statistics' ? 'border-primary text-base-content' : 'border-transparent text-base-content/60 hover:text-base-content/80'} whitespace-nowrap"
    onclick={() => switchTab('statistics')}
  >
    <BarChart3 class="h-4 w-4" />
    <span class="hidden sm:inline">{m.settings_tab_statistics()}</span>
    <span class="sm:hidden">Stats</span>
  </button>
  <button 
    class="flex items-center gap-2 px-4 py-2 border-b-[3px] transition-colors duration-150 {activeTab === 'advanced' ? 'border-primary text-base-content' : 'border-transparent text-base-content/60 hover:text-base-content/80'} whitespace-nowrap"
    onclick={() => switchTab('advanced')}
  >
    <Settings class="h-4 w-4" />
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
        <h2 class="cms-card-title">{m.settings_general_site_configuration()}</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <!-- Site Title -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">{m.settings_general_site_title()}</span>
            </label>
            <input 
              type="text" 
              bind:value={siteTitle}
              class="input w-full" 
              placeholder={m.settings_general_site_title_placeholder()}
            />
          </div>
          
          <!-- Default Language -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">{m.settings_general_language()}</span>
            </label>
            <select bind:value={defaultLanguage} class="select w-full">
              <option value="en">English</option>
              <option value="pt-br">Português (Brasil)</option>
            </select>
          </div>
        </div>
        
        <!-- Site Description -->
        <div class="form-control mt-6">
          <label class="label">
            <span class="label-text">{m.settings_general_site_description()}</span>
          </label>
          <textarea 
            bind:value={siteDescription}
            class="textarea w-full" 
            rows="3"
            placeholder={m.settings_general_site_description_placeholder()}
          ></textarea>
        </div>
        
        <!-- Timezone -->
        <div class="form-control mt-6">
          <label class="label">
            <span class="label-text">{m.settings_general_timezone()}</span>
          </label>
          <div class="space-y-2">
            <select bind:value={timezone} class="select w-full max-w-xs">
              <!-- Choose timezone placeholder - selectable for reset -->
              <option value="">
                {m.settings_timezone_choose()}
              </option>
            
            <!-- Americas -->
            <optgroup label={m.settings_timezone_continent_americas()}>
              <option value="Pacific/Honolulu">{m.settings_timezone_hawaii()}</option>
              <option value="America/Anchorage">{m.settings_timezone_alaska()}</option>
              <option value="America/Los_Angeles">{m.settings_timezone_pacific()}</option>
              <option value="America/Denver">{m.settings_timezone_mountain()}</option>
              <option value="America/Chicago">{m.settings_timezone_central()}</option>
              <option value="America/New_York">{m.settings_timezone_eastern()}</option>
              <option value="America/Rio_Branco">{m.settings_timezone_acre()}</option>
              <option value="America/Manaus">{m.settings_timezone_amazon()}</option>
              <option value="America/Sao_Paulo">
                {m.settings_timezone_brasilia_time()}
                {#if detectedTimezone === 'America/Sao_Paulo'}
                  ✓ {m.settings_timezone_auto_detected()}
                {/if}
              </option>
              <option value="America/Buenos_Aires">{m.settings_timezone_argentina()}</option>
              <option value="America/Noronha">{m.settings_timezone_noronha()}</option>
              <option value="America/Mexico_City">{m.settings_timezone_mexico()}</option>
            </optgroup>
            
            <!-- Europe -->
            <optgroup label={m.settings_timezone_continent_europe()}>
              <option value="Europe/London">
                {m.settings_timezone_london()}
                {#if detectedTimezone === 'Europe/London'}
                  ✓ {m.settings_timezone_auto_detected()}
                {/if}
              </option>
              <option value="Europe/Paris">{m.settings_timezone_paris()}</option>
              <option value="Europe/Moscow">{m.settings_timezone_moscow()}</option>
            </optgroup>
            
            <!-- Africa -->
            <optgroup label={m.settings_timezone_continent_africa()}>
              <option value="Africa/Lagos">{m.settings_timezone_lagos()}</option>
              <option value="Africa/Cairo">{m.settings_timezone_cairo()}</option>
              <option value="Africa/Johannesburg">{m.settings_timezone_johannesburg()}</option>
              <option value="Africa/Nairobi">{m.settings_timezone_nairobi()}</option>
            </optgroup>
            
            <!-- Asia -->
            <optgroup label={m.settings_timezone_continent_asia()}>
              <option value="Asia/Dubai">{m.settings_timezone_dubai()}</option>
              <option value="Asia/Kolkata">{m.settings_timezone_kolkata()}</option>
              <option value="Asia/Bangkok">{m.settings_timezone_bangkok()}</option>
              <option value="Asia/Hong_Kong">{m.settings_timezone_hong_kong()}</option>
              <option value="Asia/Tokyo">{m.settings_timezone_tokyo()}</option>
            </optgroup>
            
            <!-- Oceania -->
            <optgroup label={m.settings_timezone_continent_oceania()}>
              <option value="Australia/Sydney">{m.settings_timezone_sydney()}</option>
              <option value="Pacific/Auckland">{m.settings_timezone_auckland()}</option>
            </optgroup>
            </select>
            
            <!-- Current time display -->
            {#if currentTime}
              <div class="text-sm text-base-content/60">
                {m.settings_timezone_current_time({ time: currentTime })}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="cms-card">
      <div class="cms-card-body">
        <h2 class="cms-card-title">{m.settings_general_quick_actions()}</h2>
        
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
            <label class="label">
              <span class="label-text">{m.settings_appearance_primary_color()}</span>
            </label>
            <div class="flex gap-2">
              <input 
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
            <label class="label">
              <span class="label-text">{m.settings_appearance_secondary_color()}</span>
            </label>
            <div class="flex gap-2">
              <input 
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
            <label class="label">
              <span class="label-text">{m.settings_appearance_accent_color()}</span>
            </label>
            <div class="flex gap-2">
              <input 
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
            <p class="text-sm text-base-content/60">{m.settings_appearance_dark_mode_description()}</p>
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
            <p class="text-sm text-base-content/60 mb-2">{m.settings_appearance_preview_buttons()}</p>
            <div class="flex gap-2 flex-wrap">
              <button class="btn btn-primary btn-xs sm:btn-sm">{m.settings_appearance_preview_primary()}</button>
              <button class="btn btn-secondary btn-xs sm:btn-sm">{m.settings_appearance_preview_secondary()}</button>
              <button class="btn btn-outline btn-xs sm:btn-sm">{m.settings_appearance_preview_outline()}</button>
            </div>
          </div>
          
          <!-- Badge Preview -->
          <div>
            <p class="text-sm text-base-content/60 mb-2">{m.settings_appearance_preview_status_badges()}</p>
            <div class="flex gap-2 flex-wrap">
              <span class="badge badge-primary badge-sm">{m.settings_appearance_preview_primary()}</span>
              <span class="badge badge-secondary badge-sm">{m.settings_appearance_preview_secondary()}</span>
              <span class="badge badge-accent badge-sm">{m.settings_appearance_preview_accent()}</span>
            </div>
          </div>
          
          <!-- Card Preview -->
          <div class="card bg-base-100 shadow-sm border">
            <div class="card-body p-4">
              <h3 class="card-title text-sm">{m.settings_appearance_preview_sample_card()}</h3>
              <p class="text-xs">{m.settings_appearance_preview_card_description()}</p>
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
          <label class="label">
            <span class="label-text font-medium">{m.settings_statistics_time_period()}</span>
          </label>
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
                  <th class="font-semibold">{m.settings_statistics_content_type()}</th>
                  <th class="text-center font-semibold">{m.settings_statistics_current_period()}</th>
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
                    {selectedTimeframe === 'total' ? 'Total posts created' : m.settings_statistics_posts_period()}
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
                    {selectedTimeframe === 'total' ? 'Total media files uploaded' : m.settings_statistics_media_period()}
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
                    {selectedTimeframe === 'total' ? 'Total users registered' : m.settings_statistics_users_period()}
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
                    {selectedTimeframe === 'total' ? 'Total active sites' : m.settings_statistics_sites_period()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Summary Info -->
          <div class="mt-6 p-4 bg-base-200 rounded-lg">
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium">
                {m.settings_statistics_for_label()} 
                <span class="badge badge-primary badge-sm ml-1">
                  {#if selectedTimeframe === 'total'}
                    {m.settings_statistics_badge_all_time()}
                  {:else if selectedTimeframe === 'hour'}
                    {m.settings_statistics_badge_last_hour()}
                  {:else if selectedTimeframe === '24hrs'}
                    {m.settings_statistics_badge_24_hours()}
                  {:else if selectedTimeframe === 'week'}
                    {m.settings_statistics_badge_last_week()}
                  {:else if selectedTimeframe === 'month'}
                    {m.settings_statistics_badge_last_month()}
                  {:else if selectedTimeframe === 'login'}
                    {m.settings_statistics_badge_since_login()}
                  {/if}
                </span>
              </span>
              <span class="text-base-content/60">
                {m.settings_statistics_last_updated()}
              </span>
            </div>
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Statistics Info Panel -->
    <div class="cms-card">
      <div class="cms-card-body">
        <h3 class="font-semibold mb-4">{m.settings_statistics_time_info_title()}</h3>
        <div class="space-y-3 text-sm">
          <div>
            <strong>{m.settings_statistics_total()}:</strong> {m.settings_statistics_info_total()}
          </div>
          <div>
            <strong>{m.settings_statistics_last_hour()}:</strong> {m.settings_statistics_info_hour()}
          </div>
          <div>
            <strong>{m.settings_statistics_24_hours()}:</strong> {m.settings_statistics_info_24hrs()}
          </div>
          <div>
            <strong>{m.settings_statistics_week()}:</strong> {m.settings_statistics_info_week()}
          </div>
          <div>
            <strong>{m.settings_statistics_month()}:</strong> {m.settings_statistics_info_month()}
          </div>
          <div>
            <strong>{m.settings_statistics_since_login()}:</strong> {m.settings_statistics_info_login()}
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="text-xs text-base-content/60">
          {m.settings_statistics_realtime_note()}
        </div>
      </div>
    </div>
  </div>

{:else if activeTab === 'advanced'}
  <!-- Advanced Settings Tab -->
  <div class="cms-grid-content">
    <div class="cms-card md:col-span-3">
      <div class="cms-card-body">
        <h2 class="cms-card-title">{m.settings_advanced_title()}</h2>
        <div class="alert alert-info">
          <Monitor class="h-5 w-5" />
          <span>{m.settings_advanced_future_notice()}</span>
        </div>
      </div>
    </div>
  </div>
{/if}
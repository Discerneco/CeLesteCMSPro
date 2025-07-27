<script>
  import { 
    Settings,
    Palette,
    Globe,
    Monitor,
    Sun,
    Moon,
    RotateCcw,
    Save
  } from '@lucide/svelte';
  
  // Import i18n with modern Paraglide pattern
  import * as m from '$lib/paraglide/messages';
  
  // Svelte 5 runes for state management
  let activeTab = $state('general');
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
            <label class="label">
              <span class="label-text">{m.settings_general_site_title()}</span>
            </label>
            <input 
              type="text" 
              bind:value={siteTitle}
              class="input input-bordered w-full" 
              placeholder="Enter site title"
            />
          </div>
          
          <!-- Default Language -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">{m.settings_general_language()}</span>
            </label>
            <select bind:value={defaultLanguage} class="select select-bordered w-full">
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
            class="textarea textarea-bordered w-full" 
            rows="3"
            placeholder="Enter site description"
          ></textarea>
        </div>
        
        <!-- Timezone -->
        <div class="form-control mt-6">
          <label class="label">
            <span class="label-text">{m.settings_general_timezone()}</span>
          </label>
          <select bind:value={timezone} class="select select-bordered w-full max-w-xs">
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
                class="input input-bordered flex-1" 
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
                class="input input-bordered flex-1" 
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
                class="input input-bordered flex-1" 
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
<script>
  import { 
    Search, Download, Settings, Trash2, Star, Shield, Zap, 
    FileText, ShoppingCart, Camera, BarChart3, Package, 
    CheckCircle, ExternalLink 
  } from '@lucide/svelte';
  import * as m from '$lib/paraglide/messages';
  
  // State management with Svelte 5 runes
  let activeTab = $state('store');
  let searchQuery = $state('');
  let selectedCategory = $state('all');
  
  // Installed tab state
  let installedSearchQuery = $state('');
  let installedSelectedCategory = $state('all');
  
  // Mock data for plugins (will be replaced with API data)
  const availablePlugins = [
    {
      id: 1,
      name: 'SEO Optimizer Pro',
      description: 'Advanced SEO tools with automatic meta generation, sitemap management, and search console integration.',
      category: 'seo',
      author: 'CeLeste Team',
      version: '2.1.0',
      rating: 4.8,
      downloads: 12500,
      price: 'Free',
      features: ['Auto meta tags', 'XML sitemaps', 'Schema markup', 'Analytics integration'],
      tags: ['seo', 'optimization', 'meta', 'sitemap'],
      isInstalled: false
    },
    {
      id: 2,
      name: 'Advanced Form Builder',
      description: 'Create complex forms with conditional logic, file uploads, and payment integration.',
      category: 'forms',
      author: 'FormCraft',
      version: '1.5.2',
      rating: 4.6,
      downloads: 8900,
      price: '$29',
      features: ['Drag & drop builder', 'Conditional logic', 'Payment gateway', 'Anti-spam'],
      tags: ['forms', 'builder', 'payments', 'logic'],
      isInstalled: true
    },
    {
      id: 3,
      name: 'Media Gallery Plus',
      description: 'Enhanced media management with galleries, image optimization, and CDN integration.',
      category: 'media',
      author: 'MediaWorks',
      version: '3.0.1',
      rating: 4.7,
      downloads: 15200,
      price: 'Free',
      features: ['Image optimization', 'Gallery builder', 'CDN support', 'Lazy loading'],
      tags: ['media', 'images', 'gallery', 'optimization'],
      isInstalled: false
    },
    {
      id: 4,
      name: 'E-commerce Starter',
      description: 'Complete e-commerce solution with product management, cart, and payment processing.',
      category: 'ecommerce',
      author: 'ShopCraft',
      version: '2.3.0',
      rating: 4.5,
      downloads: 6700,
      price: '$99',
      features: ['Product catalog', 'Shopping cart', 'Payment processing', 'Order management'],
      tags: ['ecommerce', 'shop', 'products', 'payments'],
      isInstalled: false
    },
    {
      id: 5,
      name: 'Analytics Dashboard',
      description: 'Comprehensive analytics with custom dashboards and detailed reporting.',
      category: 'analytics',
      author: 'DataViz Pro',
      version: '1.8.0',
      rating: 4.9,
      downloads: 9800,
      price: '$49',
      features: ['Custom dashboards', 'Real-time data', 'Export reports', 'Goal tracking'],
      tags: ['analytics', 'dashboard', 'reports', 'data'],
      isInstalled: true
    },
    {
      id: 6,
      name: 'Security Scanner',
      description: 'Automated security scanning with vulnerability detection and compliance checking.',
      category: 'security',
      author: 'SecureCore',
      version: '1.2.4',
      rating: 4.4,
      downloads: 4200,
      price: 'Free',
      features: ['Vulnerability scan', 'Malware detection', 'Security reports', 'Auto updates'],
      tags: ['security', 'scan', 'protection', 'malware'],
      isInstalled: false
    }
  ];
  
  // Categories configuration
  const categories = [
    { id: 'all', name: 'All Categories', icon: Package },
    { id: 'seo', name: 'SEO & Marketing', icon: BarChart3 },
    { id: 'forms', name: 'Forms & Data', icon: FileText },
    { id: 'media', name: 'Media & Design', icon: Camera },
    { id: 'ecommerce', name: 'E-commerce', icon: ShoppingCart },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'performance', name: 'Performance', icon: Zap }
  ];
  
  // Derived state for filtered plugins
  let installedPlugins = $derived(availablePlugins.filter(plugin => plugin.isInstalled));
  
  let filteredPlugins = $derived(() => {
    return availablePlugins.filter(plugin => {
      const matchesSearch = searchQuery === '' || 
                           plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           plugin.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  });
  
  let filteredInstalledPlugins = $derived(() => {
    return installedPlugins.filter(plugin => {
      const matchesSearch = installedSearchQuery === '' || 
                           plugin.name.toLowerCase().includes(installedSearchQuery.toLowerCase()) ||
                           plugin.description.toLowerCase().includes(installedSearchQuery.toLowerCase()) ||
                           plugin.tags.some(tag => tag.toLowerCase().includes(installedSearchQuery.toLowerCase()));
      const matchesCategory = installedSelectedCategory === 'all' || plugin.category === installedSelectedCategory;
      return matchesSearch && matchesCategory;
    });
  });
  
  // Plugin actions
  async function installPlugin(pluginId) {
    console.log('Installing plugin:', pluginId);
    // TODO: Implement API call
  }
  
  async function uninstallPlugin(pluginId) {
    if (confirm('Are you sure you want to uninstall this plugin?')) {
      console.log('Uninstalling plugin:', pluginId);
      // TODO: Implement API call
    }
  }
  
  function configurePlugin(pluginId) {
    console.log('Configuring plugin:', pluginId);
    // TODO: Navigate to plugin config page
  }
  
  function getCategoryIcon(category) {
    switch(category) {
      case 'seo': return BarChart3;
      case 'forms': return FileText;
      case 'media': return Camera;
      case 'ecommerce': return ShoppingCart;
      case 'analytics': return BarChart3;
      case 'security': return Shield;
      default: return Package;
    }
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="cms-page-header">
    <div>
      <h1 class="cms-page-title">{m.plugins_title()}</h1>
      <p class="cms-page-subtitle">{m.plugins_description()}</p>
    </div>
  </div>
  
  <!-- Tabs -->
  <div class="flex gap-1 mb-4 border-b border-base-300">
    <button 
      class="flex items-center gap-2 px-4 py-2 font-medium transition-colors {activeTab === 'store' ? 'border-b-2 border-primary text-primary' : 'text-base-content/70 hover:text-base-content'}"
      onclick={() => activeTab = 'store'}
    >
      <Package class="h-4 w-4" />
      <span>{m.plugins_tab_store()}</span>
    </button>
    <button 
      class="flex items-center gap-2 px-4 py-2 font-medium transition-colors {activeTab === 'installed' ? 'border-b-2 border-primary text-primary' : 'text-base-content/70 hover:text-base-content'}"
      onclick={() => activeTab = 'installed'}
    >
      <CheckCircle class="h-4 w-4" />
      <span>{m.plugins_tab_installed()}</span>
      <div class="w-5 h-5 {activeTab === 'installed' ? 'bg-primary/10 text-primary' : 'bg-base-content/10 text-base-content/70'} rounded-full flex items-center justify-center text-xs font-medium ml-1">
        {installedPlugins.length}
      </div>
    </button>
  </div>
  
  {#if activeTab === 'store'}
    <!-- Search and Filters -->
    <div class="cms-table-container">
      <!-- Search Bar -->
      <div class="px-6 py-4 border-b border-base-200">
        <div class="cms-search-container">
          <Search class="cms-search-icon" />
          <input 
            type="text"
            placeholder={m.plugins_search_placeholder()}
            bind:value={searchQuery}
            class="cms-search-input"
          />
        </div>
      </div>
      
      <!-- Category Filters -->
      <div class="px-6 py-4">
        <div class="flex flex-wrap gap-2">
          {#each categories as category}
            <button
              onclick={() => selectedCategory = category.id}
              class="btn btn-sm gap-2 transition-all duration-150 {selectedCategory === category.id ? 'btn-outline border-primary bg-primary/10 text-primary hover:bg-primary/20' : 'btn-ghost border-base-content/10 text-base-content/70 hover:border-base-content/20 hover:bg-base-content/5'}"
            >
              <svelte:component this={category.icon} class="w-4 h-4" />
              {category.name}
            </button>
          {/each}
        </div>
      </div>
    </div>
    
    <!-- Plugin Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {#each filteredPlugins() as plugin (plugin.id)}
        <div class="card bg-base-100 shadow-sm hover:shadow-lg transition-shadow">
          <!-- Plugin Image/Icon -->
          <div class="h-32 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <svelte:component this={getCategoryIcon(plugin.category)} class="w-12 h-12 text-base-content/30" />
          </div>
          
          <div class="card-body">
            <!-- Header -->
            <div class="flex items-start justify-between">
              <div>
                <h3 class="card-title text-lg">{plugin.name}</h3>
                <p class="text-sm text-base-content/60">by {plugin.author}</p>
              </div>
              <div class="flex items-center gap-1">
                <Star class="w-4 h-4 fill-warning text-warning" />
                <span class="text-sm font-medium">{plugin.rating}</span>
              </div>
            </div>
            
            <!-- Description -->
            <p class="text-sm text-base-content/70 line-clamp-2">{plugin.description}</p>
            
            <!-- Features -->
            <div class="flex flex-wrap gap-1">
              {#each plugin.features.slice(0, 3) as feature}
                <div class="badge badge-ghost badge-sm">{feature}</div>
              {/each}
              {#if plugin.features.length > 3}
                <div class="badge badge-neutral badge-sm">+{plugin.features.length - 3} more</div>
              {/if}
            </div>
            
            <!-- Footer -->
            <div class="flex items-center justify-between mt-2">
              <div class="text-sm text-base-content/60">
                <span>v{plugin.version}</span>
                <span class="mx-2">·</span>
                <span>{plugin.downloads.toLocaleString()} downloads</span>
              </div>
              <div class="text-success font-semibold">{plugin.price}</div>
            </div>
            
            <!-- Actions -->
            <div class="card-actions mt-4">
              {#if !plugin.isInstalled}
                <button 
                  class="btn btn-primary btn-sm flex-1"
                  onclick={() => installPlugin(plugin.id)}
                >
                  <Download class="w-4 h-4" />
                  {m.plugins_install()}
                </button>
                <button class="btn btn-ghost btn-sm btn-square">
                  <ExternalLink class="w-4 h-4" />
                </button>
              {:else}
                <button class="btn btn-success btn-sm flex-1" disabled>
                  <CheckCircle class="w-4 h-4" />
                  {m.plugins_installed()}
                </button>
                <button 
                  class="btn btn-ghost btn-sm btn-square"
                  onclick={() => configurePlugin(plugin.id)}
                >
                  <Settings class="w-4 h-4" />
                </button>
                <button 
                  class="btn btn-error btn-sm btn-square"
                  onclick={() => uninstallPlugin(plugin.id)}
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
    
    <!-- Empty State -->
    {#if filteredPlugins().length === 0}
      <div class="text-center py-12">
        <Package class="w-16 h-16 text-base-content/20 mx-auto mb-4" />
        <h3 class="text-lg font-semibold mb-2">{m.plugins_no_results()}</h3>
        <p class="text-base-content/60">{m.plugins_no_results_description()}</p>
      </div>
    {/if}
  {/if}
  
  {#if activeTab === 'installed'}
    <!-- Search and Filters -->
    <div class="cms-table-container">
      <!-- Search Bar -->
      <div class="px-6 py-4 border-b border-base-200">
        <div class="cms-search-container">
          <Search class="cms-search-icon" />
          <input 
            type="text"
            placeholder={m.plugins_search_placeholder()}
            bind:value={installedSearchQuery}
            class="cms-search-input"
          />
        </div>
      </div>
      
      <!-- Category Filters -->
      <div class="px-6 py-4">
        <div class="flex flex-wrap gap-2">
          {#each categories as category}
            <button
              onclick={() => installedSelectedCategory = category.id}
              class="btn btn-sm gap-2 transition-all duration-150 {installedSelectedCategory === category.id ? 'btn-outline border-primary bg-primary/10 text-primary hover:bg-primary/20' : 'btn-ghost border-base-content/10 text-base-content/70 hover:border-base-content/20 hover:bg-base-content/5'}"
            >
              <svelte:component this={category.icon} class="w-4 h-4" />
              {category.name}
            </button>
          {/each}
        </div>
      </div>
    </div>
    
    <!-- Installed Plugins List -->
    <div class="space-y-3">
      {#if filteredInstalledPlugins().length > 0}
        {#each filteredInstalledPlugins() as plugin (plugin.id)}
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <!-- Plugin Icon -->
                  <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svelte:component this={getCategoryIcon(plugin.category)} class="w-6 h-6 text-primary" />
                  </div>
                  
                  <!-- Plugin Info -->
                  <div>
                    <h3 class="font-semibold">{plugin.name}</h3>
                    <p class="text-sm text-base-content/60">
                      Version {plugin.version} · by {plugin.author}
                    </p>
                  </div>
                </div>
                
                <!-- Actions -->
                <div class="flex items-center gap-3">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 bg-success rounded-full"></div>
                    <span class="text-sm text-success">{m.plugins_active()}</span>
                  </div>
                  
                  <button 
                    class="btn btn-ghost btn-sm btn-square"
                    onclick={() => configurePlugin(plugin.id)}
                  >
                    <Settings class="w-5 h-5" />
                  </button>
                  
                  <button 
                    class="btn btn-ghost btn-sm btn-square text-error"
                    onclick={() => uninstallPlugin(plugin.id)}
                  >
                    <Trash2 class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        {/each}
      {:else if installedPlugins.length === 0}
        <!-- No Installed Plugins -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body text-center py-12">
            <Package class="w-16 h-16 text-base-content/20 mx-auto mb-4" />
            <h3 class="text-lg font-semibold mb-2">{m.plugins_no_installed()}</h3>
            <p class="text-base-content/60 mb-6">{m.plugins_no_installed_description()}</p>
            <button
              onclick={() => activeTab = 'store'}
              class="btn btn-primary"
            >
              {m.plugins_browse_store()}
            </button>
          </div>
        </div>
      {:else}
        <!-- No Results from Search/Filter -->
        <div class="text-center py-12">
          <Package class="w-16 h-16 text-base-content/20 mx-auto mb-4" />
          <h3 class="text-lg font-semibold mb-2">{m.plugins_no_results()}</h3>
          <p class="text-base-content/60">{m.plugins_no_results_description()}</p>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
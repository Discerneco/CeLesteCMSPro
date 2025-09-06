<script>
  // Props with defaults
  export let variant = 'main';
  export let siteName = 'Site';
  export let menuItems = [
    { title: 'Home', url: './', active: true },
    { title: 'Blog', url: './blog/', active: false },
    { title: 'About', url: './about/', active: false },
    { title: 'Contact', url: './contact/', active: false }
  ];
  export let context = null;

  // Use site name from context if available
  $: displaySiteName = context?.site?.name || siteName;
</script>

{#if variant === 'minimal'}
  <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div class="container mx-auto px-4 py-3">
      <div class="flex items-center justify-between">
        <a href="./" class="text-xl font-bold text-gray-900 hover:text-gray-700">
          {displaySiteName}
        </a>
        <div class="hidden md:flex items-center space-x-6">
          {#each menuItems as item}
            <a 
              href={item.url} 
              class="text-gray-700 hover:text-gray-900 font-medium transition-colors {item.active ? 'text-blue-600 font-semibold' : ''}"
            >
              {item.title}
            </a>
          {/each}
        </div>
        <!-- Mobile menu button -->
        <button class="md:hidden p-2 rounded-lg hover:bg-gray-100" aria-label="Toggle mobile menu">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </div>
  </nav>
{:else}
  <!-- Main navigation (default) -->
  <nav class="bg-white shadow-md sticky top-0 z-50">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center">
          <a href="./" class="text-2xl font-bold text-gray-900 hover:text-gray-700">
            {displaySiteName}
          </a>
        </div>
        
        <div class="hidden lg:flex items-center space-x-8">
          {#each menuItems as item}
            <a 
              href={item.url}
              class="px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 font-medium transition-colors {item.active ? 'text-blue-600 bg-blue-50 font-semibold' : ''}"
            >
              {item.title}
            </a>
          {/each}
        </div>
        
        <!-- Mobile menu button -->
        <div class="lg:hidden">
          <button class="p-2 rounded-lg hover:bg-gray-100 text-gray-700" aria-label="Open mobile menu">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </nav>
{/if}
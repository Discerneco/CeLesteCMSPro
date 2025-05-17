<script>
  // Using Svelte 5 runes syntax
  let { title = '', subtitle = '', isDarkMode = false, className = '' } = $props();
</script>

<div class={`rounded-lg shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} ${className}`}>
  <div class="px-8 pt-8 pb-6">
    {#if title}
      <div class="text-center mb-2">
        <h1 class="text-2xl font-bold">{title}</h1>
        {#if subtitle}
          <p class={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>
        {/if}
      </div>
    {/if}
    
    <!-- Content area -->
    <div class="login-card-content">
      <!-- Error message will be placed here -->
      <div class="error-container"></div>
      
      <!-- Main content -->
      <div class="content-container"></div>
    </div>
    
    <!-- Footer with light gray border in light mode and dark gray in dark mode -->
    <div class="mt-8 pt-6 border-t text-center text-sm" class:border-gray-200={!isDarkMode} class:border-gray-800={isDarkMode}>
      <div class="footer-container"></div>
    </div>
  </div>
</div>

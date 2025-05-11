<script>
  // Using Svelte 5 runes syntax
  let { 
    title = '', 
    subtitle = '', 
    isDarkMode = false, 
    errorMessage = '',
    footerText = '',
    className = '' 
  } = $props();
</script>

<div class={`rounded-lg shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} ${className}`}>
  <div class="px-8 pt-8 pb-6">
    {#if title}
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold">{title}</h1>
        {#if subtitle}
          <p class={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>
        {/if}
      </div>
    {/if}
    
    {#if errorMessage}
      <div class="mb-6 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md flex items-center dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
        <span>{errorMessage}</span>
      </div>
    {/if}
    
    <!-- Main content -->
    <div class="auth-card-content">
      <slot></slot>
    </div>
    
    <!-- Footer with light gray border -->
    {#if footerText}
      <div class="mt-8 pt-6 border-t text-center text-sm" class:border-gray-200={!isDarkMode} class:border-gray-800={isDarkMode}>
        <p class={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
          {footerText}
        </p>
      </div>
    {/if}
  </div>
</div>

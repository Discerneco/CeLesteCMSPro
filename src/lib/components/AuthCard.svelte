<script>
  // Using Svelte 5 runes syntax
  import { AlertCircle } from '@lucide/svelte';
  
  let { 
    title = '', 
    subtitle = '', 
    errorMessage = '',
    footerText = '',
    className = '',
    children
  } = $props();
</script>

<div class={`card bg-base-100 shadow-xl overflow-hidden ${className}`}>
  <div class="card-body">
    {#if title}
      <div class="text-center mb-6">
        <h2 class="card-title text-2xl font-bold justify-center">{title}</h2>
        {#if subtitle}
          <p class="text-center text-base-content/70 mt-2">{subtitle}</p>
        {/if}
      </div>
    {/if}
    
    {#if errorMessage}
      <div class="alert alert-error mb-6">
        <AlertCircle class="h-5 w-5" />
        <span>{errorMessage}</span>
      </div>
    {/if}
    
    <!-- Main content -->
    <div class="auth-card-content">
      {children}
    </div>
    
    <!-- Footer -->
    {#if footerText}
      <div class="divider mt-6 mb-4"></div>
      <p class="text-xs text-center text-base-content/70">
        {footerText}
      </p>
    {/if}
  </div>
</div>

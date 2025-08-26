<script>
  import { page } from '$app/stores';
  import { Eye, ExternalLink, Home, ArrowLeft } from '@lucide/svelte';
  
  let { data } = $props();
  
  // Extract site info from the HTML (basic parsing)
  function extractSiteTitle(html) {
    const match = html.match(/<title>([^<]+)<\/title>/);
    return match ? match[1] : 'Generated Site';
  }
  
  const siteTitle = extractSiteTitle(data.html);
</script>

<svelte:head>
  <title>Preview: {siteTitle}</title>
</svelte:head>

<!-- Preview Header -->
<div class="bg-primary text-primary-content p-4 sticky top-0 z-50 shadow-lg">
  <div class="container mx-auto flex items-center justify-between">
    <div class="flex items-center gap-4">
      <a href="/admin/sites" class="btn btn-ghost btn-sm">
        <ArrowLeft class="h-4 w-4" />
        Back to Sites
      </a>
      
      <div class="flex items-center gap-2">
        <Eye class="h-5 w-5" />
        <span class="font-semibold">Preview Mode</span>
      </div>
      
      <div class="badge badge-secondary">
        Site ID: {data.siteId}
      </div>
    </div>
    
    <div class="flex items-center gap-2">
      <span class="text-sm opacity-80">Generated Site Preview</span>
      <ExternalLink class="h-4 w-4" />
    </div>
  </div>
</div>

<!-- Generated Site Content -->
<div class="preview-container">
  {@html data.html}
</div>

<style>
  /* Ensure preview content takes full width */
  :global(.preview-container) {
    width: 100%;
    min-height: calc(100vh - 80px); /* Account for header */
  }
  
  /* Override any conflicting styles from the generated content */
  :global(.preview-container *) {
    box-sizing: border-box;
  }
  
  /* Ensure generated content doesn't conflict with admin styles */
  :global(.preview-container [data-theme]) {
    /* Let generated content manage its own theme */
  }
</style>
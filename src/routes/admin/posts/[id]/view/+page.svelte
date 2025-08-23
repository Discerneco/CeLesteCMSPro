<script>
  import { ArrowLeft } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  
  // Import i18n with modern Paraglide pattern
  import * as m from '$lib/paraglide/messages';
  
  // Get data from load function (Svelte 5 runes mode)
  let { data } = $props();
  
  // Get tab from URL to know where to return
  let returnTab = $page.url.searchParams.get('tab');
  
  // Navigate back preserving tab state
  function handleBack() {
    const returnUrl = returnTab === 'trash' ? '/admin/posts?tab=trash' : '/admin/posts';
    goto(returnUrl);
  }
</script>

<!-- Page Header -->
<div class="cms-page-header">
  <div>
    <h1 class="cms-page-title">View Post</h1>
    <p class="cms-page-subtitle">Viewing: {data.post.title}</p>
  </div>
  <button 
    onclick={handleBack}
    class="btn btn-outline gap-2"
  >
    <ArrowLeft class="h-4 w-4" />
    Back to {returnTab === 'trash' ? 'Trash' : 'Posts'}
  </button>
</div>

<!-- Post Content -->
<div class="cms-grid-content">
  <!-- Post Details -->
  <div class="cms-card">
    <div class="cms-card-body">
      <h2 class="cms-card-title">Post Details</h2>
      <div class="space-y-4">
        <div>
          <div class="label">
            <span class="label-text font-semibold">Status</span>
          </div>
          <div class="badge {data.post.status === 'trash' ? 'badge-error' : 'badge-info'}">
            {data.post.status}
          </div>
        </div>
        
        <div>
          <div class="label">
            <span class="label-text font-semibold">Author</span>
          </div>
          <p class="text-base-content">{data.post.author || 'Unknown'}</p>
        </div>
        
        <div>
          <div class="label">
            <span class="label-text font-semibold">Created</span>
          </div>
          <p class="text-base-content">{data.post.createdAtFormatted}</p>
        </div>
        
        {#if data.post.publishedAt}
        <div>
          <div class="label">
            <span class="label-text font-semibold">Published</span>
          </div>
          <p class="text-base-content">{data.post.publishedAtFormatted}</p>
        </div>
        {/if}
        
        {#if data.post.featured}
        <div>
          <div class="label">
            <span class="label-text font-semibold">Featured</span>
          </div>
          <div class="badge badge-warning">Featured Post</div>
        </div>
        {/if}
      </div>
    </div>
  </div>
  
  <!-- Post Content -->
  <div class="cms-card md:col-span-2">
    <div class="cms-card-body">
      <h2 class="cms-card-title">{data.post.title}</h2>
      
      {#if data.post.excerpt}
      <div class="mb-6">
        <p class="text-base-content/70 italic">{data.post.excerpt}</p>
      </div>
      {/if}
      
      <div class="prose max-w-none">
        {#each (data.post.content || '').split('\n\n') as paragraph}
          <p>{paragraph}</p>
        {/each}
      </div>
    </div>
  </div>
</div>
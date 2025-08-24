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
  
  // Translate post status
  function getStatusText(status) {
    switch (status) {
      case 'published':
        return m.posts_status_published();
      case 'draft':
        return m.posts_status_draft();
      case 'archived':
        return m.posts_status_archived();
      case 'scheduled':
        return m.posts_status_scheduled();
      case 'trash':
        return m.posts_status_trash();
      default:
        return status;
    }
  }
</script>

<!-- Page Header -->
<div class="cms-page-header">
  <div>
    <h1 class="cms-page-title">{m.posts_view_title()}</h1>
    <p class="cms-page-subtitle">{m.posts_view_viewing()}: {data.post.title}</p>
  </div>
  <button 
    onclick={handleBack}
    class="btn btn-outline gap-2"
  >
    <ArrowLeft class="h-4 w-4" />
    {returnTab === 'trash' ? m.posts_view_back_to_trash() : m.posts_view_back_to_posts()}
  </button>
</div>

<!-- Post Content -->
<div class="cms-grid-content">
  <!-- Post Details -->
  <div class="cms-card">
    <div class="cms-card-body">
      <h2 class="cms-card-title">{m.posts_view_details()}</h2>
      <div class="space-y-4">
        <div>
          <div class="label">
            <span class="label-text font-semibold">{m.posts_form_status()}</span>
          </div>
          <div class="badge {data.post.status === 'trash' ? 'badge-error' : 'badge-info'}">
            {getStatusText(data.post.status)}
          </div>
        </div>
        
        <div>
          <div class="label">
            <span class="label-text font-semibold">{m.posts_form_author()}</span>
          </div>
          <p class="text-base-content">{data.post.author || m.users_unknown()}</p>
        </div>
        
        <div>
          <div class="label">
            <span class="label-text font-semibold">{m.posts_view_created()}</span>
          </div>
          <p class="text-base-content">{data.post.createdAtFormatted}</p>
        </div>
        
        {#if data.post.publishedAt}
        <div>
          <div class="label">
            <span class="label-text font-semibold">{m.posts_view_published()}</span>
          </div>
          <p class="text-base-content">{data.post.publishedAtFormatted}</p>
        </div>
        {/if}
        
        {#if data.post.featured}
        <div>
          <div class="label">
            <span class="label-text font-semibold">{m.posts_view_featured()}</span>
          </div>
          <div class="badge badge-warning">{m.posts_view_featured_badge()}</div>
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
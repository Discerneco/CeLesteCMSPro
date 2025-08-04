<script lang="ts">
  import { 
    ArrowLeft, 
    Calendar, 
    Edit,
    User,
    Tag,
    Star,
    Clock
  } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  
  // Import i18n with modern Paraglide pattern
  import * as m from '$lib/paraglide/messages';
  
  // Get data from load function (Svelte 5 runes mode)
  let { data } = $props();
  
  const post = data.post;
  
  // Parse multilingual content from metaData if available
  const multilingualContent = post.metaData?.multilingual || null;
  
  const handleBack = () => {
    goto('/admin/posts');
  };
  
  const handleEdit = () => {
    goto(`/admin/posts/${post.id}/edit`);
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'published':
        return 'cms-status-published';
      case 'draft':
        return 'cms-status-draft';
      case 'archived':
        return 'cms-status-archived';
      default:
        return 'cms-status-draft';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return m.posts_status_published();
      case 'draft':
        return m.posts_status_draft();
      case 'archived':
        return m.posts_status_archived();
      default:
        return status;
    }
  };
  
  // Format content for display
  const formatContent = (content: string) => {
    // Basic markdown-like formatting
    return content.split('\n\n');
  };
</script>

<!-- Page Header -->
<div class="cms-page-header">
  <div>
    <h1 class="cms-page-title">View Post</h1>
    <p class="cms-page-subtitle">Post details and content preview</p>
  </div>
  <div class="flex gap-2">
    <button 
      onclick={handleBack}
      class="btn btn-outline gap-2"
    >
      <ArrowLeft class="h-4 w-4" />
      {m.posts_form_back_to_posts()}
    </button>
    
    <button 
      onclick={handleEdit}
      class="btn btn-primary gap-2"
    >
      <Edit class="h-4 w-4" />
      {m.posts_action_edit()}
    </button>
  </div>
</div>

<div class="cms-grid-content">
  <!-- Post Metadata -->
  <div class="cms-card">
    <div class="cms-card-body">
      <h2 class="cms-card-title">Post Information</h2>
      <div class="space-y-4">
        <!-- Post Status -->
        <div>
          <div class="text-sm text-base-content/60 mb-1">Status</div>
          <span class="cms-status-badge {getStatusClass(post.status)}">
            {getStatusText(post.status)}
          </span>
        </div>
        
        <!-- Featured -->
        {#if post.featured}
          <div>
            <div class="text-sm text-base-content/60 mb-1">Featured</div>
            <div class="flex items-center gap-2">
              <Star class="h-4 w-4 text-warning fill-warning" />
              <span class="text-sm font-medium">Featured Post</span>
            </div>
          </div>
        {/if}
        
        <!-- Author -->
        <div>
          <div class="text-sm text-base-content/60 mb-1">Author</div>
          <div class="flex items-center gap-2">
            <User class="h-4 w-4 text-base-content/60" />
            <span class="text-sm font-medium capitalize">{post.author}</span>
          </div>
        </div>
        
        <!-- Dates -->
        <div>
          <div class="text-sm text-base-content/60 mb-1">Created</div>
          <div class="flex items-center gap-2">
            <Calendar class="h-4 w-4 text-base-content/60" />
            <span class="text-sm">{post.createdAtFormatted}</span>
          </div>
        </div>
        
        {#if post.publishedAt}
          <div>
            <div class="text-sm text-base-content/60 mb-1">Published</div>
            <div class="flex items-center gap-2">
              <Clock class="h-4 w-4 text-base-content/60" />
              <span class="text-sm">{post.publishedAtFormatted}</span>
            </div>
          </div>
        {/if}
        
        <!-- Post ID -->
        <div>
          <div class="text-sm text-base-content/60 mb-1">Post ID</div>
          <code class="text-xs bg-base-200 px-2 py-1 rounded">{post.id}</code>
        </div>
        
        <!-- Slug -->
        <div>
          <div class="text-sm text-base-content/60 mb-1">Slug</div>
          <code class="text-xs bg-base-200 px-2 py-1 rounded break-all">{post.slug}</code>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Post Content -->
  <div class="cms-card md:col-span-2">
    <div class="cms-card-body">
      <h2 class="cms-card-title">Content</h2>
      
      {#if multilingualContent}
        <!-- Multilingual Content -->
        <div class="space-y-8">
          <!-- English Content -->
          {#if multilingualContent.en?.title}
            <div>
              <div class="text-sm font-medium text-primary mb-2">{m.posts_form_tab_english()}</div>
              <h3 class="text-2xl font-bold mb-2">{multilingualContent.en.title}</h3>
              {#if multilingualContent.en.excerpt}
                <p class="text-base-content/70 italic mb-4">{multilingualContent.en.excerpt}</p>
              {/if}
              <div class="prose max-w-none">
                {#each formatContent(multilingualContent.en.content || '') as paragraph}
                  {#if paragraph.trim()}
                    <p>{paragraph}</p>
                  {/if}
                {/each}
              </div>
            </div>
          {/if}
          
          <!-- Portuguese Content -->
          {#if multilingualContent.pt?.title}
            <div class="divider"></div>
            <div>
              <div class="text-sm font-medium text-primary mb-2">{m.posts_form_tab_portuguese()}</div>
              <h3 class="text-2xl font-bold mb-2">{multilingualContent.pt.title}</h3>
              {#if multilingualContent.pt.excerpt}
                <p class="text-base-content/70 italic mb-4">{multilingualContent.pt.excerpt}</p>
              {/if}
              <div class="prose max-w-none">
                {#each formatContent(multilingualContent.pt.content || '') as paragraph}
                  {#if paragraph.trim()}
                    <p>{paragraph}</p>
                  {/if}
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <!-- Single Language Content -->
        <div>
          <h3 class="text-2xl font-bold mb-2">{post.title}</h3>
          {#if post.excerpt}
            <p class="text-base-content/70 italic mb-4">{post.excerpt}</p>
          {/if}
          <div class="prose max-w-none">
            {#each formatContent(post.content || '') as paragraph}
              {#if paragraph.trim()}
                <p>{paragraph}</p>
              {/if}
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
<script lang="ts">
  import { 
    ArrowLeft, 
    Edit, 
    Calendar,
    Eye,
    User,
    Globe,
    Image as ImageIcon
  } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  
  // Import i18n with modern Paraglide pattern
  import * as m from '$lib/paraglide/messages';
  
  // Get data from load function (Svelte 5 runes mode)
  let { data } = $props();
  
  // Parse multilingual content from metaData if available
  let multilingualContent = data.page.metaData?.multilingual || null;
  
  // Content for both languages
  let content = {
    en: {
      title: multilingualContent?.en?.title || data.page.title || '',
      excerpt: multilingualContent?.en?.excerpt || data.page.excerpt || '',
      content: multilingualContent?.en?.content || data.page.content || ''
    },
    pt: {
      title: multilingualContent?.pt?.title || '',
      excerpt: multilingualContent?.pt?.excerpt || '',
      content: multilingualContent?.pt?.content || ''
    }
  };
  
  const handleEdit = () => {
    goto(`/admin/pages/${data.page.id}/edit`);
  };
  
  const handleBack = () => {
    goto('/admin/pages');
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'published': return 'badge-success';
      case 'draft': return 'badge-warning';
      case 'scheduled': return 'badge-info';
      case 'archived': return 'badge-secondary';
      case 'trash': return 'badge-error';
      default: return 'badge-ghost';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return m.pages_status_published();
      case 'draft': return m.pages_status_draft();
      case 'scheduled': return 'Scheduled';
      case 'archived': return m.pages_status_archived();
      case 'trash': return m.pages_status_trash();
      default: return status;
    }
  };
</script>

<!-- Page Header -->
<div class="cms-page-header">
  <div>
    <h1 class="cms-page-title">{data.page.title || 'Untitled Page'}</h1>
    <p class="cms-page-subtitle">Page Preview</p>
  </div>
  <div class="flex gap-2">
    <button 
      onclick={handleBack}
      class="btn btn-outline gap-2"
    >
      <ArrowLeft class="h-4 w-4" />
      {m.pages_form_back_to_pages()}
    </button>
    
    <button 
      onclick={handleEdit}
      class="btn btn-primary gap-2"
    >
      <Edit class="h-4 w-4" />
      Edit Page
    </button>
  </div>
</div>

<div class="cms-grid-content">
  <!-- Page Metadata -->
  <div class="cms-card">
    <div class="cms-card-body">
      <h2 class="cms-card-title">Page Details</h2>
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <div class="badge {getStatusBadgeClass(data.page.status)}">
            {getStatusText(data.page.status)}
          </div>
        </div>
        
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm text-base-content/60">
            <Calendar class="h-4 w-4" />
            <span>Created: {formatDate(data.page.createdAt)}</span>
          </div>
          
          {#if data.page.publishedAt}
            <div class="flex items-center gap-2 text-sm text-base-content/60">
              <Eye class="h-4 w-4" />
              <span>Published: {formatDate(data.page.publishedAt)}</span>
            </div>
          {/if}
          
          {#if data.page.author}
            <div class="flex items-center gap-2 text-sm text-base-content/60">
              <User class="h-4 w-4" />
              <span>Author: {data.page.author.firstName || ''} {data.page.author.lastName || ''} (@{data.page.author.username})</span>
            </div>
          {/if}
        </div>
        
        <div class="divider"></div>
        
        <div class="space-y-2">
          <div class="text-sm font-medium">URL Slug</div>
          <div class="font-mono text-sm bg-base-200 p-2 rounded">
            /{data.page.slug}
          </div>
        </div>
        
        {#if data.page.featuredImageId}
          <div class="divider"></div>
          <div class="flex items-center gap-2 text-sm text-primary">
            <ImageIcon class="h-4 w-4" />
            <span>Has Featured Image</span>
          </div>
        {/if}
      </div>
    </div>
  </div>
  
  <!-- Page Content Preview -->
  <div class="cms-card md:col-span-2">
    <div class="cms-card-body">
      <h2 class="cms-card-title">Content Preview</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- English Content -->
        <div>
          <div class="mb-4 flex items-center gap-2 text-sm font-medium text-primary">
            <Globe class="h-4 w-4" />
            {m.posts_form_tab_english()}
          </div>
          
          <div class="space-y-4">
            <div>
              <h3 class="text-xl font-bold mb-2">
                {content.en.title || 'No English title'}
              </h3>
              {#if content.en.excerpt}
                <p class="text-base-content/70 italic mb-4">
                  {content.en.excerpt}
                </p>
              {/if}
            </div>
            
            {#if content.en.content}
              <div class="prose max-w-none">
                {#each content.en.content.split('\n\n') as paragraph}
                  <p>{paragraph}</p>
                {/each}
              </div>
            {:else}
              <div class="text-base-content/50 italic">No English content</div>
            {/if}
          </div>
        </div>
        
        <!-- Portuguese Content -->
        <div>
          <div class="mb-4 flex items-center gap-2 text-sm font-medium text-primary">
            <Globe class="h-4 w-4" />
            {m.posts_form_tab_portuguese()}
          </div>
          
          <div class="space-y-4">
            <div>
              <h3 class="text-xl font-bold mb-2">
                {content.pt.title || 'No Portuguese title'}
              </h3>
              {#if content.pt.excerpt}
                <p class="text-base-content/70 italic mb-4">
                  {content.pt.excerpt}
                </p>
              {/if}
            </div>
            
            {#if content.pt.content}
              <div class="prose max-w-none">
                {#each content.pt.content.split('\n\n') as paragraph}
                  <p>{paragraph}</p>
                {/each}
              </div>
            {:else}
              <div class="text-base-content/50 italic">No Portuguese content</div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
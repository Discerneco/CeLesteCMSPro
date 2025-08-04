<script lang="ts">
  import { 
    ArrowLeft, 
    Calendar, 
    ChevronDown, 
    Eye, 
    Save, 
    Sparkles, 
    Trash2, 
    X,
    Globe
  } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  
  // Import i18n with modern Paraglide pattern
  import * as m from '$lib/paraglide/messages';
  
  // Svelte 5 runes for state management
  let activeTab = $state('en');
  let isFeatured = $state(false);
  let previewMode = $state(false);
  let isLoading = $state(false);
  
  // Content state for both languages
  let content = $state({
    en: {
      title: '',
      excerpt: '',
      content: ''
    },
    pt: {
      title: '',
      excerpt: '',
      content: ''
    }
  });
  
  // Form metadata
  let publicationDate = $state(new Date().toISOString().split('T')[0]);
  let status = $state('draft');
  
  const togglePreview = () => previewMode = !previewMode;
  
  const handleTitleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (activeTab === 'en') {
      content.en.title = target.value;
    } else {
      content.pt.title = target.value;
    }
  };

  const handleExcerptInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (activeTab === 'en') {
      content.en.excerpt = target.value;
    } else {
      content.pt.excerpt = target.value;
    }
  };

  const handleContentInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    if (activeTab === 'en') {
      content.en.content = target.value;
    } else {
      content.pt.content = target.value;
    }
  };
  
  const handleSave = async () => {
    isLoading = true;
    
    try {
      // Prepare the post data
      const postData = {
        title: content.en.title || content.pt.title, // Use first available title
        slug: generateSlug(content.en.title || content.pt.title),
        excerpt: content.en.excerpt || content.pt.excerpt,
        content: content.en.content || content.pt.content,
        status: status,
        featured: isFeatured,
        publishedAt: status === 'published' ? new Date(publicationDate).toISOString() : null,
        // For now, we'll store the multilingual content in a simple way
        // Later we can enhance this with proper i18n content management
        metaData: JSON.stringify({
          multilingual: content
        })
      };
      
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });
      
      if (response.ok) {
        // Success - redirect to posts list
        goto('/admin/posts');
      } else {
        const error = await response.text();
        console.error('Failed to save post:', error);
        alert('Failed to save post. Please try again.');
      }
    } catch (err) {
      console.error('Error saving post:', err);
      alert('An error occurred while saving. Please try again.');
    } finally {
      isLoading = false;
    }
  };
  
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };
  
  const handleBack = () => {
    goto('/admin/posts');
  };
</script>

<!-- Page Header -->
<div class="cms-page-header">
  <div>
    <h1 class="cms-page-title">{m.posts_new_post()}</h1>
    <p class="cms-page-subtitle">{m.posts_form_subtitle()}</p>
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
      onclick={handleSave}
      class="btn btn-primary gap-2"
      disabled={isLoading}
    >
      {#if isLoading}
        <span class="loading loading-spinner loading-sm"></span>
        {m.posts_form_saving()}
      {:else}
        <Save class="h-4 w-4" />
        {m.posts_form_save()}
      {/if}
    </button>
  </div>
</div>

<!-- Language Tabs -->
{#if !previewMode}
  <div class="tabs tabs-bordered mb-6">
    <button
      class="tab {activeTab === 'en' ? 'tab-active' : ''}"
      onclick={() => activeTab = 'en'}
    >
      <Globe class="h-4 w-4 mr-2" />
      {m.posts_form_tab_english()}
    </button>
    <button
      class="tab {activeTab === 'pt' ? 'tab-active' : ''}"
      onclick={() => activeTab = 'pt'}
    >
      <Globe class="h-4 w-4 mr-2" />
      {m.posts_form_tab_portuguese()}
    </button>
  </div>
{/if}

{#if previewMode}
  <!-- Preview Mode -->
  <div class="cms-grid-content">
    <div class="cms-card md:col-span-2">
      <div class="cms-card-body">
        <div class="mb-4 flex items-center justify-between">
          <div class="text-sm font-medium text-primary">{m.posts_form_preview_mode()}</div>
          <button 
            onclick={togglePreview}
            class="btn btn-outline btn-sm gap-2"
          >
            <X class="h-4 w-4" />
            {m.posts_form_close_preview()}
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div class="mb-2 text-sm font-medium text-primary">{m.posts_form_tab_english()}</div>
            <h2 class="text-2xl font-bold mb-4">{content.en.title || m.posts_form_untitled()}</h2>
            <p class="text-base-content/70 italic mb-6">{content.en.excerpt || m.posts_form_no_excerpt()}</p>
            <div class="prose max-w-none">
              {#each content.en.content.split('\n\n') as paragraph}
                <p>{paragraph}</p>
              {/each}
            </div>
          </div>
          
          <div>
            <div class="mb-2 text-sm font-medium text-primary">{m.posts_form_tab_portuguese()}</div>
            <h2 class="text-2xl font-bold mb-4">{content.pt.title || m.posts_form_untitled()}</h2>
            <p class="text-base-content/70 italic mb-6">{content.pt.excerpt || m.posts_form_no_excerpt()}</p>
            <div class="prose max-w-none">
              {#each content.pt.content.split('\n\n') as paragraph}
                <p>{paragraph}</p>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{:else}
  <!-- Edit Mode -->
  <div class="cms-grid-content">
    <!-- Article Metadata -->
    <div class="cms-card">
      <div class="cms-card-body">
        <h2 class="cms-card-title">{m.posts_form_settings()}</h2>
        <div class="space-y-4">
          <div>
            <label class="label">
              <span class="label-text">{m.posts_form_publication_date()}</span>
            </label>
            <div class="relative">
              <input 
                type="date" 
                bind:value={publicationDate}
                class="input w-full pr-8"
              />
              <Calendar class="absolute right-2 top-2.5 h-4 w-4 text-base-content/60" />
            </div>
          </div>
          
          <div>
            <label class="label">
              <span class="label-text">{m.posts_form_status()}</span>
            </label>
            <div class="relative">
              <select 
                bind:value={status}
                class="select w-full"
              >
                <option value="draft">{m.posts_form_status_draft()}</option>
                <option value="published">{m.posts_form_status_published()}</option>
                <option value="scheduled">{m.posts_form_status_scheduled()}</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="label cursor-pointer">
              <span class="label-text flex items-center gap-2">
                {m.posts_form_featured()}
                <Sparkles class="h-4 w-4 text-warning" />
              </span>
              <input 
                type="checkbox" 
                class="checkbox checkbox-primary" 
                bind:checked={isFeatured}
              />
            </label>
          </div>
          
          <div class="divider"></div>
          
          <button 
            onclick={togglePreview}
            class="btn btn-outline w-full gap-2"
          >
            <Eye class="h-4 w-4" />
            {m.posts_form_preview()}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Article Content -->
    <div class="cms-card md:col-span-2">
      <div class="cms-card-body">
        <h2 class="cms-card-title">{m.posts_form_content_section()} - {activeTab === 'en' ? m.posts_form_tab_english() : m.posts_form_tab_portuguese()}</h2>
        
        <div class="space-y-4">
          <div>
            <label class="label">
              <span class="label-text">{m.posts_form_title()}</span>
            </label>
            <input 
              type="text" 
              class="input w-full"
              value={activeTab === 'en' ? content.en.title : content.pt.title}
              oninput={handleTitleInput}
              placeholder={activeTab === 'en' ? m.posts_form_title_placeholder_en() : m.posts_form_title_placeholder_pt()}
            />
          </div>
          
          <div>
            <label class="label">
              <span class="label-text">{m.posts_form_excerpt()}</span>
            </label>
            <input 
              type="text" 
              class="input w-full"
              value={activeTab === 'en' ? content.en.excerpt : content.pt.excerpt}
              oninput={handleExcerptInput}
              placeholder={activeTab === 'en' ? m.posts_form_excerpt_placeholder_en() : m.posts_form_excerpt_placeholder_pt()}
            />
          </div>
          
          <div>
            <label class="label">
              <span class="label-text">{m.posts_form_content()}</span>
            </label>
            <textarea 
              class="textarea w-full h-64"
              value={activeTab === 'en' ? content.en.content : content.pt.content}
              oninput={handleContentInput}
              placeholder={activeTab === 'en' ? m.posts_form_content_placeholder_en() : m.posts_form_content_placeholder_pt()}
            ></textarea>
            <div class="label">
              <span class="label-text-alt">{m.posts_form_markdown_support()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
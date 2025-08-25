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
  
  // Import i18n messages
  import * as m from '$lib/paraglide/messages';
  
  // Import rich text editor
  import RichTextEditor from '$lib/components/RichTextEditor.svelte';
  
  // Import featured image component
  import FeaturedImageUpload from '$lib/components/FeaturedImageUpload.svelte';
  
  // Get data from load function (Svelte 5 runes mode)
  let { data } = $props();
  
  // Initialize state from existing post data
  let postId = data.post.id;
  let postSlug = $state(data.post.slug);
  
  // Parse multilingual content from metaData if available
  let multilingualContent = data.post.metaData?.multilingual || null;
  
  // Svelte 5 runes for state management
  let activeTab = $state('en');
  let isFeatured = $state(data.post.featured || false);
  let selectedAuthorId = $state(data.post.authorId || '');
  let featuredImageId = $state(data.post.featuredImageId || null);
  let previewMode = $state(false);
  let isLoading = $state(false);
  
  // Content state for both languages - initialized from existing data
  let content = $state({
    en: {
      title: multilingualContent?.en?.title || data.post.title || '',
      excerpt: multilingualContent?.en?.excerpt || data.post.excerpt || '',
      content: multilingualContent?.en?.content || data.post.content || ''
    },
    pt: {
      title: multilingualContent?.pt?.title || '',
      excerpt: multilingualContent?.pt?.excerpt || '',
      content: multilingualContent?.pt?.content || ''
    }
  });
  
  // Form metadata - initialized from existing data
  let publicationDate = $state(
    data.post.publishedAt 
      ? new Date(data.post.publishedAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  let status = $state(data.post.status || 'draft');
  
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

  const handleContentUpdate = (newContent: string) => {
    if (activeTab === 'en') {
      content.en.content = newContent;
    } else {
      content.pt.content = newContent;
    }
  };
  
  const handleFeaturedImageUpload = (mediaId: string) => {
    featuredImageId = mediaId;
  };
  
  const handleFeaturedImageRemove = () => {
    featuredImageId = null;
  };
  
  const handleSave = async () => {
    isLoading = true;
    
    try {
      // Prepare the post data
      const postData = {
        title: content.en.title || content.pt.title, // Use first available title
        slug: postSlug, // Keep existing slug unless changed
        excerpt: content.en.excerpt || content.pt.excerpt,
        content: content.en.content || content.pt.content,
        status: status,
        featured: isFeatured,
        authorId: selectedAuthorId,
        featuredImageId: featuredImageId,
        publishedAt: status === 'published' ? new Date(publicationDate).toISOString() : null,
        // Store the multilingual content
        metaData: JSON.stringify({
          multilingual: content
        })
      };
      
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
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
        console.error('Failed to update post:', error);
        alert('Failed to update post. Please try again.');
      }
    } catch (err) {
      console.error('Error updating post:', err);
      alert('An error occurred while updating. Please try again.');
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
    <h1 class="cms-page-title">{m.posts_edit_post()}</h1>
    <p class="cms-page-subtitle">{m.posts_edit_subtitle()}</p>
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
  <div class="tabs tabs-bordered mb-6 border-b border-base-300">
    <button
      class="tab {activeTab === 'en' ? 'tab-active border-b-2 border-primary text-primary' : 'text-base-content/70'}"
      onclick={() => activeTab = 'en'}
    >
      <Globe class="h-4 w-4 mr-2" />
      {m.posts_form_tab_english()}
    </button>
    <button
      class="tab {activeTab === 'pt' ? 'tab-active border-b-2 border-primary text-primary' : 'text-base-content/70'}"
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
              <span class="label-text">{m.posts_form_post_id()}</span>
            </label>
            <input 
              type="text" 
              value={postId}
              class="input w-full"
              disabled
            />
          </div>
          
          <div>
            <label class="label">
              <span class="label-text">{m.posts_form_slug()}</span>
            </label>
            <input 
              type="text" 
              bind:value={postSlug}
              class="input w-full"
            />
          </div>
          
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
                <option value="archived">{m.posts_status_archived()}</option>
                <option value="trash">{m.posts_status_trash()}</option>
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

          <!-- Author Selection -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">{m.posts_form_author()}</span>
            </label>
            <select class="select select-bordered" bind:value={selectedAuthorId}>
              <option value="">{m.posts_form_select_author()}</option>
              {#each data.users as user}
                <option value={user.id}>
                  {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.username} (@{user.username})
                </option>
              {/each}
            </select>
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
            <RichTextEditor 
              value={activeTab === 'en' ? content.en.content : content.pt.content}
              placeholder={activeTab === 'en' ? m.posts_form_content_placeholder_en() : m.posts_form_content_placeholder_pt()}
              onUpdate={handleContentUpdate}
            />
            <div class="label">
              <span class="label-text-alt">{m.posts_form_markdown_support()}</span>
            </div>
          </div>
          
          <!-- Featured Image -->
          <div>
            <FeaturedImageUpload 
              value={featuredImageId}
              onUpload={handleFeaturedImageUpload}
              onRemove={handleFeaturedImageRemove}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
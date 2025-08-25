<script lang="ts">
  import { 
    ArrowLeft, 
    Calendar, 
    Eye, 
    Save, 
    X,
    Globe
  } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  
  // Import i18n with modern Paraglide pattern
  import * as m from '$lib/paraglide/messages';
  
  // Import rich text editor
  import RichTextEditor from '$lib/components/RichTextEditor.svelte';
  
  // Import featured image component
  import FeaturedImageUpload from '$lib/components/FeaturedImageUpload.svelte';
  
  // Svelte 5 runes for state management
  let activeTab = $state('en');
  let featuredImageId = $state(null);
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
  let pageSlug = $state('');
  let publicationDate = $state(new Date().toISOString().split('T')[0]);
  let status = $state('draft');
  
  const togglePreview = () => previewMode = !previewMode;
  
  const handleTitleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (activeTab === 'en') {
      content.en.title = target.value;
      // Auto-generate slug from English title
      if (!pageSlug && target.value) {
        pageSlug = generateSlug(target.value);
      }
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
    console.log('🖼️ Featured image uploaded, received mediaId:', mediaId);
    featuredImageId = mediaId;
    console.log('🖼️ Updated featuredImageId state to:', featuredImageId);
  };
  
  const handleFeaturedImageRemove = () => {
    console.log('🗑️ Featured image removed');
    featuredImageId = null;
    console.log('🗑️ Updated featuredImageId state to:', featuredImageId);
  };
  
  const handleSave = async () => {
    isLoading = true;
    
    try {
      console.log('💾 Starting page creation...');
      console.log('💾 Current featuredImageId state:', featuredImageId);
      
      // Prepare the page data
      const pageData = {
        title: content.en.title || content.pt.title, // Use first available title
        slug: pageSlug || generateSlug(content.en.title || content.pt.title),
        excerpt: content.en.excerpt || content.pt.excerpt,
        content: content.en.content || content.pt.content,
        status: status,
        featuredImageId: featuredImageId,
        publishedAt: status === 'published' ? new Date(publicationDate).toISOString() : null,
        // Store the multilingual content
        metaData: JSON.stringify({
          multilingual: content
        })
      };
      
      console.log('💾 Prepared page data:', pageData);
      console.log('💾 Featured image ID in request:', pageData.featuredImageId);
      
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pageData)
      });
      
      console.log('📡 API response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Page created successfully:', result);
        console.log('✅ Created page data:', result.page);
        // Success - redirect to pages list
        goto('/admin/pages');
      } else {
        const error = await response.text();
        console.error('❌ Failed to create page:', error);
        console.error('❌ Response status:', response.status);
        alert('Failed to create page. Please try again.');
      }
    } catch (err) {
      console.error('Error creating page:', err);
      alert('An error occurred while creating. Please try again.');
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
    goto('/admin/pages');
  };
</script>

<!-- Page Header -->
<div class="cms-page-header">
  <div>
    <h1 class="cms-page-title">{m.pages_new_page()}</h1>
    <p class="cms-page-subtitle">{m.pages_new_subtitle()}</p>
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
      onclick={handleSave}
      class="btn btn-primary gap-2"
      disabled={isLoading}
    >
      {#if isLoading}
        <span class="loading loading-spinner loading-sm"></span>
        {m.pages_form_creating()}
      {:else}
        <Save class="h-4 w-4" />
        {m.pages_form_create()}
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
    <!-- Page Metadata -->
    <div class="cms-card">
      <div class="cms-card-body">
        <h2 class="cms-card-title">{m.pages_form_settings()}</h2>
        <div class="space-y-4">
          <div>
            <label for="page-slug" class="label">
              <span class="label-text">{m.pages_form_slug()}</span>
            </label>
            <input 
              id="page-slug"
              type="text" 
              bind:value={pageSlug}
              class="input w-full"
              placeholder="about-us"
            />
          </div>
          
          <div>
            <label for="page-publication-date" class="label">
              <span class="label-text">{m.pages_form_publication_date()}</span>
            </label>
            <div class="relative">
              <input 
                id="page-publication-date"
                type="date" 
                bind:value={publicationDate}
                class="input w-full pr-8"
              />
              <Calendar class="absolute right-2 top-2.5 h-4 w-4 text-base-content/60" />
            </div>
          </div>
          
          <div>
            <label for="page-status" class="label">
              <span class="label-text">{m.pages_form_status()}</span>
            </label>
            <div class="relative">
              <select 
                id="page-status"
                bind:value={status}
                class="select w-full"
              >
                <option value="draft">{m.pages_form_status_draft()}</option>
                <option value="published">{m.pages_form_status_published()}</option>
                <option value="scheduled">{m.pages_form_status_scheduled()}</option>
              </select>
            </div>
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
    
    <!-- Page Content -->
    <div class="cms-card md:col-span-2">
      <div class="cms-card-body">
        <h2 class="cms-card-title">{m.pages_form_content_section()} - {activeTab === 'en' ? m.posts_form_tab_english() : m.posts_form_tab_portuguese()}</h2>
        
        <div class="space-y-4">
          <div>
            <label for="page-title" class="label">
              <span class="label-text">{m.pages_form_title()}</span>
            </label>
            <input 
              id="page-title"
              type="text" 
              class="input w-full"
              value={activeTab === 'en' ? content.en.title : content.pt.title}
              oninput={handleTitleInput}
              placeholder={activeTab === 'en' ? m.pages_form_title_placeholder_en() : m.pages_form_title_placeholder_pt()}
            />
          </div>
          
          <div>
            <label for="page-excerpt" class="label">
              <span class="label-text">{m.pages_form_excerpt()}</span>
            </label>
            <input 
              id="page-excerpt"
              type="text" 
              class="input w-full"
              value={activeTab === 'en' ? content.en.excerpt : content.pt.excerpt}
              oninput={handleExcerptInput}
              placeholder={activeTab === 'en' ? m.pages_form_excerpt_placeholder_en() : m.pages_form_excerpt_placeholder_pt()}
            />
          </div>
          
          <div>
            <label for="page-content" class="label">
              <span class="label-text">{m.pages_form_content()}</span>
            </label>
            <div id="page-content">
              <RichTextEditor 
                value={activeTab === 'en' ? content.en.content : content.pt.content}
                placeholder={activeTab === 'en' ? m.pages_form_content_placeholder_en() : m.pages_form_content_placeholder_pt()}
                onUpdate={handleContentUpdate}
              />
            </div>
            <div class="label">
              <span class="label-text-alt">{m.posts_form_markdown_support()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Image Card -->
    <div class="cms-card">
      <div class="cms-card-body">
        <h2 class="cms-card-title">{m.featured_image_title()}</h2>
        <FeaturedImageUpload 
          value={featuredImageId}
          onUpload={handleFeaturedImageUpload}
          onRemove={handleFeaturedImageRemove}
          showLabel={false}
        />
      </div>
    </div>
  </div>
{/if}
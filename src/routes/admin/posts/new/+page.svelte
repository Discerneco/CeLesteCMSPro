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
  
  // Auto-save state for new posts (simpler - no existing auto-save to compare)
  let hasChanges = $state(false);
  let isTyping = $state(false);
  
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
  
  // Calculate word count and reading time
  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };
  
  const getCharCount = (text: string) => {
    return text.length;
  };
  
  const getReadingTime = (wordCount: number) => {
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  };
  
  // Reactive calculations for current language content
  let currentContent = $derived(activeTab === 'en' ? content.en : content.pt);
  let wordCount = $derived(getWordCount(currentContent.content));
  let charCount = $derived(getCharCount(currentContent.content));
  let readingTime = $derived(getReadingTime(wordCount));
  
  // Handle language switch with proper dropdown closure
  const handleLanguageSwitch = (newLang: 'en' | 'pt') => {
    activeTab = newLang;
    // Close the dropdown by removing focus
    if (typeof document !== 'undefined') {
      (document.activeElement as HTMLElement)?.blur();
    }
  };
  
  const handleTitleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (activeTab === 'en') {
      content.en.title = target.value;
    } else {
      content.pt.title = target.value;
    }
    hasChanges = true;
    isTyping = true;
    
    // Simple feedback for typing (no auto-save on new posts until first manual save)
    setTimeout(() => {
      isTyping = false;
    }, 2000);
  };

  const handleExcerptInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (activeTab === 'en') {
      content.en.excerpt = target.value;
    } else {
      content.pt.excerpt = target.value;
    }
    hasChanges = true;
    isTyping = true;
    
    // Simple feedback for typing
    setTimeout(() => {
      isTyping = false;
    }, 2000);
  };

  const handleContentInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    if (activeTab === 'en') {
      content.en.content = target.value;
    } else {
      content.pt.content = target.value;
    }
    hasChanges = true;
    isTyping = true;
    
    // Simple feedback for typing
    setTimeout(() => {
      isTyping = false;
    }, 2000);
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
        // Store the multilingual content with active language tracking
        metaData: JSON.stringify({
          multilingual: content,
          activeLanguage: activeTab
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
        try {
          const errorData = await response.json();
          console.error('Failed to save post:', errorData);
          const errorMsg = errorData.details || errorData.error || 'Unknown error';
          alert(`${m.posts_form_save_error()}: ${errorMsg}`);
        } catch (parseError) {
          const errorText = await response.text();
          console.error('Failed to save post (raw):', errorText);
          alert(`${m.posts_form_save_error()}. Status: ${response.status}`);
        }
      }
    } catch (err) {
      console.error('Error saving post:', err);
      alert(m.posts_form_save_error_generic());
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
      onclick={togglePreview}
      class="btn btn-outline gap-2"
    >
      <Eye class="h-4 w-4" />
      {m.posts_form_preview()}
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

<!-- Info Ruler -->
<div class="bg-base-200 px-4 py-2 mb-4 rounded-lg flex items-center justify-between text-sm">
  <div class="flex items-center gap-4">
    <!-- Word count -->
    <div class="text-base-content/70">
      <span class="font-medium">Words:</span> {wordCount}
    </div>
    
    <!-- Character count -->
    <div class="text-base-content/70">
      <span class="font-medium">Characters:</span> {charCount}
    </div>
    
    <!-- Reading time -->
    <div class="text-base-content/70">
      <span class="font-medium">Reading time:</span> {readingTime} min
    </div>
  </div>
  
  <div class="flex items-center gap-4">
    <!-- Language dropdown -->
    <div class="dropdown dropdown-end">
      <button tabindex="0" class="btn btn-sm btn-ghost gap-2">
        <Globe class="h-4 w-4" />
        <span class="font-medium">Language:</span> {activeTab === 'en' ? 'EN' : 'PT'}
        <ChevronDown class="h-3 w-3" />
      </button>
      <ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
        <li><button onclick={() => handleLanguageSwitch('en')}>English (EN)</button></li>
        <li><button onclick={() => handleLanguageSwitch('pt')}>Português (PT)</button></li>
      </ul>
    </div>
    
    <!-- Status with typing indicator -->
    <div class="text-base-content/70">
      <span class="font-medium">Status:</span> {status}
      {#if isTyping}
        <span class="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
          Typing...
        </span>
      {:else if hasChanges}
        <span class="ml-2 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-600">
          Unsaved changes
        </span>
      {/if}
    </div>
  </div>
</div>

<!-- Content/SEO/Advanced Tabs (to be implemented in later phases) -->

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
            <label for="publication-date" class="label">
              <span class="label-text">{m.posts_form_publication_date()}</span>
            </label>
            <div class="relative">
              <input
                id="publication-date"
                type="date"
                bind:value={publicationDate}
                class="input w-full pr-8"
              />
              <Calendar class="absolute right-2 top-2.5 h-4 w-4 text-base-content/60" />
            </div>
          </div>
          
          <div>
            <label for="post-status" class="label">
              <span class="label-text">{m.posts_form_status()}</span>
            </label>
            <div class="relative">
              <select
                id="post-status"
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
            <label for="post-title" class="label">
              <span class="label-text">{m.posts_form_title()}</span>
            </label>
            <input
              id="post-title"
              type="text"
              class="input w-full"
              value={activeTab === 'en' ? content.en.title : content.pt.title}
              oninput={handleTitleInput}
              placeholder={activeTab === 'en' ? m.posts_form_title_placeholder_en() : m.posts_form_title_placeholder_pt()}
            />
          </div>
          
          <div>
            <label for="post-excerpt" class="label">
              <span class="label-text">{m.posts_form_excerpt()}</span>
            </label>
            <input
              id="post-excerpt"
              type="text"
              class="input w-full"
              value={activeTab === 'en' ? content.en.excerpt : content.pt.excerpt}
              oninput={handleExcerptInput}
              placeholder={activeTab === 'en' ? m.posts_form_excerpt_placeholder_en() : m.posts_form_excerpt_placeholder_pt()}
            />
          </div>
          
          <div>
            <label for="post-content" class="label">
              <span class="label-text">{m.posts_form_content()}</span>
            </label>
            <textarea
              id="post-content"
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
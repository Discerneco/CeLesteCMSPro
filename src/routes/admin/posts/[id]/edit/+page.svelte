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
    Globe,
    Info
  } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';
  
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
  
  // Auto-save state
  let hasChanges = $state(false);
  let lastAutoSave = $state<Date | null>(null);
  let autoSaveStatus = $state('');
  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
  let lastContentHash = $state('');
  let isTyping = $state(false);
  
  // Auto-save comparison modal state
  let showComparisonModal = $state(false);
  let pendingAutosave: any = $state(null);
  let showAutoSaveInfo = $state(false);

  // Initialization guard to prevent false triggers during page load (Ghost-inspired)
  let isInitialized = $state(false);
  
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
  
  // Handle language switch with proper dropdown closure and context update
  const handleLanguageSwitch = (newLang: 'en' | 'pt') => {
    activeTab = newLang;
    // Force recalculation of content hash for new language
    lastContentHash = generateContentHash();
    // Close the dropdown by removing focus
    if (typeof document !== 'undefined') {
      (document.activeElement as HTMLElement)?.blur();
    }
  };
  
  const handleTitleInput = (event: Event) => {
    // Ghost-inspired: Skip during initialization to prevent false triggers
    if (!isInitialized) return;

    const target = event.target as HTMLInputElement;
    if (activeTab === 'en') {
      content.en.title = target.value;
    } else {
      content.pt.title = target.value;
    }

    // Ghost approach: Only mark changed after verifying actual content changes
    if (hasContentChanged()) {
      hasChanges = true;
    }

    isTyping = true;
    scheduleAutoSave();
  };

  const handleExcerptInput = (event: Event) => {
    // Ghost-inspired: Skip during initialization to prevent false triggers
    if (!isInitialized) return;

    const target = event.target as HTMLInputElement;
    if (activeTab === 'en') {
      content.en.excerpt = target.value;
    } else {
      content.pt.excerpt = target.value;
    }

    // Ghost approach: Only mark changed after verifying actual content changes
    if (hasContentChanged()) {
      hasChanges = true;
    }

    isTyping = true;
    scheduleAutoSave();
  };

  const handleContentUpdate = (newContent: string) => {
    // Ghost-inspired: Skip during initialization to prevent false triggers
    if (!isInitialized) return;

    if (activeTab === 'en') {
      content.en.content = newContent;
    } else {
      content.pt.content = newContent;
    }

    // Ghost approach: Only mark changed after verifying actual content changes
    if (hasContentChanged()) {
      hasChanges = true;
    }

    isTyping = true;
    scheduleAutoSave();
  };
  
  // Generate content hash for change detection (content fields only)
  const generateContentHash = () => {
    const contentString = JSON.stringify({
      title: { en: content.en.title, pt: content.pt.title },
      excerpt: { en: content.en.excerpt, pt: content.pt.excerpt },
      content: { en: content.en.content, pt: content.pt.content },
      activeTab: activeTab // Track which language is being edited
      // Note: Settings fields (status, featured, etc.) excluded from auto-save
    });
    // Simple hash function - in production you might want crypto.subtle.digest
    let hash = 0;
    for (let i = 0; i < contentString.length; i++) {
      const char = contentString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  };
  
  // Check if content has actually changed
  const hasContentChanged = () => {
    const currentHash = generateContentHash();
    return currentHash !== lastContentHash;
  };
  
  // Debounced auto-save function (Ghost-inspired)
  const scheduleAutoSave = () => {
    // Clear existing timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    // Auto-save works for all posts (published, draft, scheduled)
    
    // Set 3-second debounce timer
    autoSaveTimer = setTimeout(() => {
      performAutoSave();
    }, 3000);
  };
  
  // Perform the actual auto-save
  const performAutoSave = async () => {
    // Skip if no real content changes
    if (!hasContentChanged()) {
      isTyping = false;
      return;
    }
    
    try {
      autoSaveStatus = 'saving';
      isTyping = false;
      
      // Track which languages have content
      const changedLanguages = [];
      if (content.en.title || content.en.excerpt || content.en.content) {
        changedLanguages.push('en');
      }
      if (content.pt.title || content.pt.excerpt || content.pt.content) {
        changedLanguages.push('pt');
      }

      // Auto-save payload: content fields only (settings require manual save)
      const postData = {
        title: content.en.title || content.pt.title,
        excerpt: content.en.excerpt || content.pt.excerpt,
        content: content.en.content || content.pt.content,
        metaData: {
          multilingual: content, // All languages saved together
          changedLanguages: changedLanguages, // Track which languages have content
          activeLanguage: activeTab, // Which language was being edited
          autoSaveTimestamp: new Date().toISOString()
        }
        // Note: status, featured, slug, featuredImageId excluded - require manual save
      };
      
      const response = await fetch(`/api/posts/${postId}/autosave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });
      
      if (response.ok) {
        lastAutoSave = new Date();
        lastContentHash = generateContentHash();
        hasChanges = false;
        autoSaveStatus = 'saved';
      } else {
        autoSaveStatus = 'error';
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      autoSaveStatus = 'error';
    }
  };
  
  // Format time ago
  const getTimeAgo = (date: Date | null) => {
    if (!date) return '';
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  };

  // Format time as HH:MM
  const formatTime = (date: Date | null) => {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Get formatted status for display
  const getFormattedStatus = () => {
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    return statusText;
  };

  // Get auto-save status message (for the old style display)
  const getAutoSaveStatus = () => {
    if (isTyping) return 'Typing...';
    if (autoSaveStatus === 'saving') return 'Saving...';
    if (autoSaveStatus === 'error') return 'Save failed';
    if (lastAutoSave) return `Auto-saved ${getTimeAgo(lastAutoSave)}`;
    if (hasChanges) return 'Unsaved changes';
    return '';
  };
  
  // Restore auto-save content
  const restoreAutosave = () => {
    if (!pendingAutosave) return;
    
    const autosave = pendingAutosave;
    
    // Restore content
    if (autosave.metaData?.multilingual) {
      content = { ...autosave.metaData.multilingual };
    } else {
      content.en.title = autosave.title || '';
      content.en.excerpt = autosave.excerpt || '';
      content.en.content = autosave.content || '';
    }
    
    // Content-only restoration: settings fields preserved
    // Manual save required for status, featured, slug changes
    
    // Switch to the language that was being edited
    activeTab = autosave.activeLanguage || 'en';
    
    // Update state
    lastAutoSave = autosave.autosaveTime;
    hasChanges = true; // Mark as having changes since we restored
    
    // Close modal
    showComparisonModal = false;
    pendingAutosave = null;
  };
  
  // Keep current content (dismiss auto-save)
  const dismissAutosave = async () => {
    if (!pendingAutosave) return;
    
    // Delete the auto-save from server since user chose to keep current
    try {
      await fetch(`/api/posts/${postId}/autosave`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting auto-save:', error);
    }
    
    // Close modal
    showComparisonModal = false;
    pendingAutosave = null;
  };
  
  // Check if auto-save has meaningful differences in ANY language
  const hasMeaningfulDifferences = (autosave: any) => {
    if (!autosave.metaData?.multilingual) return false;
    
    // Check BOTH languages for differences, not just the active one
    const languages = ['en', 'pt'] as const;
    
    for (const lang of languages) {
      const currentContent = content[lang];
      const autosaveContent = autosave.metaData.multilingual[lang];
      
      if (autosaveContent) {
        const normalizeText = (text: string) => text.trim().replace(/\s+/g, ' ');
        
        const titleDiff = normalizeText(currentContent.title || '') !== normalizeText(autosaveContent.title || '');
        const excerptDiff = normalizeText(currentContent.excerpt || '') !== normalizeText(autosaveContent.excerpt || '');
        const contentDiff = normalizeText(currentContent.content || '') !== normalizeText(autosaveContent.content || '');
        
        // Check for meaningful content differences (5+ chars)
        if (contentDiff) {
          const charDiff = Math.abs((currentContent.content || '').length - (autosaveContent.content || '').length);
          if (charDiff >= 5) return true;
        }
        
        // Title and excerpt changes are always meaningful
        if (titleDiff || excerptDiff) return true;
      }
    }
    
    return false;
  };
  
  // Get differences between current and auto-saved content
  const getContentDiff = (current: string, autosaved: string) => {
    const normalizeText = (text: string) => text.trim().replace(/\s+/g, ' ');
    
    if (normalizeText(current) === normalizeText(autosaved)) return 'No changes';
    
    const currentWords = current.trim() ? current.trim().split(/\s+/).length : 0;
    const autosavedWords = autosaved.trim() ? autosaved.trim().split(/\s+/).length : 0;
    const wordDiff = autosavedWords - currentWords;
    
    if (wordDiff > 0) {
      return `+${wordDiff} words added`;
    } else if (wordDiff < 0) {
      return `${Math.abs(wordDiff)} words removed`;
    } else {
      return 'Content modified';
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
      console.log('💾 Starting save process...');
      console.log('💾 Current featuredImageId state:', featuredImageId);
      
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
      
      console.log('💾 Prepared post data:', postData);
      console.log('💾 Featured image ID in request:', postData.featuredImageId);
      
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });
      
      console.log('📡 API response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Post updated successfully:', result);
        console.log('✅ Updated post data:', result.post);
        
        // Clear auto-save after successful manual save
        await fetch(`/api/posts/${postId}/autosave`, {
          method: 'DELETE'
        });
        
        hasChanges = false;
        lastAutoSave = null;
        lastContentHash = generateContentHash();
        
        // Success - redirect to posts list
        goto('/admin/posts');
      } else {
        const error = await response.text();
        console.error('❌ Failed to update post:', error);
        console.error('❌ Response status:', response.status);
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
  
  // Lifecycle hooks for auto-save
  onMount(async () => {
    // Check for existing auto-save on load
    try {
      const response = await fetch(`/api/posts/${postId}/autosave`);
      if (response.ok) {
        const autosaveData = await response.json();
        if (autosaveData.exists && autosaveData.autosave) {
          const autosave = autosaveData.autosave;
          const autosaveTime = new Date(autosave.updatedAt);
          const postTime = data.post.updatedAt ? new Date(data.post.updatedAt) : new Date();

          // If auto-save is newer than saved version, we have unsaved changes
          if (autosaveTime > postTime) {
            // Always restore newer auto-save content (ANY change matters to user)
            hasChanges = true;
            lastAutoSave = autosaveTime;
            console.log('✅ Auto-save detected, restoring content');

            // Always restore auto-save content immediately
            if (autosave.metaData?.multilingual) {
              content = { ...autosave.metaData.multilingual };
              console.log('✅ Auto-save content restored from multilingual data');
            } else {
              // Fallback for older auto-saves without multilingual structure
              content.en.title = autosave.title || '';
              content.en.excerpt = autosave.excerpt || '';
              content.en.content = autosave.content || '';
              console.log('✅ Auto-save content restored from legacy format');
            }

            // Content-only auto-save: settings fields (status, featured, etc.) not restored
            // These require manual save for intentional publishing workflow
            console.log('✅ Content fields restored, settings preserved from main post');

            // Switch to the language that was being edited
            if (autosave.metaData?.activeLanguage) {
              activeTab = autosave.metaData.activeLanguage;
              console.log('✅ Switched to active language:', activeTab);
            }

            // Store pendingData for info modal (user-initiated)
            pendingAutosave = {
              ...autosave,
              autosaveTime,
              postTime,
              activeLanguage: autosave.metaData?.activeLanguage || 'en',
              timestamp: autosave.metaData?.autoSaveTimestamp || autosave.updatedAt
            };

            // NO auto-opening modal - only opens when user clicks info icon
            console.log('✅ Auto-save restored, modal available via info icon');
          } else {
            // Auto-save exists but is older than saved version
            console.log('⚠️ Auto-save is older than saved version, ignoring');
          }
        } else {
          // No auto-save exists - ensure hasChanges is false
          hasChanges = false;
          lastAutoSave = null;
          console.log('✅ No auto-save found, hasChanges = false');
        }
      } else {
        // API call failed or no auto-save - ensure hasChanges is false
        hasChanges = false;
        lastAutoSave = null;
        console.log('✅ No auto-save API response, hasChanges = false');
      }
    } catch (error) {
      console.error('Error checking for auto-save:', error);
      // On error, be conservative and set hasChanges = false
      hasChanges = false;
      lastAutoSave = null;
    }

    // Initialize content hash
    lastContentHash = generateContentHash();

    // Ghost approach: Enable change tracking after initialization
    isInitialized = true;
    console.log('✅ Initialization complete, change tracking enabled');
  });
  
  onDestroy(() => {
    // Clean up timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    // Perform final auto-save if there are unsaved changes
    if (hasChanges && hasContentChanged() && status !== 'published') {
      performAutoSave();
    }
  });
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
    
    <!-- Status with auto-save info -->
    <div class="text-base-content/70 flex items-center gap-2">
      <span>
        <span class="font-medium">Status:</span> {getFormattedStatus()}
        {#if lastAutoSave || hasChanges}
          <span class="mx-1">•</span>
          {#if lastAutoSave}
            Last update at {formatTime(lastAutoSave)}
          {:else if hasChanges}
            Editing
          {/if}
          {#if hasChanges}
            <span class="ml-1 text-warning">[Unsaved]</span>
          {/if}
        {/if}
      </span>
      {#if hasChanges || lastAutoSave}
        <div
          onclick={() => showAutoSaveInfo = true}
          class="w-4 h-4 bg-black dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors ml-2"
          title="Auto-save information"
        >
          <span class="text-white text-xs font-semibold">i</span>
        </div>
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
            <label for="post-id" class="label">
              <span class="label-text">{m.posts_form_post_id()}</span>
            </label>
            <input 
              id="post-id"
              type="text" 
              value={postId}
              class="input w-full"
              disabled
            />
          </div>
          
          <div>
            <label for="post-slug" class="label">
              <span class="label-text">{m.posts_form_slug()}</span>
            </label>
            <input 
              id="post-slug"
              type="text" 
              bind:value={postSlug}
              class="input w-full"
            />
          </div>
          
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
            <label for="post-author" class="label">
              <span class="label-text">{m.posts_form_author()}</span>
            </label>
            <select id="post-author" class="select select-bordered" bind:value={selectedAuthorId}>
              <option value="">{m.posts_form_select_author()}</option>
              {#each data.users as user}
                <option value={user.id}>
                  {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.username} (@{user.username})
                </option>
              {/each}
            </select>
          </div>
          
          <div class="divider"></div>
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
            <div id="post-content">
              <RichTextEditor 
                value={activeTab === 'en' ? content.en.content : content.pt.content}
                placeholder={activeTab === 'en' ? m.posts_form_content_placeholder_en() : m.posts_form_content_placeholder_pt()}
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

<!-- Auto-save Comparison Modal -->
{#if showComparisonModal && pendingAutosave}
  <div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-5xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="font-bold text-lg">Auto-saved Version Found</h3>
          <p class="text-sm text-base-content/70">
            Edited in {pendingAutosave.activeLanguage?.toUpperCase()} • {getTimeAgo(pendingAutosave.autosaveTime)}
          </p>
        </div>
        <button class="btn btn-sm btn-circle btn-ghost" onclick={() => showComparisonModal = false}>
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Language Indicator -->
      <div class="alert alert-info mb-4">
        <Globe class="h-4 w-4" />
        <span>This auto-save was made while editing <strong>{pendingAutosave.activeLanguage === 'en' ? 'English' : 'Portuguese'}</strong> content</span>
      </div>

      <!-- Content Comparison -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <!-- Current Version -->
        <div class="border rounded-lg p-4 bg-base-200">
          <h4 class="font-semibold text-sm mb-3 flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-success"></div>
            Current Saved Version
          </h4>
          
          <div class="space-y-3 text-sm">
            <div>
              <span class="font-medium">Title:</span>
              <p class="text-base-content/80 mt-1">
                {pendingAutosave.activeLanguage === 'en' ? content.en.title : content.pt.title || 'No title'}
              </p>
            </div>
            
            <div>
              <span class="font-medium">Excerpt:</span>
              <p class="text-base-content/80 mt-1">
                {pendingAutosave.activeLanguage === 'en' ? content.en.excerpt : content.pt.excerpt || 'No excerpt'}
              </p>
            </div>
            
            <div>
              <span class="font-medium">Content:</span>
              <div class="mt-1 p-2 bg-base-100 rounded border max-h-40 overflow-y-auto text-xs">
                {pendingAutosave.activeLanguage === 'en' ? content.en.content : content.pt.content || 'No content'}
              </div>
            </div>
          </div>
        </div>

        <!-- Auto-saved Version -->
        <div class="border rounded-lg p-4 bg-warning/10">
          <h4 class="font-semibold text-sm mb-3 flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-warning"></div>
            Auto-saved Version
          </h4>
          
          <div class="space-y-3 text-sm">
            <div>
              <span class="font-medium">Title:</span>
              <p class="text-base-content/80 mt-1">
                {#if pendingAutosave.metaData?.multilingual}
                  {pendingAutosave.activeLanguage === 'en' 
                    ? pendingAutosave.metaData.multilingual.en?.title 
                    : pendingAutosave.metaData.multilingual.pt?.title || 'No title'}
                {:else}
                  {pendingAutosave.title || 'No title'}
                {/if}
              </p>
            </div>
            
            <div>
              <span class="font-medium">Excerpt:</span>
              <p class="text-base-content/80 mt-1">
                {#if pendingAutosave.metaData?.multilingual}
                  {pendingAutosave.activeLanguage === 'en' 
                    ? pendingAutosave.metaData.multilingual.en?.excerpt 
                    : pendingAutosave.metaData.multilingual.pt?.excerpt || 'No excerpt'}
                {:else}
                  {pendingAutosave.excerpt || 'No excerpt'}
                {/if}
              </p>
            </div>
            
            <div>
              <span class="font-medium">Content:</span>
              <div class="mt-1 p-2 bg-base-100 rounded border max-h-40 overflow-y-auto text-xs">
                {#if pendingAutosave.metaData?.multilingual}
                  {pendingAutosave.activeLanguage === 'en' 
                    ? pendingAutosave.metaData.multilingual.en?.content 
                    : pendingAutosave.metaData.multilingual.pt?.content || 'No content'}
                {:else}
                  {pendingAutosave.content || 'No content'}
                {/if}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Differences Summary -->
      <div class="alert alert-warning mb-4">
        <span class="font-medium">Changes detected:</span>
        {#if pendingAutosave.metaData?.multilingual}
          {@const currentContent = pendingAutosave.activeLanguage === 'en' ? content.en.content : content.pt.content}
          {@const autosaveContent = pendingAutosave.activeLanguage === 'en' 
            ? pendingAutosave.metaData.multilingual.en?.content 
            : pendingAutosave.metaData.multilingual.pt?.content}
          {getContentDiff(currentContent || '', autosaveContent || '')}
        {:else}
          {getContentDiff(content.en.content || '', pendingAutosave.content || '')}
        {/if}
      </div>

      <!-- Actions -->
      <div class="modal-action">
        <button class="btn btn-ghost" onclick={dismissAutosave}>
          Keep Current Version
        </button>
        <button class="btn btn-warning" onclick={restoreAutosave}>
          Restore Auto-save
        </button>
      </div>
    </div>
  </div>
{/if}
<!-- Auto-save Info Modal -->
{#if showAutoSaveInfo}
  <div class="modal modal-open">
    <div class="modal-box">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-lg flex items-center gap-2">
          <Info class="h-5 w-5" />
          Content Status Information
        </h3>
        <button class="btn btn-sm btn-circle btn-ghost" onclick={() => showAutoSaveInfo = false}>
          <X class="h-4 w-4" />
        </button>
      </div>

      <div class="divider my-2"></div>

      <!-- Language Status -->
      <div class="space-y-3">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <Globe class="h-4 w-4 text-primary" />
            <span class="font-medium">Language Changes:</span>
          </div>

          <div class="space-y-2 ml-6">
            {#if content.en.title || content.en.excerpt || content.en.content}
              <div class="flex items-center justify-between">
                <span>English:</span>
                {#if lastAutoSave}
                  <span class="text-sm text-base-content/70">
                    Last update at {formatTime(lastAutoSave)}
                    {hasChanges ? "[Unsaved]" : "[Saved]"}
                  </span>
                {:else}
                  <span class="text-sm text-warning">Not saved</span>
                {/if}
              </div>
            {/if}

            {#if content.pt.title || content.pt.excerpt || content.pt.content}
              <div class="flex items-center justify-between">
                <span>Portuguese:</span>
                {#if lastAutoSave}
                  <span class="text-sm text-base-content/70">
                    Last update at {formatTime(lastAutoSave)}
                    {hasChanges ? "[Unsaved]" : "[Saved]"}
                  </span>
                {:else}
                  <span class="text-sm text-warning">Not saved</span>
                {/if}
              </div>
            {/if}

            {#if !content.en.title && !content.en.excerpt && !content.en.content && !content.pt.title && !content.pt.excerpt && !content.pt.content}
              <div class="text-sm text-base-content/50">No content in any language</div>
            {/if}
          </div>
        </div>

        <!-- Auto-save Status -->
        {#if hasChanges}
          <div class="alert alert-warning">
            <Info class="h-4 w-4" />
            <span>You have unsaved changes. Auto-save will trigger 3 seconds after you stop typing.</span>
          </div>
        {:else if lastAutoSave}
          <div class="alert alert-success">
            <Info class="h-4 w-4" />
            <span>All changes are auto-saved.</span>
          </div>
        {/if}
      </div>

      <!-- Actions -->
      <div class="modal-action">
        {#if hasChanges}
          <button
            class="btn btn-sm btn-ghost"
            onclick={async () => {
              // Discard auto-save
              try {
                await fetch(`/api/posts/${postId}/autosave`, { method: "DELETE" });
                hasChanges = false;
                lastAutoSave = null;
                showAutoSaveInfo = false;
              } catch (error) {
                console.error("Error discarding auto-save:", error);
              }
            }}
          >
            Discard Auto-save
          </button>
        {/if}
        <button class="btn btn-sm" onclick={() => showAutoSaveInfo = false}>
          Close
        </button>
      </div>
    </div>
  </div>
{/if}

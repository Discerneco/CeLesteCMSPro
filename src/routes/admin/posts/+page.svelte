<script>
  import { 
    Edit,
    Eye,
    Trash2,
    Plus,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Star
  } from '@lucide/svelte';
  import { goto, replaceState } from '$app/navigation';
  import { page } from '$app/stores';
  
  // Import i18n with modern Paraglide pattern
  import * as m from '$lib/paraglide/messages';
  
  // Get data from load function (Svelte 5 runes mode)
  let { data } = $props();
  
  // State for active tab - initialize from URL
  let activeTab = $state($page.url.searchParams.get('tab') || 'all'); // 'all' or 'trash'
  let trashedPosts = $state([]);
  let loadingTrash = $state(false);
  
  // State for delete confirmation modal
  let showDeleteModal = $state(false);
  let postToDelete = $state(null);
  let deleteIsPermanent = $state(false);
  
  // Function to switch tabs and update URL
  function switchTab(tab) {
    activeTab = tab;
    const url = new URL($page.url);
    if (tab === 'trash') {
      url.searchParams.set('tab', 'trash');
    } else {
      url.searchParams.delete('tab');
    }
    // Use SvelteKit's replaceState instead of window.history.replaceState
    replaceState(url.toString(), {});
  }
  
  // Load trashed posts when switching to trash tab
  async function loadTrashedPosts() {
    loadingTrash = true;
    try {
      const response = await fetch('/api/posts/trash');
      if (response.ok) {
        trashedPosts = await response.json();
      }
    } catch (err) {
      console.error('Error loading trashed posts:', err);
    } finally {
      loadingTrash = false;
    }
  }
  
  // Restore a post from trash
  async function handleRestore(postId) {
    try {
      const response = await fetch(`/api/posts/${postId}/restore`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        // Reload both lists to ensure data is fresh
        await loadTrashedPosts();
        // Also reload the main page to get updated posts
        window.location.reload();
      } else {
        console.error('Failed to restore post');
      }
    } catch (err) {
      console.error('Error restoring post:', err);
    }
  }
  
  // Load trash posts on mount to get the count
  $effect(() => {
    // Always load trash posts on mount to show correct count
    loadTrashedPosts();
  });
  
  // Simple functions for handling actions
  function handleEdit(postId) {
    // Preserve tab state in return URL
    const returnUrl = activeTab === 'trash' ? '?tab=trash' : '';
    goto(`/admin/posts/${postId}/edit?return=/admin/posts${returnUrl}`);
  }
  
  function handleView(postId) {
    // For trashed posts, just show them in a simple view mode
    // We'll pass the tab state in the URL
    const tabParam = activeTab === 'trash' ? '?tab=trash' : '';
    goto(`/admin/posts/${postId}/view${tabParam}`);
  }
  
  function handleDelete(postId) {
    postToDelete = postId;
    deleteIsPermanent = activeTab === 'trash';
    showDeleteModal = true;
  }
  
  async function confirmDelete() {
    if (!postToDelete) return;
    
    try {
      const endpoint = deleteIsPermanent
        ? `/api/posts/${postToDelete}?permanent=true`
        : `/api/posts/${postToDelete}`;
      
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Success - reload both lists to update counts
        if (activeTab === 'trash') {
          // If deleting from trash, just reload trash
          await loadTrashedPosts();
        } else {
          // If moving to trash, reload both lists
          await loadTrashedPosts();
          window.location.reload();
        }
      } else {
        console.error('Failed to delete post:', result);
        alert(`Failed to delete post: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('An error occurred while deleting. Please try again.');
    } finally {
      showDeleteModal = false;
      postToDelete = null;
    }
  }
  
  function cancelDelete() {
    showDeleteModal = false;
    postToDelete = null;
  }
  
  function handleNewPost() {
    goto('/admin/posts/new');
  }
  
  function getStatusClass(status) {
    switch (status) {
      case 'published':
        return 'cms-status-published';
      case 'draft':
        return 'cms-status-draft';
      case 'archived':
        return 'cms-status-archived';
      case 'scheduled':
        return 'cms-status-scheduled';
      default:
        return 'cms-status-draft';
    }
  }
  
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
    <h1 class="cms-page-title">{m.posts_title()}</h1>
    <p class="cms-page-subtitle">
      {#if activeTab === 'all'}
        {m.posts_subtitle()}
      {:else}
        {trashedPosts.length === 1 ? 
          m.posts_showing_trashed_singular({ count: trashedPosts.length }) : 
          m.posts_showing_trashed_plural({ count: trashedPosts.length })
        }
      {/if}
    </p>
  </div>
  <button 
    onclick={handleNewPost}
    class="btn btn-primary gap-2"
  >
    <Plus class="h-4 w-4" />
    {m.posts_new_post()}
  </button>
</div>

<!-- Tabs -->
<div class="flex gap-1 mb-4 border-b border-base-300">
  <button 
    class="px-4 py-2 font-medium transition-colors {activeTab === 'all' ? 'border-b-2 border-primary text-primary' : 'text-base-content/70 hover:text-base-content'}"
    onclick={() => switchTab('all')}
  >
    {m.posts_all_posts_tab()} ({data.posts?.length || 0})
  </button>
  <button 
    class="px-4 py-2 font-medium transition-colors {activeTab === 'trash' ? 'border-b-2 border-primary text-primary' : 'text-base-content/70 hover:text-base-content'}"
    onclick={() => switchTab('trash')}
  >
    {m.posts_trash_tab()} ({trashedPosts.length})
  </button>
</div>

<!-- Posts Table -->
<div class="cms-table-container">
  <!-- Search and Filter Bar -->
  <div class="px-6 py-4 border-b border-base-200">
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <!-- Search -->
      <div class="cms-search-container">
        <Search class="cms-search-icon" />
        <input
          type="text"
          placeholder={m.posts_search_placeholder()}
          class="cms-search-input"
        />
      </div>
      
      <!-- Filter -->
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="cms-btn-utility">
          <Filter class="h-4 w-4" />
          {m.posts_filter()}
        </div>
      </div>
    </div>
  </div>
  <!-- Table Header -->
  <div class="cms-table-header">
    <div class="hidden md:grid items-center gap-2 cms-table-header-text" style="grid-template-columns: minmax(200px, 2fr) minmax(80px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(80px, 1fr);">
      <div>{m.posts_table_title()}</div>
      <div class="text-center">{m.posts_table_status()}</div>
      <div class="text-center">{m.posts_table_date()}</div>
      <div class="text-center">{m.posts_table_author()}</div>
      <div class="flex justify-end">
        <div class="flex items-center gap-1">
          <div class="w-8 h-4"></div> <!-- Spacer for first icon -->
          <div class="w-8 h-4 flex justify-center text-xs font-medium">{m.posts_table_actions()}</div> <!-- Text above middle icon -->
          <div class="w-8 h-4"></div> <!-- Spacer for third icon -->
        </div>
      </div>
    </div>
  </div>
  
  <!-- Table Body - Desktop -->
  <div class="hidden md:block divide-y divide-base-content/10">
    {#if data.posts && data.posts.length > 0}
      {#each (activeTab === 'all' ? data.posts : trashedPosts) as post}
        <div class="cms-table-row">
          <div class="grid items-center gap-2" style="grid-template-columns: minmax(200px, 2fr) minmax(80px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(80px, 1fr);">
            <!-- Title -->
            <div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  {#if post.featured}
                    <Star class="h-4 w-4 text-warning fill-warning" />
                  {/if}
                  <h3 class="font-semibold text-base-content hover:text-primary cursor-pointer transition-colors duration-150 text-base leading-6">
                    {post.title}
                  </h3>
                </div>
                <p class="text-sm text-base-content/60 mt-2 line-clamp-2 leading-5">
                  {post.excerpt || m.posts_form_no_excerpt()}
                </p>
              </div>
            </div>
            
            <!-- Status -->
            <div class="text-center">
              <span class="cms-status-badge {getStatusClass(post.status)}">
                {getStatusText(post.status)}
              </span>
            </div>
            
            <!-- Date -->
            <div class="text-center">
              <span class="text-sm font-medium text-base-content/80">
                {post.publishedAtFormatted || post.createdAtFormatted}
              </span>
            </div>
            
            <!-- Author -->
            <div class="text-center">
              <span class="text-sm font-medium text-base-content/80 capitalize">{post.author}</span>
            </div>
            
            <!-- Actions -->
            <div>
              <div class="flex items-center gap-1 justify-end">
                {#if activeTab === 'trash'}
                  <!-- View and Restore buttons for trashed posts -->
                  <button 
                    onclick={() => handleView(post.id)}
                    class="cms-btn-icon"
                    title={m.posts_action_view()}
                  >
                    <Eye class="h-4 w-4" />
                  </button>
                  <button 
                    onclick={() => handleRestore(post.id)}
                    class="cms-btn-icon text-success"
                    title={m.posts_action_restore()}
                    aria-label={m.posts_action_restore()}
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                  </button>
                {:else}
                  <!-- Edit and View buttons for normal posts -->
                  <button 
                    onclick={() => handleEdit(post.id)}
                    class="cms-btn-icon"
                    title={m.posts_action_edit()}
                  >
                    <Edit class="h-4 w-4" />
                  </button>
                  <button 
                    onclick={() => handleView(post.id)}
                    class="cms-btn-icon"
                    title={m.posts_action_view()}
                  >
                    <Eye class="h-4 w-4" />
                  </button>
                {/if}
                <button 
                  onclick={() => handleDelete(post.id)}
                  class="cms-btn-icon-danger"
                  title={activeTab === 'trash' ? 'Delete Permanently' : m.posts_action_delete()}
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    {:else}
      <div class="px-6 py-12 text-center">
        <div class="max-w-sm mx-auto">
          <div class="w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
            <Plus class="h-8 w-8 text-base-content/40" />
          </div>
          <h3 class="text-lg font-semibold text-base-content mb-2">No posts found</h3>
          <p class="text-base-content/60 mb-6">{m.posts_no_posts()}</p>
          <button 
            onclick={handleNewPost}
            class="btn btn-primary gap-2"
          >
            <Plus class="h-4 w-4" />
            {m.posts_new_post()}
          </button>
        </div>
      </div>
    {/if}
  </div>

  <!-- Mobile Card Layout -->
  <div class="md:hidden space-y-4">
    {#if data.posts && data.posts.length > 0}
      {#each (activeTab === 'all' ? data.posts : trashedPosts) as post}
        <div class="bg-base-100 rounded-lg border border-base-200 p-4">
          <!-- Card Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2 flex-1 min-w-0">
              {#if post.featured}
                <Star class="h-4 w-4 text-warning fill-warning flex-shrink-0" />
              {/if}
              <h3 class="font-semibold text-base-content text-base leading-6 truncate">
                {post.title}
              </h3>
            </div>
            <span class="cms-status-badge {getStatusClass(post.status)} ml-2 flex-shrink-0">
              {getStatusText(post.status)}
            </span>
          </div>
          
          <!-- Card Content -->
          <p class="text-sm text-base-content/60 mb-3 line-clamp-2 leading-5">
            {post.excerpt || m.posts_form_no_excerpt()}
          </p>
          
          <!-- Card Meta -->
          <div class="flex items-center justify-between text-sm text-base-content/60 mb-3">
            <span>{post.publishedAtFormatted || post.createdAtFormatted}</span>
            <span class="capitalize">{post.author}</span>
          </div>
          
          <!-- Card Actions -->
          <div class="flex items-center justify-end gap-1 pt-2 border-t border-base-200">
            {#if activeTab === 'trash'}
              <button 
                onclick={() => handleView(post.id)}
                class="cms-btn-icon"
                title={m.posts_action_view()}
              >
                <Eye class="h-4 w-4" />
                <span class="sr-only">{m.posts_action_view()}</span>
              </button>
              <button 
                onclick={() => handleRestore(post.id)}
                class="cms-btn-icon text-success"
                title={m.posts_action_restore()}
                aria-label={m.posts_action_restore()}
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span class="sr-only">{m.posts_action_restore()}</span>
              </button>
            {:else}
              <button 
                onclick={() => handleEdit(post.id)}
                class="cms-btn-icon"
                title={m.posts_action_edit()}
              >
                <Edit class="h-4 w-4" />
                <span class="sr-only">{m.posts_action_edit()}</span>
              </button>
              <button 
                onclick={() => handleView(post.id)}
                class="cms-btn-icon"
                title={m.posts_action_view()}
              >
                <Eye class="h-4 w-4" />
                <span class="sr-only">{m.posts_action_view()}</span>
              </button>
            {/if}
            <button 
              onclick={() => handleDelete(post.id)}
              class="cms-btn-icon-danger"
              title={activeTab === 'trash' ? 'Delete Permanently' : m.posts_action_delete()}
            >
              <Trash2 class="h-4 w-4" />
              <span class="sr-only">{activeTab === 'trash' ? 'Delete Permanently' : m.posts_action_delete()}</span>
            </button>
          </div>
        </div>
      {/each}
    {:else}
      <div class="text-center py-12">
        <div class="w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
          <Plus class="h-8 w-8 text-base-content/40" />
        </div>
        <h3 class="text-lg font-semibold text-base-content mb-2">No posts found</h3>
        <p class="text-base-content/60 mb-6">{m.posts_no_posts()}</p>
        <button 
          onclick={handleNewPost}
          class="btn btn-primary gap-2"
        >
          <Plus class="h-4 w-4" />
          {m.posts_new_post()}
        </button>
      </div>
    {/if}
  </div>
</div>

{#if data.posts && data.posts.length > 0}
<!-- Pagination -->
<div class="flex justify-end mt-6">
  <div class="join">
    <button 
      class="join-item btn btn-sm"
      disabled
    >
      <ChevronLeft class="h-4 w-4" />
    </button>
    <span class="join-item btn btn-sm text-sm text-base-content/60 cursor-default">
      {m.posts_page_of({ current: 1, total: 1 })}
    </span>
    <button 
      class="join-item btn btn-sm"
      disabled
    >
      <ChevronRight class="h-4 w-4" />
    </button>
  </div>
</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
<div class="modal modal-open">
  <div class="modal-box">
    <h3 class="font-bold text-lg">
      {deleteIsPermanent ? m.posts_delete_permanently_title() : m.posts_delete_title()}
    </h3>
    <p class="py-4">
      {deleteIsPermanent 
        ? m.posts_delete_permanently_confirm()
        : m.posts_delete_confirm()}
    </p>
    <div class="modal-action">
      <button 
        onclick={cancelDelete}
        class="btn btn-outline"
      >
        {m.common_cancel()}
      </button>
      <button 
        onclick={confirmDelete}
        class="btn btn-error"
      >
        {deleteIsPermanent ? m.posts_action_delete_permanently() : m.posts_action_move_to_trash()}
      </button>
    </div>
  </div>
  <div class="modal-backdrop" onclick={cancelDelete}></div>
</div>
{/if}
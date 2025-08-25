<script>
  import { 
    Edit,
    Eye,
    Trash2,
    Plus,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight
  } from '@lucide/svelte';
  import { goto, replaceState } from '$app/navigation';
  import { page } from '$app/stores';
  
  // Import i18n with modern Paraglide pattern
  import * as m from '$lib/paraglide/messages';
  
  // Get data from load function (Svelte 5 runes mode)
  let { data } = $props();
  
  // State for active tab - initialize from URL
  let activeTab = $state($page.url.searchParams.get('tab') || 'all'); // 'all' or 'trash'
  let trashedPages = $state([]);
  let loadingTrash = $state(false);
  
  // State for delete confirmation modal
  let showDeleteModal = $state(false);
  let pageToDelete = $state(null);
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
  
  // Load trashed pages when switching to trash tab
  async function loadTrashedPages() {
    loadingTrash = true;
    try {
      const response = await fetch('/api/pages/trash');
      if (response.ok) {
        trashedPages = await response.json();
      }
    } catch (err) {
      console.error('Error loading trashed pages:', err);
    } finally {
      loadingTrash = false;
    }
  }
  
  // Restore a page from trash
  async function handleRestore(pageId) {
    try {
      const response = await fetch(`/api/pages/${pageId}/restore`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        // Reload both lists to ensure data is fresh
        await loadTrashedPages();
        // Also reload the main page to get updated pages
        window.location.reload();
      } else {
        console.error('Failed to restore page');
      }
    } catch (err) {
      console.error('Error restoring page:', err);
    }
  }
  
  // Load trash pages on mount to get the count
  $effect(() => {
    // Always load trash pages on mount to show correct count
    loadTrashedPages();
  });
  
  // Simple functions for handling actions
  function handleEdit(pageId) {
    // Preserve tab state in return URL
    const returnUrl = activeTab === 'trash' ? '?tab=trash' : '';
    goto(`/admin/pages/${pageId}/edit?return=/admin/pages${returnUrl}`);
  }
  
  function handleView(pageId) {
    // For trashed pages, just show them in a simple view mode
    // We'll pass the tab state in the URL
    const tabParam = activeTab === 'trash' ? '?tab=trash' : '';
    goto(`/admin/pages/${pageId}/view${tabParam}`);
  }
  
  function handleDelete(pageId) {
    pageToDelete = pageId;
    deleteIsPermanent = activeTab === 'trash';
    showDeleteModal = true;
  }
  
  async function confirmDelete() {
    if (!pageToDelete) return;
    
    try {
      const endpoint = deleteIsPermanent
        ? `/api/pages/${pageToDelete}?permanent=true`
        : `/api/pages/${pageToDelete}`;
      
      
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
          await loadTrashedPages();
        } else {
          // If moving to trash, reload both lists
          await loadTrashedPages();
          window.location.reload();
        }
      } else {
        console.error('Failed to delete page:', result);
        alert(`Failed to delete page: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error deleting page:', err);
      alert('An error occurred while deleting. Please try again.');
    } finally {
      showDeleteModal = false;
      pageToDelete = null;
    }
  }
  
  function cancelDelete() {
    showDeleteModal = false;
    pageToDelete = null;
  }
  
  function handleNewPage() {
    goto('/admin/pages/new');
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
        return m.pages_status_published();
      case 'draft':
        return m.pages_status_draft();
      case 'archived':
        return m.pages_status_archived();
      case 'scheduled':
        return m.pages_status_scheduled();
      case 'trash':
        return m.pages_status_trash();
      default:
        return status;
    }
  }
</script>


<!-- Page Header -->
<div class="cms-page-header">
  <div>
    <h1 class="cms-page-title">{m.pages_title()}</h1>
    <p class="cms-page-subtitle">
      {#if activeTab === 'all'}
        {m.pages_showing({ count: data.pages?.length || 0 })}
      {:else}
        {trashedPages.length === 1 ? 
          m.pages_showing_trashed_singular({ count: trashedPages.length }) : 
          m.pages_showing_trashed_plural({ count: trashedPages.length })
        }
      {/if}
    </p>
  </div>
  <button 
    onclick={handleNewPage}
    class="btn btn-primary gap-2"
  >
    <Plus class="h-4 w-4" />
    {m.pages_new_page()}
  </button>
</div>

<!-- Tabs -->
<div class="flex gap-1 mb-4 border-b border-base-300">
  <button 
    class="px-4 py-2 font-medium transition-colors {activeTab === 'all' ? 'border-b-2 border-primary text-primary' : 'text-base-content/70 hover:text-base-content'}"
    onclick={() => switchTab('all')}
  >
    {m.pages_all_pages_tab()} ({data.pages?.length || 0})
  </button>
  <button 
    class="px-4 py-2 font-medium transition-colors {activeTab === 'trash' ? 'border-b-2 border-primary text-primary' : 'text-base-content/70 hover:text-base-content'}"
    onclick={() => switchTab('trash')}
  >
    {m.pages_trash_tab()} ({trashedPages.length})
  </button>
</div>

<!-- Pages Table -->
<div class="cms-table-container">
  <!-- Search and Filter Bar -->
  <div class="px-6 py-4 border-b border-base-200">
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <!-- Search -->
      <div class="cms-search-container">
        <Search class="cms-search-icon" />
        <input
          type="text"
          placeholder={m.pages_search_placeholder()}
          class="cms-search-input"
        />
      </div>
      
      <!-- Filter -->
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="cms-btn-utility">
          <Filter class="h-4 w-4" />
          {m.pages_filter()}
        </div>
      </div>
    </div>
  </div>
  <!-- Table Header -->
  <div class="cms-table-header">
    <div class="hidden md:grid items-center gap-2 cms-table-header-text" style="grid-template-columns: minmax(200px, 2fr) minmax(80px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(80px, 1fr);">
      <div>{m.pages_table_title()}</div>
      <div class="text-center">{m.pages_table_status()}</div>
      <div class="text-center">{m.pages_table_date()}</div>
      <div class="text-center">{m.pages_table_author()}</div>
      <div class="flex justify-end">
        <div class="flex items-center gap-1">
          <div class="w-8 h-4"></div> <!-- Spacer for first icon -->
          <div class="w-8 h-4 flex justify-center text-xs font-medium">{m.pages_table_actions()}</div> <!-- Text above middle icon -->
          <div class="w-8 h-4"></div> <!-- Spacer for third icon -->
        </div>
      </div>
    </div>
  </div>
  
  <!-- Table Body - Desktop -->
  <div class="hidden md:block divide-y divide-base-content/10">
    {#if data.pages && data.pages.length > 0}
      {#each (activeTab === 'all' ? data.pages : trashedPages) as page}
        <div class="cms-table-row">
          <div class="grid items-center gap-2" style="grid-template-columns: minmax(200px, 2fr) minmax(80px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(80px, 1fr);">
            <!-- Title -->
            <div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold text-base-content hover:text-primary cursor-pointer transition-colors duration-150 text-base leading-6">
                    {page.title}
                  </h3>
                </div>
                <p class="text-sm text-base-content/60 mt-2 line-clamp-2 leading-5">
                  {page.excerpt || m.pages_form_no_excerpt()}
                </p>
              </div>
            </div>
            
            <!-- Status -->
            <div class="text-center">
              <span class="cms-status-badge {getStatusClass(page.status)}">
                {getStatusText(page.status)}
              </span>
            </div>
            
            <!-- Date -->
            <div class="text-center">
              <span class="text-sm font-medium text-base-content/80">
                {page.publishedAtFormatted || page.createdAtFormatted}
              </span>
            </div>
            
            <!-- Author -->
            <div class="text-center">
              <span class="text-sm font-medium text-base-content/80 capitalize">{page.author}</span>
            </div>
            
            <!-- Actions -->
            <div>
              <div class="flex items-center gap-1 justify-end">
                {#if activeTab === 'trash'}
                  <!-- View and Restore buttons for trashed pages -->
                  <button 
                    onclick={() => handleView(page.id)}
                    class="cms-btn-icon"
                    title={m.pages_action_view()}
                  >
                    <Eye class="h-4 w-4" />
                  </button>
                  <button 
                    onclick={() => handleRestore(page.id)}
                    class="cms-btn-icon text-success"
                    title={m.pages_action_restore()}
                    aria-label={m.pages_action_restore()}
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                  </button>
                {:else}
                  <!-- Edit and View buttons for normal pages -->
                  <button 
                    onclick={() => handleEdit(page.id)}
                    class="cms-btn-icon"
                    title={m.pages_action_edit()}
                  >
                    <Edit class="h-4 w-4" />
                  </button>
                  <button 
                    onclick={() => handleView(page.id)}
                    class="cms-btn-icon"
                    title={m.pages_action_view()}
                  >
                    <Eye class="h-4 w-4" />
                  </button>
                {/if}
                <button 
                  onclick={() => handleDelete(page.id)}
                  class="cms-btn-icon-danger"
                  title={activeTab === 'trash' ? 'Delete Permanently' : m.pages_action_delete()}
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
          <h3 class="text-lg font-semibold text-base-content mb-2">No pages found</h3>
          <p class="text-base-content/60 mb-6">{m.pages_no_pages()}</p>
          <button 
            onclick={handleNewPage}
            class="btn btn-primary gap-2"
          >
            <Plus class="h-4 w-4" />
            {m.pages_new_page()}
          </button>
        </div>
      </div>
    {/if}
  </div>

  <!-- Mobile Card Layout -->
  <div class="md:hidden space-y-4">
    {#if data.pages && data.pages.length > 0}
      {#each (activeTab === 'all' ? data.pages : trashedPages) as page}
        <div class="bg-base-100 rounded-lg border border-base-200 p-4">
          <!-- Card Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <h3 class="font-semibold text-base-content text-base leading-6 truncate">
                {page.title}
              </h3>
            </div>
            <span class="cms-status-badge {getStatusClass(page.status)} ml-2 flex-shrink-0">
              {getStatusText(page.status)}
            </span>
          </div>
          
          <!-- Card Content -->
          <p class="text-sm text-base-content/60 mb-3 line-clamp-2 leading-5">
            {page.excerpt || m.pages_form_no_excerpt()}
          </p>
          
          <!-- Card Meta -->
          <div class="flex items-center justify-between text-sm text-base-content/60 mb-3">
            <span>{page.publishedAtFormatted || page.createdAtFormatted}</span>
            <span class="capitalize">{page.author}</span>
          </div>
          
          <!-- Card Actions -->
          <div class="flex items-center justify-end gap-1 pt-2 border-t border-base-200">
            {#if activeTab === 'trash'}
              <button 
                onclick={() => handleView(page.id)}
                class="cms-btn-icon"
                title={m.pages_action_view()}
              >
                <Eye class="h-4 w-4" />
                <span class="sr-only">{m.pages_action_view()}</span>
              </button>
              <button 
                onclick={() => handleRestore(page.id)}
                class="cms-btn-icon text-success"
                title={m.pages_action_restore()}
                aria-label={m.pages_action_restore()}
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span class="sr-only">{m.pages_action_restore()}</span>
              </button>
            {:else}
              <button 
                onclick={() => handleEdit(page.id)}
                class="cms-btn-icon"
                title={m.pages_action_edit()}
              >
                <Edit class="h-4 w-4" />
                <span class="sr-only">{m.pages_action_edit()}</span>
              </button>
              <button 
                onclick={() => handleView(page.id)}
                class="cms-btn-icon"
                title={m.pages_action_view()}
              >
                <Eye class="h-4 w-4" />
                <span class="sr-only">{m.pages_action_view()}</span>
              </button>
            {/if}
            <button 
              onclick={() => handleDelete(page.id)}
              class="cms-btn-icon-danger"
              title={activeTab === 'trash' ? 'Delete Permanently' : m.pages_action_delete()}
            >
              <Trash2 class="h-4 w-4" />
              <span class="sr-only">{activeTab === 'trash' ? 'Delete Permanently' : m.pages_action_delete()}</span>
            </button>
          </div>
        </div>
      {/each}
    {:else}
      <div class="text-center py-12">
        <div class="w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
          <Plus class="h-8 w-8 text-base-content/40" />
        </div>
        <h3 class="text-lg font-semibold text-base-content mb-2">No pages found</h3>
        <p class="text-base-content/60 mb-6">{m.pages_no_pages()}</p>
        <button 
          onclick={handleNewPage}
          class="btn btn-primary gap-2"
        >
          <Plus class="h-4 w-4" />
          {m.pages_new_page()}
        </button>
      </div>
    {/if}
  </div>
</div>

{#if data.pages && data.pages.length > 0}
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
      {m.pages_page_of({ current: 1, total: 1 })}
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
      {deleteIsPermanent ? m.pages_delete_permanently_title() : m.pages_delete_title()}
    </h3>
    <p class="py-4">
      {deleteIsPermanent 
        ? m.pages_delete_permanently_confirm()
        : m.pages_delete_confirm()}
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
        {deleteIsPermanent ? m.pages_action_delete_permanently() : m.pages_action_move_to_trash()}
      </button>
    </div>
  </div>
  <div class="modal-backdrop" onclick={cancelDelete}></div>
</div>
{/if}
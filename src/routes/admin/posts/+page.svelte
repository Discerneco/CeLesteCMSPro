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
  
  // Import i18n with modern Paraglide pattern
  import * as m from '$lib/paraglide/messages';
  
  // Get data from load function
  export let data;
  
  // Simple functions for handling actions
  function handleEdit(postId) {
    console.log('Edit post:', postId);
    // TODO: Navigate to edit page
  }
  
  function handleView(postId) {
    console.log('View post:', postId);
    // TODO: Navigate to view page
  }
  
  function handleDelete(postId) {
    if (confirm(m.posts_delete_confirm())) {
      console.log('Delete post:', postId);
      // TODO: Implement delete functionality
    }
  }
  
  function handleNewPost() {
    console.log('Create new post');
    // TODO: Navigate to new post page
  }
  
  function getStatusClass(status) {
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
  }
  
  function getStatusText(status) {
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
  }
</script>


<!-- Page Header -->
<div class="cms-page-header">
  <div>
    <h1 class="cms-page-title">{m.posts_title()}</h1>
    <p class="cms-page-subtitle">{m.posts_subtitle()}</p>
  </div>
  <button 
    onclick={handleNewPost}
    class="btn btn-primary gap-2"
  >
    <Plus class="h-4 w-4" />
    {m.posts_new_post()}
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
      <div class="text-right">{m.posts_table_actions()}</div>
    </div>
  </div>
  
  <!-- Table Body - Desktop -->
  <div class="hidden md:block divide-y divide-base-content/10">
    {#if data.posts && data.posts.length > 0}
      {#each data.posts as post}
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
                  {post.excerpt || 'No excerpt available'}
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
                <button 
                  onclick={() => handleDelete(post.id)}
                  class="cms-btn-icon-danger"
                  title={m.posts_action_delete()}
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
      {#each data.posts as post}
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
            {post.excerpt || 'No excerpt available'}
          </p>
          
          <!-- Card Meta -->
          <div class="flex items-center justify-between text-sm text-base-content/60 mb-3">
            <span>{post.publishedAtFormatted || post.createdAtFormatted}</span>
            <span class="capitalize">{post.author}</span>
          </div>
          
          <!-- Card Actions -->
          <div class="flex items-center justify-end gap-1 pt-2 border-t border-base-200">
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
            <button 
              onclick={() => handleDelete(post.id)}
              class="cms-btn-icon-danger"
              title={m.posts_action_delete()}
            >
              <Trash2 class="h-4 w-4" />
              <span class="sr-only">{m.posts_action_delete()}</span>
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

<!-- Pagination and Stats -->
<div class="flex items-center justify-between mt-6">
  <div class="text-sm text-base-content/60">
    {m.posts_showing({ count: data.posts?.length || 0 })}
  </div>
  
  {#if data.posts && data.posts.length > 0}
    <div class="join">
      <button 
        class="join-item btn btn-sm"
        disabled
      >
        <ChevronLeft class="h-4 w-4" />
      </button>
      <span class="join-item btn btn-sm text-sm text-base-content/60 cursor-default">
        Page 1 of 1
      </span>
      <button 
        class="join-item btn btn-sm"
        disabled
      >
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>
  {/if}
</div>
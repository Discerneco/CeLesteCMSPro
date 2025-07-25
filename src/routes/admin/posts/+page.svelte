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
        return 'bg-success/10 text-success border-success/20';
      case 'draft':
        return 'bg-base-300/60 text-base-content/90 border-base-300/50';
      case 'archived':
        return 'bg-neutral/10 text-neutral border-neutral/20';
      default:
        return 'bg-base-200 text-base-content/60 border-base-300';
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
<div class="flex items-center justify-between mb-6">
  <div>
    <h1 class="text-2xl font-bold text-base-content">{m.posts_title()}</h1>
    <p class="text-base-content/70 mt-1">{m.posts_subtitle()}</p>
  </div>
  <button 
    onclick={handleNewPost}
    class="btn btn-primary gap-2"
  >
    <Plus class="h-4 w-4" />
    {m.posts_new_post()}
  </button>
</div>

<!-- Search and Filters -->
<div class="bg-base-100 rounded-lg border border-base-300 p-4 mb-6">
  <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
    <!-- Search -->
    <div class="relative flex-1 max-w-md">
      <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/40" />
      <input
        type="text"
        placeholder={m.posts_search_placeholder()}
        class="input input-bordered w-full pl-10"
        disabled
      />
    </div>
    
    <!-- Filter -->
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-outline gap-2">
        <Filter class="h-4 w-4" />
        {m.posts_filter()}
      </div>
    </div>
  </div>
</div>

<!-- Posts Table -->
<div class="bg-base-100 rounded-xl border border-base-200 shadow-sm overflow-hidden">
  <!-- Table Header -->
  <div class="px-6 py-4 bg-base-200 border-b border-base-300">
    <div class="grid grid-cols-12 gap-4 items-center text-xs font-medium text-base-content/60 uppercase tracking-wider">
      <div class="col-span-4">{m.posts_table_title()}</div>
      <div class="col-span-2">{m.posts_table_status()}</div>
      <div class="col-span-2">{m.posts_table_date()}</div>
      <div class="col-span-2">{m.posts_table_author()}</div>
      <div class="col-span-2">{m.posts_table_actions()}</div>
    </div>
  </div>
  
  <!-- Table Body -->
  <div class="divide-y divide-base-300">
    {#if data.posts && data.posts.length > 0}
      {#each data.posts as post}
        <div class="px-6 py-4 hover:bg-base-50 transition-colors duration-150">
          <div class="grid grid-cols-12 gap-4 items-center">
            <!-- Title -->
            <div class="col-span-4">
              <div class="flex items-start gap-3">
                {#if post.featured}
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">{m.posts_featured_badge()}</span>
                {/if}
                <div class="min-w-0 flex-1">
                  <h3 class="font-semibold text-base-content hover:text-primary cursor-pointer transition-colors duration-150 text-base leading-6">
                    {post.title}
                  </h3>
                  <p class="text-sm text-base-content/60 mt-2 line-clamp-2 leading-5">
                    {post.excerpt || 'No excerpt available'}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Status -->
            <div class="col-span-2">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium {getStatusClass(post.status)}">
                {getStatusText(post.status)}
              </span>
            </div>
            
            <!-- Date -->
            <div class="col-span-2">
              <span class="text-sm font-medium text-base-content/80">
                {post.publishedAtFormatted || post.createdAtFormatted}
              </span>
            </div>
            
            <!-- Author -->
            <div class="col-span-2">
              <span class="text-sm font-medium text-base-content/80 capitalize">{post.author}</span>
            </div>
            
            <!-- Actions -->
            <div class="col-span-2">
              <div class="flex items-center gap-1">
                <button 
                  onclick={() => handleEdit(post.id)}
                  class="btn btn-ghost btn-sm btn-square text-base-content/60 hover:text-primary hover:bg-primary/10 transition-all duration-150"
                  title={m.posts_action_edit()}
                >
                  <Edit class="h-4 w-4" />
                </button>
                <button 
                  onclick={() => handleView(post.id)}
                  class="btn btn-ghost btn-sm btn-square text-base-content/60 hover:text-primary hover:bg-primary/10 transition-all duration-150"
                  title={m.posts_action_view()}
                >
                  <Eye class="h-4 w-4" />
                </button>
                <button 
                  onclick={() => handleDelete(post.id)}
                  class="btn btn-ghost btn-sm btn-square text-base-content/60 hover:text-error hover:bg-error/10 transition-all duration-150"
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
</div>

<!-- Pagination and Stats -->
<div class="flex items-center justify-between mt-6">
  <div class="text-sm text-base-content/60">
    {m.posts_showing({ count: data.posts?.length || 0 })}
  </div>
  
  {#if data.posts && data.posts.length > 0}
    <div class="flex items-center gap-2">
      <span class="text-sm text-base-content/60">
        Page 1 of 1
      </span>
      
      <div class="join">
        <button 
          class="join-item btn btn-sm"
          disabled
        >
          <ChevronLeft class="h-4 w-4" />
        </button>
        <button 
          class="join-item btn btn-sm"
          disabled
        >
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>
    </div>
  {/if}
</div>
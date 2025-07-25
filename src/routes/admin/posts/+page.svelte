<script>
  import { 
    Edit,
    Eye,
    Trash2,
    Plus
  } from '@lucide/svelte';
  
  // Import i18n with modern Paraglide pattern
  import * as m from '$lib/paraglide/messages';
  
  // Get data from load function
  export let data;
  
  console.log('Posts page received data:', data);
  
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
        return 'badge-success';
      case 'draft':
        return 'badge-warning';
      case 'archived':
        return 'badge-neutral';
      default:
        return 'badge-ghost';
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

<!-- Debug Info -->
<div class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
  <h3 class="font-bold text-green-800">Database Posts Debug:</h3>
  <p class="text-sm text-green-700">
    Total posts loaded: {data.posts?.length || 0}
  </p>
  {#if data.posts && data.posts.length > 0}
    <ul class="text-xs text-green-600 mt-2">
      {#each data.posts as post}
        <li>• {post.title} ({post.status}) - {post.author}</li>
      {/each}
    </ul>
  {/if}
</div>

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

<!-- Posts Table -->
<div class="bg-base-100 rounded-lg border border-base-300 overflow-hidden">
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
        <div class="px-6 py-4 hover:bg-base-50">
          <div class="grid grid-cols-12 gap-4 items-center">
            <!-- Title -->
            <div class="col-span-4">
              <div class="flex items-center gap-3">
                {#if post.featured}
                  <span class="badge badge-warning badge-sm">{m.posts_featured_badge()}</span>
                {/if}
                <div>
                  <h3 class="font-medium text-base-content hover:text-primary cursor-pointer">
                    {post.title}
                  </h3>
                  <p class="text-sm text-base-content/60 mt-1 line-clamp-1">
                    {post.excerpt}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Status -->
            <div class="col-span-2">
              <span class="badge {getStatusClass(post.status)} badge-sm">
                {getStatusText(post.status)}
              </span>
            </div>
            
            <!-- Date -->
            <div class="col-span-2">
              <span class="text-sm text-base-content/70">
                {post.publishedAtFormatted || post.createdAtFormatted}
              </span>
            </div>
            
            <!-- Author -->
            <div class="col-span-2">
              <span class="text-sm text-base-content/70">{post.author}</span>
            </div>
            
            <!-- Actions -->
            <div class="col-span-2">
              <div class="flex items-center gap-2">
                <button 
                  onclick={() => handleEdit(post.id)}
                  class="btn btn-ghost btn-sm btn-square text-primary hover:bg-primary/10"
                  title={m.posts_action_edit()}
                >
                  <Edit class="h-4 w-4" />
                </button>
                <button 
                  onclick={() => handleView(post.id)}
                  class="btn btn-ghost btn-sm btn-square text-primary hover:bg-primary/10"
                  title={m.posts_action_view()}
                >
                  <Eye class="h-4 w-4" />
                </button>
                <button 
                  onclick={() => handleDelete(post.id)}
                  class="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
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
        <p class="text-base-content/60">{m.posts_no_posts()}</p>
      </div>
    {/if}
  </div>
</div>

<!-- Stats -->
<div class="flex items-center justify-between mt-6">
  <div class="text-sm text-base-content/60">
    {m.posts_showing({ count: data.posts?.length || 0 })}
  </div>
</div>
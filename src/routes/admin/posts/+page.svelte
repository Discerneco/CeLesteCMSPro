<script>
  import { 
    Search,
    Filter,
    Edit,
    Eye,
    Trash2,
    Plus,
    ChevronLeft,
    ChevronRight
  } from '@lucide/svelte';
  
  // Import i18n with modern Paraglide pattern
  import * as m from '$lib/paraglide/messages';
  
  // Modern Svelte 5 runes state management
  let searchTerm = $state('');
  let statusFilter = $state('all');
  let currentPage = $state(1);
  const postsPerPage = 10;
  
  // Hardcoded data matching the database posts
  const hardcodedPosts = [
    {
      id: 'rd9zuskwfobc15luwpdweoid',
      title: 'Event Venue Finalized for the Reunion',
      slug: 'event-venue-finalized-for-the-reunion',
      excerpt: 'We are excited to announce that we have finalized the venue ...',
      status: 'published',
      featured: true,
      author: 'Admin',
      createdAt: '16/04/2025',
      publishedAt: '16/04/2025'
    },
    {
      id: 'va3gt4hg1w2mh9liqmhicc3d',
      title: 'Fundraising Goal Reached!',
      slug: 'fundraising-goal-reached',
      excerpt: 'Thanks to your generous contributions, we have reached our f...',
      status: 'published',
      featured: false,
      author: 'Admin',
      createdAt: '14/04/2025',
      publishedAt: '14/04/2025'
    },
    {
      id: 'vqf8jmrx75b1xq8nc35f665c',
      title: 'Reunion Schedule Draft',
      slug: 'reunion-schedule-draft',
      excerpt: 'Check out the draft schedule for our upcoming reunion weeken...',
      status: 'draft',
      featured: false,
      author: 'Admin',
      createdAt: '19/04/2025',
      publishedAt: null
    }
  ];
  
  // Filtered posts based on search and status
  let filteredPosts = $derived(() => {
    let posts = hardcodedPosts;
    
    // Filter by search term
    if (searchTerm.trim()) {
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      posts = posts.filter(post => post.status === statusFilter);
    }
    
    return posts;
  });
  
  // Pagination
  let totalPages = $derived(Math.ceil(filteredPosts.length / postsPerPage));
  let paginatedPosts = $derived(() => {
    const start = (currentPage - 1) * postsPerPage;
    const end = start + postsPerPage;
    return filteredPosts.slice(start, end);
  });
  
  // Reset pagination when filters change
  $effect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      currentPage = 1;
    }
  });
  
  function handleStatusFilter(newStatus) {
    statusFilter = newStatus;
    currentPage = 1;
  }
  
  function handleSearch(event) {
    searchTerm = event.target.value;
    currentPage = 1;
  }
  
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
  
  function formatDate(dateString) {
    return dateString || '-';
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
        bind:value={searchTerm}
        oninput={handleSearch}
      />
    </div>
    
    <!-- Filter -->
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-outline gap-2">
        <Filter class="h-4 w-4" />
        {m.posts_filter()}
      </div>
      <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
        <li>
          <button 
            onclick={() => handleStatusFilter('all')}
            class={statusFilter === 'all' ? 'active' : ''}
          >
            {m.posts_filter_all()}
          </button>
        </li>
        <li>
          <button 
            onclick={() => handleStatusFilter('published')}
            class={statusFilter === 'published' ? 'active' : ''}
          >
            {m.posts_filter_published()}
          </button>
        </li>
        <li>
          <button 
            onclick={() => handleStatusFilter('draft')}
            class={statusFilter === 'draft' ? 'active' : ''}
          >
            {m.posts_filter_draft()}
          </button>
        </li>
        <li>
          <button 
            onclick={() => handleStatusFilter('archived')}
            class={statusFilter === 'archived' ? 'active' : ''}
          >
            {m.posts_filter_archived()}
          </button>
        </li>
      </ul>
    </div>
  </div>
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
    {#each paginatedPosts as post}
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
              {formatDate(post.publishedAt || post.createdAt)}
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
    {:else}
      <div class="px-6 py-12 text-center">
        <p class="text-base-content/60">{m.posts_no_posts()}</p>
      </div>
    {/each}
  </div>
</div>

<!-- Pagination and Stats -->
<div class="flex items-center justify-between mt-6">
  <div class="text-sm text-base-content/60">
    {m.posts_showing({ count: filteredPosts.length })}
  </div>
  
  {#if totalPages > 1}
    <div class="flex items-center gap-2">
      <span class="text-sm text-base-content/60">
        {m.posts_page_of({ current: currentPage, total: totalPages })}
      </span>
      
      <div class="join">
        <button 
          class="join-item btn btn-sm"
          disabled={currentPage === 1}
          onclick={() => currentPage = Math.max(1, currentPage - 1)}
        >
          <ChevronLeft class="h-4 w-4" />
        </button>
        <button 
          class="join-item btn btn-sm"
          disabled={currentPage === totalPages}
          onclick={() => currentPage = Math.min(totalPages, currentPage + 1)}
        >
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>
    </div>
  {/if}
</div>
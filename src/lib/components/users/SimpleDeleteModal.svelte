<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  
  let { 
    isOpen = $bindable(false),
    user = null,
    onUserDeleted
  }: {
    isOpen?: boolean;
    user?: any;
    onUserDeleted?: (user: any) => void;
  } = $props();

  // State management
  let contentAction = $state('delete_all');
  let selectedTransferUser = $state('');
  let isLoadingData = $state(false);
  let showDetails = $state(false);
  let isDeleting = $state(false);
  let deleteError = $state('');
  
  // Data that will be fetched
  let contentCounts = $state({
    posts: 0,
    media: 0,
    pages: 0,
    comments: 0
  });
  
  // Detailed items for View Details
  let contentItems = $state<{
    posts: Array<{id: string, title: string, status: string, createdAt: Date}>,
    media: Array<{id: string, filename: string, type: string, createdAt: Date}>
  }>({
    posts: [],
    media: []
  });
  
  let availableUsers = $state<Array<{id: string, name: string, email: string}>>([]);

  // Watch for action changes using $derived
  let showTransferSelect = $derived(contentAction === 'transfer');
  
  // Track which user we're fetching for to prevent infinite loops
  let fetchingForUserId = '';
  let abortController: AbortController | null = null;
  
  // Fetch linked content when modal opens - using IIFE pattern for async in $effect
  $effect(() => {
    // Only fetch if modal is open, we have a user, and we haven't fetched for this user yet
    if (isOpen && user?.id && fetchingForUserId !== user.id) {
      // Mark that we're fetching for this user
      fetchingForUserId = user.id;
      
      // Abort any previous request
      if (abortController) {
        abortController.abort();
      }
      
      // Create new abort controller
      abortController = new AbortController();
      const { signal } = abortController;
      
      // Set loading state
      isLoadingData = true;
      
      // Use IIFE to handle async operations in $effect
      (async () => {
        
        try {
          const response = await fetch(`/api/users/${user.id}/linked-content`, { signal });
          
          // Check if request was aborted
          if (signal.aborted) {
            return;
          }
          
          const result = await response.json();
          
          if (response.ok && result.linkedContent) {
            // Update counts
            contentCounts = {
              posts: result.linkedContent.posts?.count || 0,
              media: result.linkedContent.media?.count || 0,
              pages: 0, // Not implemented yet
              comments: 0 // Not implemented yet
            };
            
            // Update detailed items
            contentItems = {
              posts: result.linkedContent.posts?.items || [],
              media: result.linkedContent.media?.items || []
            };
            
            // Update available users for reassignment
            if (result.linkedContent.reassignmentOptions) {
              availableUsers = result.linkedContent.reassignmentOptions.map((opt: any) => ({
                id: opt.id,
                name: opt.name,
                email: opt.email
              }));
            }
          } else {
            console.error('SimpleDeleteModal: Failed to load linked content:', result);
          }
        } catch (err: any) {
          // Ignore abort errors
          if (err?.name !== 'AbortError') {
            console.error('SimpleDeleteModal: Error fetching linked content:', err);
          }
          // Keep default values on error
        } finally {
          isLoadingData = false;
        }
      })(); // Execute the async function immediately
    }
    
    // Reset when modal closes
    if (!isOpen && fetchingForUserId) {
      fetchingForUserId = '';
      contentCounts = { posts: 0, media: 0, pages: 0, comments: 0 };
      contentItems = { posts: [], media: [] };
      availableUsers = [];
      isLoadingData = false;
      showDetails = false;
      
      // Abort any pending request
      if (abortController) {
        abortController.abort();
        abortController = null;
      }
    }
  });

  function handleClose() {
    isOpen = false;
    contentAction = 'delete_all';
    selectedTransferUser = '';
    deleteError = '';
    // Data reset is handled in $effect when !isOpen
  }

  async function handleDelete() {
    if (!user?.id) return;
    
    isDeleting = true;
    deleteError = '';
    
    try {
      // Prepare request body based on content action
      const requestBody: any = {};
      
      if (contentCounts.posts > 0 || contentCounts.media > 0) {
        requestBody.contentAction = contentAction;
        
        if (contentAction === 'transfer' && selectedTransferUser) {
          requestBody.reassignToUserId = selectedTransferUser;
        }
      }
      
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }
      
      // Success! Call the callback and close modal
      if (onUserDeleted) {
        onUserDeleted(user);
      }
      
      handleClose();
    } catch (error) {
      console.error('Error deleting user:', error);
      deleteError = error instanceof Error ? error.message : 'Failed to delete user';
    } finally {
      isDeleting = false;
    }
  }

  function handleViewDetails() {
    showDetails = !showDetails;
  }

  // Format role for display
  function formatRole(role: string) {
    switch (role) {
      case 'admin': return m.users_role_admin();
      case 'editor': return m.users_role_editor();
      case 'author': return m.users_role_author();
      case 'subscriber': return m.users_role_subscriber();
      default: return role;
    }
  }
  
  // Format date for display
  function formatDate(date: Date | string) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  // Get status badge color
  function getStatusColor(status: string) {
    switch (status) {
      case 'published': return 'badge-success';
      case 'draft': return 'badge-warning';
      case 'archived': return 'badge-neutral';
      default: return 'badge-ghost';
    }
  }

  // Generate consistent random color for user avatar
  function getAvatarColor(userId: string) {
    const colors = [
      'bg-primary text-primary-content',
      'bg-secondary text-secondary-content', 
      'bg-accent text-accent-content',
      'bg-info text-info-content',
      'bg-success text-success-content',
      'bg-warning text-warning-content',
      'bg-error text-error-content',
      'bg-neutral text-neutral-content'
    ];
    
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return colors[Math.abs(hash) % colors.length];
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleClose();
    }
  }
</script>

{#if isOpen && user}
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div class="modal modal-open" onkeydown={handleKeydown}>
    <div class="modal-box max-w-2xl">
      <!-- Header -->
      <h3 class="font-bold text-lg mb-4">{m.users_modal_delete_title()}</h3>
      
      <!-- User Info Card -->
      <div class="card bg-base-200 border border-base-300 mb-6">
        <div class="card-body p-4">
          <div class="flex items-center gap-3">
            <div class="{getAvatarColor(user.id)} rounded-full w-12 h-12 grid place-content-center">
              {(user.name || user.username || '??').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <div class="font-medium text-base-content">{user.name || user.username}</div>
              <div class="text-sm text-base-content/60">{user.email}</div>
              <div class="text-xs text-base-content/50">@{user.username} • {formatRole(user.role)}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Error Display -->
      {#if deleteError}
        <div class="alert alert-error mb-4">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{deleteError}</span>
        </div>
      {/if}

      <!-- Linked Content Table -->
      <div class="mb-6">
        <h4 class="text-sm font-medium text-base-content/70 mb-3">{m.users_delete_linked_content()}</h4>
        {#if isLoadingData}
          <div class="flex items-center justify-center py-4">
            <span class="loading loading-spinner loading-sm mr-2"></span>
            <span class="text-base-content/60 text-sm">{m.settings_statistics_loading()}</span>
          </div>
        {:else}
          <div class="overflow-x-auto">
            <table class="table table-compact w-full">
              <thead>
                <tr class="border-base-300">
                  <th class="text-center">{m.posts_title()}</th>
                  <th class="text-center">{m.media_title()}</th>
                  <th class="text-center">{m.users_delete_pages()}</th>
                  <th class="text-center">{m.users_delete_comments()}</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-base-300">
                  <td class="text-center font-medium text-lg">
                    {#if contentCounts.posts > 0}
                      <span class="text-warning">{contentCounts.posts}</span>
                    {:else}
                      <span class="text-base-content/30">0</span>
                    {/if}
                  </td>
                  <td class="text-center font-medium text-lg">
                    {#if contentCounts.media > 0}
                      <span class="text-warning">{contentCounts.media}</span>
                    {:else}
                      <span class="text-base-content/30">0</span>
                    {/if}
                  </td>
                  <td class="text-center font-medium text-lg">
                    {#if contentCounts.pages > 0}
                      <span class="text-warning">{contentCounts.pages}</span>
                    {:else}
                      <span class="text-base-content/30">0</span>
                    {/if}
                  </td>
                  <td class="text-center font-medium text-lg">
                    {#if contentCounts.comments > 0}
                      <span class="text-warning">{contentCounts.comments}</span>
                    {:else}
                      <span class="text-base-content/30">0</span>
                    {/if}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Detailed View (shown when View Details is clicked) -->
          {#if showDetails && !isLoadingData}
            <div class="mt-4 space-y-4">
              <!-- Posts Details -->
              {#if contentItems.posts.length > 0}
                <div class="collapse collapse-arrow border border-base-300 bg-base-200">
                  <input type="checkbox" checked />
                  <div class="collapse-title font-medium">
                    {m.posts_title()} ({contentItems.posts.length})
                  </div>
                  <div class="collapse-content">
                    <div class="space-y-2 pt-2">
                      {#each contentItems.posts as post}
                        <div class="flex items-center justify-between p-2 bg-base-100 rounded">
                          <div class="flex-1">
                            <span class="font-medium">{post.title}</span>
                            <div class="text-xs text-base-content/60 mt-1">
                              {formatDate(post.createdAt)}
                            </div>
                          </div>
                          <span class="badge {getStatusColor(post.status)} badge-sm">
                            {post.status}
                          </span>
                        </div>
                      {/each}
                    </div>
                  </div>
                </div>
              {/if}
              
              <!-- Media Details -->
              {#if contentItems.media.length > 0}
                <div class="collapse collapse-arrow border border-base-300 bg-base-200">
                  <input type="checkbox" checked />
                  <div class="collapse-title font-medium">
                    {m.media_title()} ({contentItems.media.length})
                  </div>
                  <div class="collapse-content">
                    <div class="space-y-2 pt-2">
                      {#each contentItems.media as file}
                        <div class="flex items-center justify-between p-2 bg-base-100 rounded">
                          <div class="flex-1">
                            <span class="font-medium">{file.filename}</span>
                            <div class="text-xs text-base-content/60 mt-1">
                              {file.type} • {formatDate(file.createdAt)}
                            </div>
                          </div>
                        </div>
                      {/each}
                    </div>
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        {/if}
      </div>

      <!-- Action Selection - Only show after loading is complete -->
      {#if !isLoadingData}
        {#if contentCounts.posts > 0 || contentCounts.media > 0 || contentCounts.pages > 0 || contentCounts.comments > 0}
          <div class="form-control mb-6">
            <label class="label" for="content-action-select">
              <span class="label-text font-medium">{m.users_delete_content_action_label()}</span>
            </label>
            <select id="content-action-select" class="select select-bordered w-full" bind:value={contentAction}>
              <option value="delete_all">{m.users_delete_action_delete_all()}</option>
              <option value="transfer">{m.users_delete_action_reassign()}</option>
              <option value="anonymous">{m.users_delete_action_anonymous()}</option>
            </select>
          </div>

          <!-- Transfer User Selection (shown when transfer is selected) -->
          {#if showTransferSelect}
            <div class="form-control mb-6">
              <label class="label" for="transfer-user-select">
                <span class="label-text">{m.users_delete_transfer_to()}</span>
              </label>
              <select id="transfer-user-select" class="select select-bordered w-full" bind:value={selectedTransferUser}>
                <option value="">{m.users_delete_select_user()}</option>
                {#each availableUsers as availableUser}
                  {#if availableUser.id !== user.id}
                    <option value={availableUser.id}>
                      {availableUser.name} ({availableUser.email})
                    </option>
                  {/if}
                {/each}
              </select>
            </div>
          {/if}
        {:else}
          <!-- No linked content message -->
          <div class="alert alert-info mb-6">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{m.users_delete_no_linked_content()}</span>
          </div>
        {/if}
      {/if}

      <!-- Confirmation Message -->
      <p class="text-sm text-base-content/70 mb-6">
        {#if contentCounts.posts > 0 || contentCounts.media > 0 || contentCounts.pages > 0 || contentCounts.comments > 0}
          {m.users_delete_warning()}
        {:else}
          {m.users_modal_delete_confirm()}
        {/if}
      </p>

      <!-- Action Buttons -->
      <div class="modal-action justify-between">
        {#if (contentCounts.posts > 0 || contentCounts.media > 0) && !isLoadingData}
          <button 
            type="button" 
            class="btn btn-sm btn-ghost"
            onclick={handleViewDetails}
          >
            {showDetails ? m.users_delete_hide_details() : m.users_delete_view_details()}
          </button>
        {:else}
          <div></div>
        {/if}
        <div class="flex gap-2">
          <button 
            type="button" 
            class="btn btn-ghost" 
            onclick={handleClose}
            disabled={isDeleting}
          >
            {m.users_modal_delete_cancel()}
          </button>
          <button 
            type="button" 
            class="btn btn-error"
            onclick={handleDelete}
            disabled={isDeleting || (showTransferSelect && !selectedTransferUser)}
          >
            {#if isDeleting}
              <span class="loading loading-spinner loading-sm"></span>
              {m.users_modal_delete_deleting()}
            {:else}
              {m.users_modal_delete_button()}
            {/if}
          </button>
        </div>
      </div>
    </div>
    <div class="modal-backdrop" onclick={handleClose} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && handleClose()}></div>
  </div>
{/if}
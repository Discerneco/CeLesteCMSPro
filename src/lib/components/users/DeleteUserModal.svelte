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
  let isLoading = $state(false);
  let isLoadingContent = $state(false);
  let error = $state('');
  let loadError = $state('');
  let linkedContent = $state<any>(null);
  let contentAction = $state('delete_all'); // 'delete_all', 'reassign', 'anonymous'
  let selectedReassignUser = $state('');
  
  // Track state to prevent duplicate fetches
  let lastUserId = '';

  // Handle modal open/close
  $effect(() => {
    if (isOpen && user?.id && user.id !== lastUserId) {
      console.log('DeleteModal: Loading content for user:', user.id);
      lastUserId = user.id;
      loadLinkedContent();
    } else if (!isOpen) {
      // Reset state when modal closes
      linkedContent = null;
      loadError = '';
      error = '';
      lastUserId = '';
      contentAction = 'delete_all';
      selectedReassignUser = '';
      isLoadingContent = false;
    }
  });

  async function loadLinkedContent() {
    if (!user?.id) {
      console.error('DeleteModal: No user ID provided');
      return;
    }
    
    isLoadingContent = true;
    loadError = '';
    
    try {
      console.log('DeleteModal: Fetching from API:', `/api/users/${user.id}/linked-content`);
      const response = await fetch(`/api/users/${user.id}/linked-content`);
      const result = await response.json();
      
      if (!response.ok) {
        console.error('DeleteModal: API error:', result);
        throw new Error(result.error || 'Failed to check linked content');
      }
      
      console.log('DeleteModal: API success, data:', result.linkedContent);
      linkedContent = result.linkedContent || {
        hasContent: false,
        posts: { count: 0, items: [] },
        media: { count: 0, items: [] },
        reassignmentOptions: []
      };
    } catch (err) {
      console.error('DeleteModal: Error loading content:', err);
      loadError = err instanceof Error ? err.message : 'Failed to load linked content';
      // Set default content on error so user can still delete
      linkedContent = {
        hasContent: false,
        posts: { count: 0, items: [] },
        media: { count: 0, items: [] },
        reassignmentOptions: []
      };
    } finally {
      isLoadingContent = false;
    }
  }

  async function handleDelete() {
    if (!user) return;

    isLoading = true;
    error = '';

    try {
      const deleteData: any = {};
      
      if (linkedContent?.hasContent) {
        deleteData.contentAction = contentAction;
        if (contentAction === 'reassign' && selectedReassignUser) {
          deleteData.reassignToUserId = selectedReassignUser;
        }
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deleteData)
      });

      const result = await response.json();

      if (!response.ok) {
        error = result.error || m.users_error_delete_failed();
        return;
      }

      if (onUserDeleted) {
        onUserDeleted(user);
      }
      isOpen = false;

    } catch (err) {
      console.error('Error deleting user:', err);
      error = m.users_error_delete_failed();
    } finally {
      isLoading = false;
    }
  }

  function handleClose() {
    isOpen = false;
    error = '';
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

  // Format count with localized text
  function formatCount(count: number | undefined, type: 'posts' | 'media') {
    const safeCount = count || 0;
    const key = type === 'posts' ? m.users_delete_posts_count : m.users_delete_media_count;
    return key().replace('{count}', safeCount.toString());
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
    
    // Simple hash function to get consistent color based on userId
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return colors[Math.abs(hash) % colors.length];
  }
</script>

{#if isOpen}
  <div class="modal modal-open">
    <div class="modal-box max-w-2xl">
      <h3 class="font-bold text-lg mb-4">{m.users_modal_delete_title()}</h3>
      
      {#if error}
        <div class="alert alert-error mb-4">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <span>{error}</span>
        </div>
      {/if}

      {#if user}
        <div class="mb-6">
          <!-- User Info -->
          <div class="card bg-base-200 border border-base-300 mb-4">
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

          <!-- Linked Content Check -->
          {#if isLoadingContent}
            <!-- Loading state -->
            <div class="flex items-center justify-center py-4">
              <span class="loading loading-spinner loading-md mr-2"></span>
              <span class="text-base-content/70">Checking linked content...</span>
            </div>
          {:else if loadError}
            <!-- Error state -->
            <div class="alert alert-error mb-4">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <div>
                <div>Failed to load linked content</div>
                <div class="text-sm opacity-75">{loadError}</div>
              </div>
            </div>
            <!-- Still show delete confirmation on error -->
            <p class="text-base-content/70 mb-4">
              {m.users_modal_delete_confirm()}
            </p>
          {:else if linkedContent}
            <!-- Success state -->
            {#if linkedContent.hasContent}
              <!-- Enhanced delete with content handling -->
              <div class="alert alert-warning mb-4">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <div>
                  <div class="font-medium">{m.users_delete_has_content()}</div>
                  <div class="mt-2 space-y-1">
                    {#if linkedContent.posts?.count > 0}
                      <div class="text-sm">• {formatCount(linkedContent.posts.count, 'posts')}</div>
                    {/if}
                    {#if linkedContent.media?.count > 0}
                      <div class="text-sm">• {formatCount(linkedContent.media.count, 'media')}</div>
                    {/if}
                  </div>
                </div>
              </div>

              <!-- Content action selection -->
              <div class="form-control mb-4">
                <div class="label">
                  <span class="label-text font-medium">{m.users_delete_content_action()}</span>
                </div>
                <div class="space-y-2">
                  <label class="label cursor-pointer justify-start gap-3">
                    <input type="radio" name="contentAction" class="radio radio-primary" 
                           bind:group={contentAction} value="delete_all" />
                    <span class="label-text">{m.users_delete_action_delete_all()}</span>
                  </label>
                  <label class="label cursor-pointer justify-start gap-3">
                    <input type="radio" name="contentAction" class="radio radio-primary" 
                           bind:group={contentAction} value="reassign" />
                    <span class="label-text">{m.users_delete_action_reassign()}</span>
                  </label>
                  <label class="label cursor-pointer justify-start gap-3">
                    <input type="radio" name="contentAction" class="radio radio-primary" 
                           bind:group={contentAction} value="anonymous" />
                    <span class="label-text">{m.users_delete_action_anonymous()}</span>
                  </label>
                </div>
              </div>

              <!-- User selection for reassignment -->
              {#if contentAction === 'reassign'}
                <div class="form-control mb-4">
                  <label class="label" for="reassign-user-select">
                    <span class="label-text">{m.users_delete_reassign_to()}</span>
                  </label>
                  <select id="reassign-user-select" class="select select-bordered" bind:value={selectedReassignUser}>
                    <option value="">{m.users_delete_select_user()}</option>
                    {#each linkedContent.reassignmentOptions || [] as option}
                      <option value={option.id}>{option.name} ({option.email})</option>
                    {/each}
                  </select>
                </div>
              {/if}
            {:else}
              <!-- Simple delete confirmation -->
              <p class="text-base-content/70 mb-4">
                {m.users_modal_delete_confirm()}
              </p>
            {/if}
          {:else}
            <!-- No data yet -->
            <p class="text-base-content/70 mb-4">
              {m.users_modal_delete_confirm()}
            </p>
          {/if}
        </div>
      {/if}

      <div class="modal-action">
        <button 
          type="button" 
          class="btn btn-ghost" 
          onclick={handleClose}
          disabled={isLoading}
        >
          {m.users_modal_delete_cancel()}
        </button>
        <button 
          type="button" 
          class="btn btn-error"
          onclick={handleDelete}
          disabled={isLoading || isLoadingContent || (contentAction === 'reassign' && !selectedReassignUser)}
        >
          {#if isLoading}
            <span class="loading loading-spinner loading-sm"></span>
            {m.users_modal_delete_deleting()}
          {:else}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            {m.users_modal_delete_button()}
          {/if}
        </button>
      </div>
    </div>
    <div class="modal-backdrop" onclick={handleClose} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && handleClose()}></div>
  </div>
{/if}
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

  // Simple state - no async for now
  let contentAction = $state('delete_all');
  let selectedTransferUser = $state('');
  
  // Mock data for now - will be replaced with real data later
  let contentCounts = {
    posts: 1,
    media: 0,
    pages: 0,
    comments: 0
  };
  
  // Mock users for transfer dropdown
  let availableUsers = [
    { id: '1', name: 'Cesar Falcao', email: 'csfalcao@gmail.com' },
    { id: '2', name: 'Admin User', email: 'admin@example.com' },
    { id: '3', name: 'Pedro Falcao', email: 'pedro.amon.@gmail.com' }
  ];

  // Watch for action changes using $derived
  let showTransferSelect = $derived(contentAction === 'transfer');

  function handleClose() {
    isOpen = false;
    contentAction = 'delete_all';
    selectedTransferUser = '';
  }

  function handleDelete() {
    console.log('Delete user with action:', contentAction);
    if (contentAction === 'transfer') {
      console.log('Transfer to user:', selectedTransferUser);
    }
    // For now just close the modal
    handleClose();
  }

  function handleViewDetails() {
    console.log('View details clicked');
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
</script>

{#if isOpen && user}
  <div class="modal modal-open">
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

      <!-- Linked Content Table -->
      <div class="mb-6">
        <h4 class="text-sm font-medium text-base-content/70 mb-3">Linked Content:</h4>
        <div class="overflow-x-auto">
          <table class="table table-compact w-full">
            <thead>
              <tr class="border-base-300">
                <th class="text-center">Posts</th>
                <th class="text-center">Media Files</th>
                <th class="text-center">Pages</th>
                <th class="text-center">Comments</th>
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
      </div>

      <!-- Action Selection -->
      {#if contentCounts.posts > 0 || contentCounts.media > 0 || contentCounts.pages > 0 || contentCounts.comments > 0}
        <div class="form-control mb-6">
          <label class="label">
            <span class="label-text font-medium">Content Action:</span>
          </label>
          <select class="select select-bordered w-full" bind:value={contentAction}>
            <option value="delete_all">Delete all content</option>
            <option value="transfer">Transfer content to another user</option>
            <option value="anonymous">Make content anonymous</option>
          </select>
        </div>

        <!-- Transfer User Selection (shown when transfer is selected) -->
        {#if showTransferSelect}
          <div class="form-control mb-6">
            <label class="label">
              <span class="label-text">Transfer to:</span>
            </label>
            <select class="select select-bordered w-full" bind:value={selectedTransferUser}>
              <option value="">Select a user...</option>
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
          <span>This user has no linked content.</span>
        </div>
      {/if}

      <!-- Confirmation Message -->
      <p class="text-sm text-base-content/70 mb-6">
        {#if contentCounts.posts > 0 || contentCounts.media > 0 || contentCounts.pages > 0 || contentCounts.comments > 0}
          Warning: This action cannot be undone. The user account will be permanently deleted.
        {:else}
          Are you sure you want to delete this user? This action cannot be undone.
        {/if}
      </p>

      <!-- Action Buttons -->
      <div class="modal-action justify-between">
        <button 
          type="button" 
          class="btn btn-sm btn-ghost"
          onclick={handleViewDetails}
        >
          View Details
        </button>
        <div class="flex gap-2">
          <button 
            type="button" 
            class="btn btn-ghost" 
            onclick={handleClose}
          >
            Cancel
          </button>
          <button 
            type="button" 
            class="btn btn-error"
            onclick={handleDelete}
            disabled={showTransferSelect && !selectedTransferUser}
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
    <div class="modal-backdrop" onclick={handleClose} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && handleClose()}></div>
  </div>
{/if}
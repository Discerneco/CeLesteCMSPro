<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import { createEventDispatcher } from 'svelte';

  export let isOpen = $state(false);
  export let user: any = null;

  const dispatch = createEventDispatcher();

  let isLoading = $state(false);
  let error = $state('');

  // Reset error when modal opens/closes
  $effect(() => {
    if (isOpen) {
      error = '';
    }
  });

  async function handleDelete() {
    if (!user) return;

    isLoading = true;
    error = '';

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!response.ok) {
        error = result.error || m.users_error_delete_failed();
        return;
      }

      dispatch('userDeleted', user);
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
</script>

{#if isOpen}
  <div class="modal modal-open">
    <div class="modal-box">
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
          <p class="text-base-content/70 mb-4">
            {m.users_modal_delete_confirm()}
          </p>
          
          <div class="card bg-base-200 border border-base-300">
            <div class="card-body p-4">
              <div class="flex items-center gap-3">
                <div class="avatar placeholder">
                  <div class="bg-neutral text-neutral-content rounded-full w-12 h-12">
                    <span class="text-sm font-medium">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                </div>
                <div>
                  <div class="font-medium text-base-content">{user.name}</div>
                  <div class="text-sm text-base-content/60">{user.email}</div>
                  <div class="text-xs text-base-content/50">@{user.username} • {formatRole(user.role)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <div class="modal-action">
        <button 
          type="button" 
          class="btn btn-ghost" 
          onclick={handleClose}
          disabled={isLoading}
        >
          {m.users_form_cancel()}
        </button>
        <button 
          type="button" 
          class="btn btn-error"
          onclick={handleDelete}
          disabled={isLoading}
        >
          {#if isLoading}
            <span class="loading loading-spinner loading-sm"></span>
            {m.users_form_deleting()}
          {:else}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            {m.users_form_delete()}
          {/if}
        </button>
      </div>
    </div>
    <div class="modal-backdrop" onclick={handleClose}></div>
  </div>
{/if}

<script>
  // Format role for display
  function formatRole(role) {
    switch (role) {
      case 'admin': return m.users_role_admin();
      case 'editor': return m.users_role_editor();
      case 'author': return m.users_role_author();
      case 'subscriber': return m.users_role_subscriber();
      default: return role;
    }
  }
</script>
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import * as m from '$lib/paraglide/messages';
  import type { PageData } from './$types';
  import UserModal from '$lib/components/users/UserModal.svelte';
  import DeleteUserModal from '$lib/components/users/DeleteUserModal.svelte';

  export let data: PageData;

  let searchQuery = $state(data.searchQuery || '');
  let debounceTimeout: ReturnType<typeof setTimeout>;

  // Modal states
  let userModal = $state({
    isOpen: false,
    mode: 'add' as 'add' | 'edit',
    user: null as any
  });
  
  let deleteModal = $state({
    isOpen: false,
    user: null as any
  });

  // Toast notifications
  let toast = $state({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  });

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    toast = { show: true, message, type };
    setTimeout(() => {
      toast.show = false;
    }, 3000);
  }

  // Modal handlers
  function openAddModal() {
    userModal = { isOpen: true, mode: 'add', user: null };
  }

  function openEditModal(user: any) {
    userModal = { isOpen: true, mode: 'edit', user };
  }

  function openDeleteModal(user: any) {
    deleteModal = { isOpen: true, user };
  }

  function handleUserCreated(event: any) {
    showToast(m.users_success_created());
    // Refresh page to show new user
    window.location.reload();
  }

  function handleUserUpdated(event: any) {
    showToast(m.users_success_updated());
    // Refresh page to show updated user
    window.location.reload();
  }

  function handleUserDeleted(event: any) {
    showToast(m.users_success_deleted());
    // Refresh page to remove deleted user
    window.location.reload();
  }

  // Handle search with debouncing
  function handleSearch() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      const url = new URL($page.url);
      if (searchQuery.trim()) {
        url.searchParams.set('search', searchQuery.trim());
      } else {
        url.searchParams.delete('search');
      }
      url.searchParams.set('page', '1'); // Reset to first page on search
      goto(url.toString(), { replaceState: true });
    }, 300);
  }

  // Handle pagination
  function goToPage(pageNumber: number) {
    const url = new URL($page.url);
    url.searchParams.set('page', pageNumber.toString());
    goto(url.toString());
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

  // Format status for display
  function formatStatus(status: string) {
    switch (status) {
      case 'active': return m.users_status_active();
      case 'pending': return m.users_status_pending();
      case 'inactive': return m.users_status_inactive();
      default: return status;
    }
  }

  // Get status badge class
  function getStatusBadgeClass(status: string) {
    switch (status) {
      case 'active': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'inactive': return 'badge-error';
      default: return 'badge-neutral';
    }
  }

  // Get role badge class
  function getRoleBadgeClass(role: string) {
    switch (role) {
      case 'admin': return 'badge-primary';
      case 'editor': return 'badge-secondary';
      case 'author': return 'badge-accent';
      case 'subscriber': return 'badge-outline';
      default: return 'badge-neutral';
    }
  }
</script>

<div class="container mx-auto p-6">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-base-content">{m.users_title()}</h1>
    <p class="text-base-content/70 mt-2">{m.users_subtitle()}</p>
  </div>

  <!-- Actions Bar -->
  <div class="flex flex-col sm:flex-row gap-4 mb-6">
    <div class="flex-1">
      <div class="relative">
        <input 
          type="text" 
          placeholder={m.users_search_placeholder()}
          class="input input-bordered w-full pl-10"
          bind:value={searchQuery}
          oninput={handleSearch}
        />
        <svg class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
    </div>
    
    <div class="flex gap-2">
      <button class="btn btn-outline">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"></path>
        </svg>
        {m.users_filter()}
      </button>
      
      <button class="btn btn-primary" onclick={openAddModal}>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        {m.users_add_user()}
      </button>
    </div>
  </div>

  <!-- Users Table -->
  <div class="card bg-base-100 border border-base-300">
    <div class="card-body p-0">
      {#if data.users.length > 0}
        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr class="border-base-300">
                <th class="font-semibold text-base-content/70">{m.users_table_name()}</th>
                <th class="font-semibold text-base-content/70">{m.users_table_email()}</th>
                <th class="font-semibold text-base-content/70">{m.users_table_role()}</th>
                <th class="font-semibold text-base-content/70">{m.users_table_status()}</th>
                <th class="font-semibold text-base-content/70">{m.users_table_last_login()}</th>
                <th class="font-semibold text-base-content/70">{m.users_table_created()}</th>
                <th class="font-semibold text-base-content/70">{m.users_table_actions()}</th>
              </tr>
            </thead>
            <tbody>
              {#each data.users as user (user.id)}
                <tr class="hover:bg-base-200/50">
                  <td>
                    <div class="flex items-center gap-3">
                      <div class="avatar placeholder">
                        <div class="bg-neutral text-neutral-content rounded-full w-10 h-10">
                          <span class="text-sm font-medium">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div class="font-medium text-base-content">{user.name}</div>
                        <div class="text-sm text-base-content/60">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="text-base-content">{user.email}</div>
                    {#if !user.verifiedEmail}
                      <div class="text-xs text-warning">Unverified</div>
                    {/if}
                  </td>
                  <td>
                    <span class="badge {getRoleBadgeClass(user.role)} badge-sm">
                      {formatRole(user.role)}
                    </span>
                  </td>
                  <td>
                    <span class="badge {getStatusBadgeClass(user.status)} badge-sm">
                      {formatStatus(user.status)}
                    </span>
                  </td>
                  <td>
                    <span class="text-base-content/70">
                      {user.lastLoginFormatted || m.users_never_logged_in()}
                    </span>
                  </td>
                  <td>
                    <span class="text-base-content/70">
                      {user.createdAtFormatted}
                    </span>
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <button 
                        class="btn btn-ghost btn-xs" 
                        title={m.users_action_edit()}
                        onclick={() => openEditModal(user)}
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      
                      {#if user.status === 'pending'}
                        <button 
                          class="btn btn-ghost btn-xs text-info" 
                          title={m.users_action_send_invite()}
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                        </button>
                      {/if}
                      
                      {#if user.role !== 'admin'}
                        <button 
                          class="btn btn-ghost btn-xs text-error" 
                          title={m.users_action_delete()}
                          onclick={() => openDeleteModal(user)}
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      {/if}
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        {#if data.pagination.totalPages > 1}
          <div class="flex items-center justify-between p-4 border-t border-base-300">
            <div class="text-sm text-base-content/70">
              {m.users_showing({ count: data.users.length })} · 
              {m.users_page_info({ current: data.pagination.page, total: data.pagination.totalPages })}
            </div>
            
            <div class="join">
              <button 
                class="join-item btn btn-sm"
                class:btn-disabled={!data.pagination.hasPrevious}
                onclick={() => goToPage(data.pagination.page - 1)}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              
              {#each Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                const startPage = Math.max(1, data.pagination.page - 2);
                return startPage + i;
              }).filter(p => p <= data.pagination.totalPages) as pageNum}
                <button 
                  class="join-item btn btn-sm"
                  class:btn-active={pageNum === data.pagination.page}
                  onclick={() => goToPage(pageNum)}
                >
                  {pageNum}
                </button>
              {/each}
              
              <button 
                class="join-item btn btn-sm"
                class:btn-disabled={!data.pagination.hasNext}
                onclick={() => goToPage(data.pagination.page + 1)}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        {/if}

      {:else}
        <!-- Empty State -->
        <div class="flex flex-col items-center justify-center py-12">
          <svg class="w-16 h-16 text-base-content/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <h3 class="text-lg font-medium text-base-content/70 mb-2">
            {m.users_no_users()}
          </h3>
          <p class="text-base-content/50 text-center mb-4">
            {searchQuery ? 'Try adjusting your search criteria' : 'Start by adding your first user to the system'}
          </p>
          {#if !searchQuery}
            <button class="btn btn-primary" onclick={openAddModal}>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              {m.users_add_user()}
            </button>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Modals -->
<UserModal 
  bind:isOpen={userModal.isOpen}
  mode={userModal.mode}
  user={userModal.user}
  on:userCreated={handleUserCreated}
  on:userUpdated={handleUserUpdated}
/>

<DeleteUserModal 
  bind:isOpen={deleteModal.isOpen}
  user={deleteModal.user}
  on:userDeleted={handleUserDeleted}
/>

<!-- Toast Notification -->
{#if toast.show}
  <div class="toast toast-top toast-end">
    <div class="alert {toast.type === 'success' ? 'alert-success' : 'alert-error'}">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {#if toast.type === 'success'}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        {:else}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        {/if}
      </svg>
      <span>{toast.message}</span>
    </div>
  </div>
{/if}
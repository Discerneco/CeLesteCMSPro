<script lang="ts">
  import { Users, Shield, Search, Filter } from '@lucide/svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import * as m from '$lib/paraglide/messages';
  import type { PageData } from './$types';
  import UserModal from '$lib/components/users/UserModal.svelte';
  import DeleteUserModal from '$lib/components/users/DeleteUserModal.svelte';

  let { data }: { data: PageData } = $props();

  let searchQuery = $state(data.searchQuery || '');
  let debounceTimeout: ReturnType<typeof setTimeout>;
  let activeTab = $state('users');

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

  function handleUserCreated(user: any) {
    showToast(m.users_success_created());
    // Refresh page to show new user
    window.location.reload();
  }

  function handleUserUpdated(user: any) {
    showToast(m.users_success_updated());
    // Refresh page to show updated user
    window.location.reload();
  }

  function handleUserDeleted(user: any) {
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
      case 'subscriber': return 'badge-neutral';
      default: return 'badge-neutral';
    }
  }
</script>

<!-- Page Header -->
<div class="cms-page-header">
  <div>
    <h1 class="cms-page-title">{m.users_title()}</h1>
    <p class="cms-page-subtitle">{m.users_subtitle()}</p>
  </div>
    <button class="btn btn-primary" onclick={openAddModal}>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
      </svg>
      {m.users_add_user()}
    </button>
  </div>

  <!-- Tabs -->
  <div class="flex border-b border-base-200 mb-6">
    <button 
      class="flex items-center gap-2 px-4 py-2 border-b-[3px] transition-colors duration-150 {activeTab === 'users' ? 'border-primary text-base-content' : 'border-transparent text-base-content/60 hover:text-base-content/80'}"
      onclick={() => activeTab = 'users'}
    >
      <Users class="h-4 w-4" />
      {m.users_title()}
    </button>
    <button 
      class="flex items-center gap-2 px-4 py-2 border-b-[3px] transition-colors duration-150 {activeTab === 'roles' ? 'border-primary text-base-content' : 'border-transparent text-base-content/60 hover:text-base-content/80'}"
      onclick={() => activeTab = 'roles'}
    >
      <Shield class="h-4 w-4" />
      {m.users_roles_title()}
    </button>
  </div>

  <!-- Users Tab Content -->
  {#if activeTab === 'users'}
  <!-- Users Table -->
  <div class="cms-table-container">
    <!-- Search and Filter Bar -->
    <div class="px-6 py-4 border-b border-base-200">
      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <!-- Search -->
        <div class="cms-search-container">
          <Search class="cms-search-icon" />
          <input
            type="text"
            placeholder={m.users_search_placeholder()}
            class="cms-search-input"
            bind:value={searchQuery}
            oninput={handleSearch}
          />
        </div>
        
        <!-- Filter -->
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="cms-btn-utility">
            <Filter class="h-4 w-4" />
            {m.users_filter()}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Table Header -->
    <div class="cms-table-header">
      <div class="hidden md:grid items-center gap-2 cms-table-header-text" style="grid-template-columns: minmax(220px, 2fr) minmax(180px, 1.5fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(100px, 1fr);">
        <div>{m.users_table_name()}</div>
        <div>{m.users_table_email()}</div>
        <div class="text-center">{m.users_table_role()}</div>
        <div class="text-center">{m.users_table_status()}</div>
        <div class="text-center">{m.users_table_last_login()}</div>
        <div class="text-center">{m.users_table_created()}</div>
        <div class="flex justify-end">
          <div class="flex items-center gap-1">
            <div class="w-8 h-4"></div> <!-- Spacer for first icon -->
            <div class="w-8 h-4 flex justify-center text-xs font-medium">{m.users_table_actions()}</div> <!-- Text above middle icon -->
            <div class="w-8 h-4"></div> <!-- Spacer for third icon -->
          </div>
        </div>
      </div>
    </div>
    
    <!-- Table Body - Desktop -->
    <div class="hidden md:block divide-y divide-base-content/10">
      {#if data.users.length > 0}
        {#each data.users as user (user.id)}
          <div class="cms-table-row">
            <div class="grid items-center gap-2" style="grid-template-columns: minmax(220px, 2fr) minmax(180px, 1.5fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(100px, 1fr);">
              <!-- Name -->
              <div>
                <div class="flex items-center gap-3">
                  <div class="avatar placeholder">
                    <div class="bg-neutral text-neutral-content rounded-full w-10 h-10">
                      <span class="text-sm font-medium">
                        {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                  </div>
                  <div class="min-w-0">
                    <div class="font-medium text-base-content">{user.name}</div>
                    <div class="text-sm text-base-content/60">@{user.username}</div>
                  </div>
                </div>
              </div>
              
              <!-- Email -->
              <div>
                <div class="text-base-content">{user.email}</div>
                {#if !user.verifiedEmail}
                  <div class="text-xs text-warning">Unverified</div>
                {/if}
              </div>
              
              <!-- Role -->
              <div class="text-center">
                <span class="badge badge-soft {getRoleBadgeClass(user.role)} badge-sm">
                  {formatRole(user.role)}
                </span>
              </div>
              
              <!-- Status -->
              <div class="text-center">
                <span class="badge badge-soft {getStatusBadgeClass(user.status)} badge-sm">
                  {formatStatus(user.status)}
                </span>
              </div>
              
              <!-- Last Login -->
              <div class="text-center">
                <span class="text-base-content/70">
                  {user.lastLoginFormatted || m.users_never_logged_in()}
                </span>
              </div>
              
              <!-- Created -->
              <div class="text-center">
                <span class="text-base-content/70">
                  {user.createdAtFormatted}
                </span>
              </div>
              
              <!-- Actions -->
              <div>
                <div class="flex items-center gap-1 justify-end">
                  <button 
                    class="btn btn-ghost btn-xs" 
                    title={m.users_action_edit()}
                    aria-label={m.users_action_edit()}
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
                      aria-label={m.users_action_send_invite()}
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
                      aria-label={m.users_action_delete()}
                      onclick={() => openDeleteModal(user)}
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {/each}
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

    {#if data.users.length > 0}
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
              aria-label="Previous page"
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
              aria-label="Next page"
              onclick={() => goToPage(data.pagination.page + 1)}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      {/if}
    {/if}
  </div>
  {/if}

  <!-- Roles & Permissions Tab Content -->
  {#if activeTab === 'roles'}
    <div class="space-y-6">
      <!-- Role Management Section -->
      <div class="card bg-base-100 border border-base-300">
        <div class="card-header border-b border-base-300 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-base-content">User Roles</h2>
              <p class="text-sm text-base-content/60 mt-1">Manage user roles and their permissions</p>
            </div>
            <button class="btn btn-primary btn-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Role
            </button>
          </div>
        </div>
        <div class="card-body p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Administrator Role -->
            <div class="card bg-primary/10 border border-primary/20">
              <div class="card-body p-4">
                <div class="flex items-start justify-between mb-3">
                  <div class="p-2 bg-primary/20 rounded-lg">
                    <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                  </div>
                  <div class="dropdown dropdown-end">
                    <button class="btn btn-ghost btn-xs" aria-label="Administrator role options">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                      </svg>
                    </button>
                    <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li><a href="javascript:void(0)" role="menuitem">Edit Role</a></li>
                      <li><a href="javascript:void(0)" role="menuitem">View Permissions</a></li>
                    </ul>
                  </div>
                </div>
                <h3 class="font-semibold text-base-content mb-1">{m.users_role_admin()}</h3>
                <p class="text-sm text-base-content/60 mb-3">Full system access and control</p>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-base-content/70">Users</span>
                  <span class="badge badge-primary badge-sm">1</span>
                </div>
              </div>
            </div>

            <!-- Editor Role -->
            <div class="card bg-secondary/10 border border-secondary/20">
              <div class="card-body p-4">
                <div class="flex items-start justify-between mb-3">
                  <div class="p-2 bg-secondary/20 rounded-lg">
                    <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </div>
                  <div class="dropdown dropdown-end">
                    <button class="btn btn-ghost btn-xs" aria-label="Editor role options">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                      </svg>
                    </button>
                    <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li><a href="javascript:void(0)" role="menuitem">Edit Role</a></li>
                      <li><a href="javascript:void(0)" role="menuitem">View Permissions</a></li>
                    </ul>
                  </div>
                </div>
                <h3 class="font-semibold text-base-content mb-1">{m.users_role_editor()}</h3>
                <p class="text-sm text-base-content/60 mb-3">Edit and manage content</p>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-base-content/70">Users</span>
                  <span class="badge badge-secondary badge-sm">0</span>
                </div>
              </div>
            </div>

            <!-- Author Role -->
            <div class="card bg-accent/10 border border-accent/20">
              <div class="card-body p-4">
                <div class="flex items-start justify-between mb-3">
                  <div class="p-2 bg-accent/20 rounded-lg">
                    <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                  </div>
                  <div class="dropdown dropdown-end">
                    <button class="btn btn-ghost btn-xs" aria-label="Author role options">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                      </svg>
                    </button>
                    <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li><a href="javascript:void(0)" role="menuitem">Edit Role</a></li>
                      <li><a href="javascript:void(0)" role="menuitem">View Permissions</a></li>
                    </ul>
                  </div>
                </div>
                <h3 class="font-semibold text-base-content mb-1">{m.users_role_author()}</h3>
                <p class="text-sm text-base-content/60 mb-3">Create and edit own content</p>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-base-content/70">Users</span>
                  <span class="badge badge-accent badge-sm">0</span>
                </div>
              </div>
            </div>

            <!-- Subscriber Role -->
            <div class="card bg-base-200 border border-base-300">
              <div class="card-body p-4">
                <div class="flex items-start justify-between mb-3">
                  <div class="p-2 bg-base-300 rounded-lg">
                    <svg class="w-5 h-5 text-base-content/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <div class="dropdown dropdown-end">
                    <button class="btn btn-ghost btn-xs" aria-label="Subscriber role options">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                      </svg>
                    </button>
                    <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li><a href="javascript:void(0)" role="menuitem">Edit Role</a></li>
                      <li><a href="javascript:void(0)" role="menuitem">View Permissions</a></li>
                    </ul>
                  </div>
                </div>
                <h3 class="font-semibold text-base-content mb-1">{m.users_role_subscriber()}</h3>
                <p class="text-sm text-base-content/60 mb-3">View content only</p>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-base-content/70">Users</span>
                  <span class="badge badge-outline badge-sm">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Permissions Matrix -->
      <div class="card bg-base-100 border border-base-300">
        <div class="card-header border-b border-base-300 px-6 py-4">
          <div>
            <h2 class="text-lg font-semibold text-base-content">Permissions Matrix</h2>
            <p class="text-sm text-base-content/60 mt-1">Overview of permissions for each role</p>
          </div>
        </div>
        <div class="card-body p-6">
          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th class="font-semibold text-base-content/70">Permission</th>
                  <th class="text-center font-semibold text-base-content/70">{m.users_role_admin()}</th>
                  <th class="text-center font-semibold text-base-content/70">{m.users_role_editor()}</th>
                  <th class="text-center font-semibold text-base-content/70">{m.users_role_author()}</th>
                  <th class="text-center font-semibold text-base-content/70">{m.users_role_subscriber()}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="font-medium">Manage Users</td>
                  <td class="text-center">
                    <svg class="w-5 h-5 text-success mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </td>
                  <td class="text-center">
                    <svg class="w-5 h-5 text-error mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </td>
                  <td class="text-center">
                    <svg class="w-5 h-5 text-error mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </td>
                  <td class="text-center">
                    <svg class="w-5 h-5 text-error mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td class="font-medium">Create Posts</td>
                  <td class="text-center">
                    <svg class="w-5 h-5 text-success mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </td>
                  <td class="text-center">
                    <svg class="w-5 h-5 text-success mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </td>
                  <td class="text-center">
                    <svg class="w-5 h-5 text-success mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </td>
                  <td class="text-center">
                    <svg class="w-5 h-5 text-error mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td class="font-medium">Edit All Posts</td>
                  <td class="text-center">
                    <svg class="w-5 h-5 text-success mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </td>
                  <td class="text-center">
                    <svg class="w-5 h-5 text-success mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </td>
                  <td class="text-center">
                    <svg class="w-5 h-5 text-warning mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                    <div class="text-xs text-base-content/60 mt-1">Own only</div>
                  </td>
                  <td class="text-center">
                    <svg class="w-5 h-5 text-error mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td class="font-medium">Publish Posts</td>
                  <td class="text-center">
                    <svg class="w-5 h-5 text-success mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </td>
                  <td class="text-center">
                    <svg class="w-5 h-5 text-success mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </td>
                  <td class="text-center">
                    <svg class="w-5 h-5 text-error mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </td>
                  <td class="text-center">
                    <svg class="w-5 h-5 text-error mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td class="font-medium">Manage Media</td>
                  <td class="text-center">
                    <svg class="w-5 h-5 text-success mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </td>
                  <td class="text-center">
                    <svg class="w-5 h-5 text-success mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </td>
                  <td class="text-center">
                    <svg class="w-5 h-5 text-success mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </td>
                  <td class="text-center">
                    <svg class="w-5 h-5 text-error mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td class="font-medium">System Settings</td>
                  <td class="text-center">
                    <svg class="w-5 h-5 text-success mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </td>
                  <td class="text-center">
                    <svg class="w-5 h-5 text-error mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </td>
                  <td class="text-center">
                    <svg class="w-5 h-5 text-error mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </td>
                  <td class="text-center">
                    <svg class="w-5 h-5 text-error mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  {/if}

<!-- Modals -->
<UserModal 
  bind:isOpen={userModal.isOpen}
  mode={userModal.mode}
  user={userModal.user}
  onUserCreated={handleUserCreated}
  onUserUpdated={handleUserUpdated}
/>

<DeleteUserModal 
  bind:isOpen={deleteModal.isOpen}
  user={deleteModal.user}
  onUserDeleted={handleUserDeleted}
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
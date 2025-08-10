<script lang="ts">
  import { X, Edit, Trash2, Shield, Mail, User, Calendar, Clock, CheckCircle, XCircle } from '@lucide/svelte';
  import * as m from '$lib/paraglide/messages';

  let { 
    isOpen = $bindable(false),
    user = null,
    onEdit,
    onDelete 
  }: {
    isOpen?: boolean;
    user?: any;
    onEdit?: (user: any) => void;
    onDelete?: (user: any) => void;
  } = $props();

  function handleClose() {
    isOpen = false;
  }

  function handleEdit() {
    if (onEdit && user) {
      onEdit(user);
    }
  }

  function handleDelete() {
    if (onDelete && user) {
      onDelete(user);
    }
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

  // Get role icon
  function getRoleIcon(role: string) {
    switch (role) {
      case 'admin': return Shield;
      case 'editor': return Edit;
      case 'author': return User;
      case 'subscriber': return User;
      default: return User;
    }
  }
</script>

{#if isOpen && user}
  <div class="modal modal-open">
    <div class="modal-box max-w-2xl">
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-bold text-lg">{m.users_details_title()}</h3>
        <button 
          class="btn btn-sm btn-circle btn-ghost"
          onclick={handleClose}
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <div class="space-y-6">
        <!-- User Avatar and Basic Info -->
        <div class="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
          <div class="avatar placeholder">
            <div class="bg-neutral text-neutral-content rounded-full w-16 h-16">
              <span class="text-xl font-medium">
                {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
          </div>
          <div class="flex-1">
            <h4 class="text-xl font-semibold">{user.name}</h4>
            <p class="text-base-content/60">@{user.username}</p>
            <div class="flex gap-2 mt-2">
              {#if user.role}
                {@const RoleIcon = getRoleIcon(user.role)}
                <span class="badge badge-soft {getRoleBadgeClass(user.role)} badge-sm">
                  <RoleIcon class="h-3 w-3 mr-1" />
                  {formatRole(user.role)}
                </span>
              {/if}
              <span class="badge badge-soft {getStatusBadgeClass(user.status)} badge-sm">
                {formatStatus(user.status)}
              </span>
            </div>
          </div>
        </div>

        <!-- User Details Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Contact Information -->
          <div class="space-y-4">
            <h5 class="font-semibold text-base-content/80 flex items-center gap-2">
              <Mail class="h-4 w-4" />
              {m.users_details_contact()}
            </h5>
            
            <div class="space-y-3 pl-6">
              <div>
                <div class="text-sm text-base-content/60">{m.users_table_email()}</div>
                <div class="font-medium flex items-center gap-2">
                  {user.email}
                  {#if user.verifiedEmail}
                    <CheckCircle class="h-4 w-4 text-success" title="Verified" />
                  {:else}
                    <XCircle class="h-4 w-4 text-warning" title="Unverified" />
                  {/if}
                </div>
              </div>

              {#if user.firstName || user.lastName}
                <div>
                  <div class="text-sm text-base-content/60">{m.users_details_full_name()}</div>
                  <div class="font-medium">
                    {[user.firstName, user.lastName].filter(Boolean).join(' ') || '-'}
                  </div>
                </div>
              {/if}
            </div>
          </div>

          <!-- Account Information -->
          <div class="space-y-4">
            <h5 class="font-semibold text-base-content/80 flex items-center gap-2">
              <User class="h-4 w-4" />
              {m.users_details_account()}
            </h5>
            
            <div class="space-y-3 pl-6">
              <div>
                <div class="text-sm text-base-content/60">{m.users_table_role()}</div>
                <div class="font-medium">{formatRole(user.role)}</div>
              </div>

              <div>
                <div class="text-sm text-base-content/60">{m.users_table_status()}</div>
                <div class="font-medium">{formatStatus(user.status)}</div>
              </div>

              <div>
                <div class="text-sm text-base-content/60">{m.users_details_account_type()}</div>
                <div class="font-medium">
                  {user.verifiedEmail ? m.users_details_verified_account() : m.users_details_unverified_account()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity Information -->
        <div class="space-y-4">
          <h5 class="font-semibold text-base-content/80 flex items-center gap-2">
            <Clock class="h-4 w-4" />
            {m.users_details_activity()}
          </h5>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
            <div>
              <div class="text-sm text-base-content/60">{m.users_table_created()}</div>
              <div class="font-medium flex items-center gap-2">
                <Calendar class="h-4 w-4 text-base-content/40" />
                {user.createdAtFormatted}
              </div>
            </div>

            <div>
              <div class="text-sm text-base-content/60">{m.users_table_last_login()}</div>
              <div class="font-medium flex items-center gap-2">
                <Clock class="h-4 w-4 text-base-content/40" />
                {user.lastLoginFormatted || m.users_never_logged_in()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="modal-action">
        <button class="btn btn-ghost" onclick={handleClose}>
          {m.users_details_close()}
        </button>
        
        <div class="flex gap-2">
          <button class="btn btn-primary gap-2" onclick={handleEdit}>
            <Edit class="h-4 w-4" />
            {m.users_action_edit()}
          </button>
          
          {#if user.id}
            <button class="btn btn-error gap-2" onclick={handleDelete}>
              <Trash2 class="h-4 w-4" />
              {m.users_action_delete()}
            </button>
          {/if}
        </div>
      </div>
    </div>
    <button 
      class="modal-backdrop" 
      onclick={handleClose} 
      onkeydown={(e) => e.key === 'Enter' || e.key === ' ' ? handleClose() : null} 
      aria-label="Close user details"
    ></button>
  </div>
{/if}
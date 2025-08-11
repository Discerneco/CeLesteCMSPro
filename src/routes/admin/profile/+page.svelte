<script lang="ts">
  import { 
    User,
    Edit,
    Mail,
    Shield,
    Calendar,
    Clock,
    CheckCircle,
    XCircle
  } from '@lucide/svelte';
  import { invalidateAll } from '$app/navigation';
  import UserModal from '$lib/components/users/UserModal.svelte';
  
  // Import i18n with modern Paraglide pattern
  import * as m from '$lib/paraglide/messages';
  
  // Get data from load function (Svelte 5 runes mode)
  let { data } = $props();
  
  // Svelte 5 runes for state management
  let showEditModal = $state(false);
  let showToast = $state(false);
  let toastMessage = $state('');
  
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

  // Modal functions
  function openEditModal() {
    showEditModal = true;
  }

  async function handleUserUpdated(updatedUser: any) {
    console.log('Profile updated:', updatedUser);
    showToast = true;
    toastMessage = 'Profile updated successfully!';
    
    // Refresh the page data to get updated user info
    await invalidateAll();
    
    setTimeout(() => {
      showToast = false;
    }, 3000);
  }

  // Toast notification functions
  const showSuccessToast = (message: string) => {
    toastMessage = message;
    showToast = true;
    setTimeout(() => {
      showToast = false;
    }, 3000);
  };
</script>

<!-- Page Header -->
<div class="cms-page-header">
  <div>
    <h1 class="cms-page-title">My Profile</h1>
    <p class="cms-page-subtitle">Manage your account settings and information</p>
  </div>
  <button 
    onclick={openEditModal}
    class="btn btn-primary gap-2"
  >
    <Edit class="h-4 w-4" />
    Edit Profile
  </button>
</div>

<!-- Profile Content -->
<div class="cms-card">
  <div class="cms-card-body">
    <div class="space-y-8">
      <!-- User Avatar and Basic Info -->
      <div class="flex items-center gap-6 p-6 bg-base-200 rounded-lg">
        <div class="{getAvatarColor(data.user.id)} rounded-full w-16 h-16 grid place-content-center text-xl">
          {data.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div class="flex-1">
          <h2 class="text-2xl font-semibold">{data.user.name}</h2>
          <p class="text-base-content/60 text-lg">@{data.user.username}</p>
          <div class="flex gap-3 mt-3">
            {#if data.user.role}
              {@const RoleIcon = getRoleIcon(data.user.role)}
              <span class="badge badge-soft {getRoleBadgeClass(data.user.role)} badge-lg">
                <RoleIcon class="h-4 w-4 mr-2" />
                {formatRole(data.user.role)}
              </span>
            {/if}
            <span class="badge badge-soft {data.user.active ? 'badge-success' : 'badge-error'} badge-lg">
              {data.user.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      <!-- Profile Details Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Personal Information -->
        <div class="space-y-6">
          <h3 class="font-semibold text-lg text-base-content/80 flex items-center gap-2">
            <User class="h-5 w-5" />
            Personal Information
          </h3>
          
          <div class="space-y-4 pl-7">
            <div>
              <div class="text-sm text-base-content/60 font-medium">First Name</div>
              <div class="text-base font-medium mt-1">{data.user.firstName || '-'}</div>
            </div>
            
            <div>
              <div class="text-sm text-base-content/60 font-medium">Last Name</div>
              <div class="text-base font-medium mt-1">{data.user.lastName || '-'}</div>
            </div>
            
            <div>
              <div class="text-sm text-base-content/60 font-medium">Username</div>
              <div class="text-base font-medium mt-1">@{data.user.username}</div>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="space-y-6">
          <h3 class="font-semibold text-lg text-base-content/80 flex items-center gap-2">
            <Mail class="h-5 w-5" />
            Contact Information
          </h3>
          
          <div class="space-y-4 pl-7">
            <div>
              <div class="text-sm text-base-content/60 font-medium">Email Address</div>
              <div class="text-base font-medium mt-1 flex items-center gap-2">
                {data.user.email}
                {#if data.user.verifiedEmail}
                  <CheckCircle class="h-4 w-4 text-success" title="Verified" />
                {:else}
                  <XCircle class="h-4 w-4 text-warning" title="Unverified" />
                {/if}
              </div>
            </div>
            
            <div>
              <div class="text-sm text-base-content/60 font-medium">Email Status</div>
              <div class="text-base font-medium mt-1">
                <span class="badge {data.user.verifiedEmail ? 'badge-success' : 'badge-warning'} badge-sm">
                  {data.user.verifiedEmail ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Activity -->
      <div class="space-y-6">
        <h3 class="font-semibold text-lg text-base-content/80 flex items-center gap-2">
          <Clock class="h-5 w-5" />
          Account Activity
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pl-7">
          <div>
            <div class="text-sm text-base-content/60 font-medium">Member Since</div>
            <div class="text-base font-medium mt-1 flex items-center gap-2">
              <Calendar class="h-4 w-4 text-base-content/40" />
              {data.user.createdAtFormatted}
            </div>
          </div>

          <div>
            <div class="text-sm text-base-content/60 font-medium">Last Login</div>
            <div class="text-base font-medium mt-1 flex items-center gap-2">
              <Clock class="h-4 w-4 text-base-content/40" />
              {data.user.lastLoginFormatted || 'Never'}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Edit Modal -->
<UserModal 
  bind:isOpen={showEditModal}
  mode="edit"
  user={data.user}
  onUserUpdated={handleUserUpdated}
/>

<!-- Toast Notification -->
{#if showToast}
  <div class="toast toast-top toast-end z-50">
    <div class="alert alert-success shadow-lg">
      <span>{toastMessage}</span>
    </div>
  </div>
{/if}
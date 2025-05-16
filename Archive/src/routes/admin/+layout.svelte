<script lang="ts">
  import { auth } from '$lib/stores/auth.svelte';
  import { onMount } from 'svelte';
  
  // Import data from server
  export let data: any;
  
  // Initialize auth store with user data from server
  onMount(() => {
    if (data?.user?.isAuthenticated) {
      // Convert server user data to match our User type
      const userData = data.user.id ? {
        id: data.user.id,
        email: data.user.email || '',  // Provide default for required field
        role: data.user.role || 'user',
        name: data.user.name
      } : null;
      
      auth.setUser(userData);
    }
  });
</script>

<!-- Render child content -->
<div class="admin-layout">
  <slot />
</div>

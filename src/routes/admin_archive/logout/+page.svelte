<script>
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  
  // Log user out on page load
  onMount(() => {
    auth.logout();
  });
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
  <div class="text-center">
    <h1 class="text-2xl font-bold mb-4">Logging out...</h1>
    <p class="text-gray-600 dark:text-gray-400">You will be redirected to the login page shortly.</p>
  </div>
</div>

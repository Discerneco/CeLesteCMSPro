<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  onMount(async () => {
    try {
      // Call the logout API endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Redirect to login page after successful logout
        goto('/admin/login');
      } else {
        console.error('Logout failed');
        goto('/admin/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      goto('/admin/login');
    }
  });
</script>

<div class="logout-page">
  <div class="logout-container">
    <h1>Logging out...</h1>
    <p>Please wait while we log you out.</p>
  </div>
</div>

<style>
  .logout-page {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: var(--background-color, #f5f5f5);
  }
  
  .logout-container {
    text-align: center;
    padding: 2rem;
    border-radius: 0.5rem;
    background-color: var(--card-background, white);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 400px;
  }
  
  h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: var(--text-color, #333);
  }
  
  p {
    color: var(--text-secondary, #666);
  }
</style>

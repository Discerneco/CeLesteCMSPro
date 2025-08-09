<script lang="ts">
  import { Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from '@lucide/svelte';
  import AuthCard from '$lib/components/AuthCard.svelte';
  import { goto } from '$app/navigation';
  
  // Svelte 5 runes for state management
  let email = $state('admin@celeste.cms');
  let password = $state('adminpassword');
  let name = $state('Admin User');
  let showPassword = $state(false);
  let isLoading = $state(false);
  let error = $state('');
  let success = $state('');
  
  // Form validation
  const isValid = $derived(email.includes('@') && password.length >= 8);
  
  // Toggle password visibility
  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }
  
  // Handle form submission
  async function handleSubmit() {
    if (!isValid) return;
    
    isLoading = true;
    error = '';
    success = '';
    
    try {
      const response = await fetch('/api/dev/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      
      const data = await response.json();
      
      if (data.success) {
        success = data.message;
        setTimeout(() => {
          goto('/admin/login');
        }, 2000);
      } else {
        error = data.message;
      }
    } catch (e) {
      error = 'Failed to create admin user. Please try again.';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
  <div class="w-full max-w-md">
    <AuthCard>
      <svelte:fragment slot="header">
        <h1 class="text-2xl font-bold text-center text-gray-900 dark:text-white">CeLeste CMS</h1>
        <p class="mt-2 text-center text-gray-600 dark:text-gray-400">Create Admin User (Dev Only)</p>
      </svelte:fragment>
      
      {#if error}
        <div class="mb-4 p-3 bg-red-50 text-red-800 rounded-md flex items-start gap-2 dark:bg-red-950 dark:text-red-200">
          <AlertCircle class="h-5 w-5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      {/if}
      
      {#if success}
        <div class="mb-4 p-3 bg-green-50 text-green-800 rounded-md flex items-start gap-2 dark:bg-green-950 dark:text-green-200">
          <CheckCircle class="h-5 w-5 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      {/if}
      
      <form onsubmit={handleSubmit}>
        <div class="space-y-4">
          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              id="email"
              type="email"
              bind:value={email}
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              required
            />
          </div>
          
          <!-- Name Field -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              id="name"
              type="text"
              bind:value={name}
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <div class="relative mt-1">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                bind:value={password}
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                required
              />
              <button
                type="button"
                onclick={togglePasswordVisibility}
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {#if showPassword}
                  <EyeOff class="h-5 w-5" />
                {:else}
                  <Eye class="h-5 w-5" />
                {/if}
              </button>
            </div>
          </div>
          
          <!-- Submit Button -->
          <button
            type="submit"
            disabled={!isValid || isLoading}
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-900"
          >
            {#if isLoading}
              <Loader2 class="h-5 w-5 animate-spin mr-2" />
              Creating...
            {:else}
              Create Admin User
            {/if}
          </button>
        </div>
      </form>
      
      <div class="mt-4 text-center">
        <a href="/admin/login" class="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
          Back to Login
        </a>
      </div>
    </AuthCard>
  </div>
</div>

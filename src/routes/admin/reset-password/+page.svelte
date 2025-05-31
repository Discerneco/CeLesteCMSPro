<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  let isLoading = false;
  let password = '';
  let confirmPassword = '';
  let passwordsMatch = true;
  let passwordStrength = '';
  let error = '';
  
  $: token = $page.url.searchParams.get('token');
  $: message = $page.url.searchParams.get('message');
  $: success = $page.url.searchParams.get('success') === 'true';

  // Redirect if no token
  onMount(() => {
    if (!token) {
      goto('/admin/login');
    }
  });

  // Password validation
  $: {
    passwordsMatch = password === confirmPassword;
    passwordStrength = getPasswordStrength(password);
  }

  function getPasswordStrength(pwd: string): string {
    if (pwd.length === 0) return '';
    if (pwd.length < 8) return 'weak';
    if (pwd.length < 12 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return 'medium';
    if (pwd.length >= 12 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) return 'strong';
    return 'medium';
  }

  function getStrengthColor(strength: string): string {
    switch (strength) {
      case 'weak': return 'text-error';
      case 'medium': return 'text-warning';
      case 'strong': return 'text-success';
      default: return '';
    }
  }

  function validateForm(): boolean {
    error = '';
    
    if (!password) {
      error = 'Password is required';
      return false;
    }
    
    if (password.length < 8) {
      error = 'Password must be at least 8 characters long';
      return false;
    }
    
    if (!passwordsMatch) {
      error = 'Passwords do not match';
      return false;
    }
    
    return true;
  }
</script>

<svelte:head>
  <title>Reset Password - CeLesteCMS Pro</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-base-200">
  <div class="card w-96 bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title justify-center">Set New Password</h2>
      <p class="text-center text-sm opacity-70 mb-4">
        Enter your new password below
      </p>
      
      {#if success}
        <div class="alert alert-success">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Password reset successful! You can now sign in with your new password.</span>
        </div>
        <div class="card-actions justify-center mt-4">
          <a href="/admin/login" class="btn btn-primary">Go to Login</a>
        </div>
      {:else if token}
        <form method="POST" use:enhance={() => {
          if (!validateForm()) return;
          
          isLoading = true;
          return async ({ update }) => {
            isLoading = false;
            update();
          };
        }}>
          <input type="hidden" name="token" value={token} />
          
          <div class="form-control">
            <label class="label" for="password">
              <span class="label-text">New Password</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              bind:value={password}
              placeholder="Enter new password"
              class="input input-bordered"
              class:input-error={password && passwordStrength === 'weak'}
              class:input-warning={password && passwordStrength === 'medium'}
              class:input-success={password && passwordStrength === 'strong'}
              required
              minlength="8"
              autocomplete="new-password"
            />
            {#if password}
              <div class="label">
                <span class="label-text-alt {getStrengthColor(passwordStrength)}">
                  Password strength: {passwordStrength}
                </span>
              </div>
            {/if}
          </div>
          
          <div class="form-control">
            <label class="label" for="confirmPassword">
              <span class="label-text">Confirm New Password</span>
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              bind:value={confirmPassword}
              placeholder="Confirm new password"
              class="input input-bordered"
              class:input-error={confirmPassword && !passwordsMatch}
              class:input-success={confirmPassword && passwordsMatch}
              required
              minlength="8"
              autocomplete="new-password"
            />
            {#if confirmPassword && !passwordsMatch}
              <div class="label">
                <span class="label-text-alt text-error">Passwords do not match</span>
              </div>
            {/if}
          </div>
          
          <div class="alert alert-info mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 class="font-bold">Password Requirements:</h3>
              <ul class="text-sm mt-1">
                <li>• At least 8 characters long</li>
                <li>• Mix of uppercase and lowercase letters (recommended)</li>
                <li>• Include numbers and special characters (recommended)</li>
              </ul>
            </div>
          </div>
          
          {#if error}
            <div class="alert alert-error mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          {/if}
          
          {#if message}
            <div class="alert alert-error mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{message}</span>
            </div>
          {/if}
          
          <div class="form-control mt-6">
            <button 
              type="submit" 
              class="btn btn-primary" 
              class:loading={isLoading} 
              disabled={isLoading || !passwordsMatch || passwordStrength === 'weak'}
            >
              {#if isLoading}
                <span class="loading loading-spinner"></span>
                Updating Password...
              {:else}
                Update Password
              {/if}
            </button>
          </div>
        </form>
        
        <div class="divider"></div>
        <div class="text-center">
          <a href="/admin/login" class="link link-hover">Back to Login</a>
        </div>
      {:else}
        <div class="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Invalid or missing reset token. Please request a new password reset.</span>
        </div>
        <div class="card-actions justify-center mt-4">
          <a href="/admin/forgot-password" class="btn btn-primary">Request New Reset</a>
        </div>
      {/if}
    </div>
  </div>
</div>

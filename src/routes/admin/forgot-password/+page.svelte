<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  
  let isLoading = false;
  let email = '';
  
  $: message = $page.url.searchParams.get('message');
  $: success = $page.url.searchParams.get('success') === 'true';
</script>

<svelte:head>
  <title>Reset Password - CeLesteCMS Pro</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-base-200">
  <div class="card w-96 bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title justify-center">Reset Password</h2>
      <p class="text-center text-sm opacity-70 mb-4">
        Enter your email address and we'll send you instructions to reset your password.
      </p>
      
      {#if success}
        <div class="alert alert-success">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Password reset instructions have been sent to your email.</span>
        </div>
        <div class="card-actions justify-center mt-4">
          <a href="/admin/login" class="btn btn-primary">Back to Login</a>
        </div>
      {:else}
        <form method="POST" use:enhance={() => {
          isLoading = true;
          return async ({ update }) => {
            isLoading = false;
            update();
          };
        }}>
          <div class="form-control">
            <label class="label" for="email">
              <span class="label-text">Email Address</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              bind:value={email}
              placeholder="admin@example.com"
              class="input input-bordered"
              required
              autocomplete="email"
            />
          </div>
          
          {#if message && !success}
            <div class="alert alert-error mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{message}</span>
            </div>
          {/if}
          
          <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary" class:loading={isLoading} disabled={isLoading}>
              {#if isLoading}
                <span class="loading loading-spinner"></span>
                Sending...
              {:else}
                Send Reset Link
              {/if}
            </button>
          </div>
        </form>
        
        <div class="divider"></div>
        <div class="text-center">
          <a href="/admin/login" class="link link-hover">Back to Login</a>
        </div>
      {/if}
    </div>
  </div>
</div>

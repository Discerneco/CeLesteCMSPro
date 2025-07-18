<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { Sun, Moon } from '@lucide/svelte';
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
  import * as m from '$lib/paraglide/messages';
  import { onMount } from 'svelte';
  
  // ✅ Fix Svelte 5 runes warnings - use $state()
  let isLoading = $state(false);
  let email = $state('');
  let theme = $state('light');
  
  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
  
  // ✅ Initialize theme on mount (language is handled by hooks.client.ts now)
  onMount(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    theme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
  });
  
  // ✅ Use $derived for reactive values
  let message = $derived($page.url.searchParams.get('message'));
  let success = $derived($page.url.searchParams.get('success') === 'true');
</script>

<svelte:head>
  <title>{m.auth_forgot_password_title()} - CeLesteCMS Pro</title>
</svelte:head>

<div class="min-h-screen flex flex-col bg-base-200">
  <!-- Header with Theme Toggle -->
  <div class="navbar bg-base-100 shadow-sm px-4 sm:px-8">
    <div class="flex-1">
      <span class="text-xl font-semibold">CeLeste CMS</span>
    </div>
    <div class="flex-none">
      <div class="flex items-center gap-2">
        <LanguageSwitcher />
        <button 
          onclick={toggleTheme}
          class="btn btn-circle btn-ghost"
          aria-label={m["auth_toggle_theme"]()}
        >
          {#if theme === 'dark'}
            <Sun class="h-5 w-5" />
          {:else}
            <Moon class="h-5 w-5" />
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <main class="flex-grow flex items-center justify-center px-4 sm:px-8 py-6">
  <div class="card w-96 bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title justify-center">{m.auth_forgot_password_title()}</h2>
      <p class="text-center text-sm opacity-70 mb-4">
        {m.auth_forgot_password_subtitle()}
      </p>
      
      {#if success}
        <div class="alert alert-success">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{m.auth_reset_instructions()}</span>
        </div>
        <div class="card-actions justify-center mt-4">
          <a href="/admin/login" class="btn btn-primary">{m.auth_back_to_login()}</a>
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
              <span class="label-text">{m.auth_email_label()}</span>
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
                {m.auth_send_reset_link()}...
              {:else}
                {m.auth_send_reset_link()}
              {/if}
            </button>
          </div>
        </form>
        
        <div class="divider"></div>
        <div class="text-center">
          <a href="/admin/login" class="link link-hover">{m.auth_back_to_login()}</a>
        </div>
      {/if}
    </div>
  </div>
  </main>
  
  <!-- Footer -->
  <footer class="footer footer-center px-4 sm:px-8 py-6 bg-base-200 text-base-content">
    <p>{m.auth_copyright()}</p>
  </footer>
</div>

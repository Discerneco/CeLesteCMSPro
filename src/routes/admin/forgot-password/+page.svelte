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
        <!-- Coming Soon Notice -->
        <div class="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="font-bold">Password Reset Coming Soon</h3>
            <div class="text-sm">
              Password reset functionality is being reimplemented with Oslo authentication. 
              Please contact your administrator for password assistance.
            </div>
          </div>
        </div>
        
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

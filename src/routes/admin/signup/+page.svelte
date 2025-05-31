<script lang="ts">
  import { Eye, EyeOff, AlertCircle, Sun, Moon, Loader2, User } from '@lucide/svelte';
  import AuthCard from '$lib/components/AuthCard.svelte';
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import * as m from '$lib/paraglide/messages';

  // Svelte 5 runes for state management
  import { onMount } from 'svelte';
  
  let name = $state('');
  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let showPassword = $state(false);
  let showConfirmPassword = $state(false);
  let error = $state('');
  let theme = $state('light'); // Use theme instead of isDarkMode for DaisyUI
  let isLoading = $state(false);

  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  function toggleConfirmPasswordVisibility() {
    showConfirmPassword = !showConfirmPassword;
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      error = m["auth.fillAllFields"]();
      return;
    }
    
    if (name.trim().length < 2) {
      error = m["auth.nameTooShort"]();
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      error = m["auth.invalidEmail"]();
      return;
    }
    
    if (password.length < 8) {
      error = m["auth.passwordTooShort"]();
      return;
    }
    
    if (password !== confirmPassword) {
      error = m["auth.passwordsDoNotMatch"]();
      return;
    }
    
    error = '';
    isLoading = true;
    
    try {
      const result = await auth.signup(email, password, name.trim());
      
      if (result.success) {
        // Redirect to admin dashboard (Better Auth auto-signs in after signup)
        goto('/admin');
      } else {
        error = result.message || m["auth.signupFailed"]();
      }
    } catch (e) {
      error = m["auth.signupError"]();
      console.error(e);
    } finally {
      isLoading = false;
    }
  }
  
  // Initialize theme from localStorage on mount
  onMount(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    theme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Initialize auth store
    auth.init();
  });
</script>

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
          aria-label={m["auth.toggleTheme"]()}
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

  <!-- Main Content - Signup Form -->
  <main class="flex-grow flex items-center justify-center px-4 sm:px-8 py-6">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex flex-col items-center justify-center">
          <img src="/logo.png" alt="CeLeste CMS Logo" class="w-24 h-24 mb-2" />
          <h2 class="card-title text-2xl font-bold text-center">{m["auth.signupTitle"]()}</h2>
          <p class="text-center text-base-content/70 mb-6">{m["auth.signupSubtitle"]()}</p>
        </div>

        {#if error}
          <div class="alert alert-error mb-6">
            <AlertCircle class="h-5 w-5" />
            <span>{error}</span>
          </div>
        {/if}

        <form onsubmit={(e) => { e.preventDefault(); handleSubmit(e); }}>
          <!-- Name Field -->
          <div class="form-control mb-4">
            <label for="name" class="label">
              <span class="label-text">{m["auth.nameLabel"]()}</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              oninput={(e) => name = e.currentTarget.value}
              class="input input-bordered w-full"
              placeholder="Your full name"
              required
            />
          </div>

          <!-- Email Field -->
          <div class="form-control mb-4">
            <label for="email" class="label">
              <span class="label-text">{m["auth.emailLabel"]()}</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              oninput={(e) => email = e.currentTarget.value}
              class="input input-bordered w-full"
              placeholder="your@email.com"
              required
            />
          </div>
          
          <!-- Password Field with Toggle -->
          <div class="form-control mb-4">
            <label for="password" class="label">
              <span class="label-text">{m["auth.passwordLabel"]()}</span>
            </label>
            <div class="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                oninput={(e) => password = e.currentTarget.value}
                class="input input-bordered w-full pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onclick={togglePasswordVisibility}
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-base-content/70 btn btn-ghost btn-sm btn-circle"
                aria-label={showPassword ? m["auth.hidePassword"]() : m["auth.showPassword"]()}
              >
                {#if showPassword}
                  <EyeOff class="h-4 w-4" />
                {:else}
                  <Eye class="h-4 w-4" />
                {/if}
              </button>
            </div>
          </div>

          <!-- Confirm Password Field with Toggle -->
          <div class="form-control mb-6">
            <label for="confirmPassword" class="label">
              <span class="label-text">{m["auth.confirmPasswordLabel"]()}</span>
            </label>
            <div class="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                oninput={(e) => confirmPassword = e.currentTarget.value}
                class="input input-bordered w-full pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onclick={toggleConfirmPasswordVisibility}
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-base-content/70 btn btn-ghost btn-sm btn-circle"
                aria-label={showConfirmPassword ? m["auth.hidePassword"]() : m["auth.showPassword"]()}
              >
                {#if showConfirmPassword}
                  <EyeOff class="h-4 w-4" />
                {:else}
                  <Eye class="h-4 w-4" />
                {/if}
              </button>
            </div>
          </div>
          
          <!-- Submit Button -->
          <button
            type="submit"
            disabled={isLoading}
            class="btn btn-primary w-full mb-4"
          >
            {#if isLoading}
              <span class="loading loading-spinner"></span>
              <span class="opacity-0">{m["auth.signupButton"]()}</span>
            {:else}
              {m["auth.signupButton"]()}
            {/if}
          </button>
        </form>

        <!-- Link to Login -->
        <div class="text-center">
          <p class="text-sm text-base-content/70">
            {m["auth.alreadyHaveAccount"]()} 
            <a href="/admin/login" class="link link-primary">{m["common.login"]()}</a>
          </p>
        </div>

        <div class="divider mt-6 mb-4"></div>
        <p class="text-xs text-center text-base-content/70">
          {m["auth.support"]()}
        </p>
      </div>
    </div>
  </main>
  
  <!-- Footer -->
  <footer class="footer footer-center px-4 sm:px-8 py-6 bg-base-200 text-base-content">
    <p>{m["auth.copyright"]()}</p>
  </footer>
</div>

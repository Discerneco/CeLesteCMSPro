<script lang="ts">
  import { Eye, EyeOff, AlertCircle, Sun, Moon, Loader2 } from '@lucide/svelte';
  import AuthCard from '$lib/components/AuthCard.svelte';
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import * as m from '$lib/paraglide/messages';

  // Svelte 5 runes for state management
  import { onMount } from 'svelte';
  
  let email = $state('');
  let password = $state('');
  let rememberMe = $state(false);
  let showPassword = $state(false);
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

  async function handleSubmit(event: Event) {
    event.preventDefault();
    if (!email || !password) {
      error = m["auth.fillAllFields"]();
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      error = m["auth.invalidEmail"]();
      return;
    }
    
    error = '';
    isLoading = true;
    
    console.log('🔍 Form submitted with rememberMe:', rememberMe);
    
    try {
      const result = await auth.login(email, password, rememberMe);
      
      if (result.success) {
        // Save remember me preference to localStorage
        localStorage.setItem('rememberMe', rememberMe.toString());
        
        // Redirect to admin dashboard
        goto('/admin');
      } else {
        error = result.message || m["auth.invalidCredentials"]();
      }
    } catch (e) {
      error = m["auth.loginError"]();
      console.error(e);
    } finally {
      isLoading = false;
    }
  }
  
  // Initialize theme on mount (language is handled by hooks.client.ts now)
  onMount(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    theme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Load remember me preference if exists
    const savedRememberMe = localStorage.getItem('rememberMe');
    if (savedRememberMe === 'true') {
      rememberMe = true;
    }
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

  <!-- Main Content - Login Form -->
  <main class="flex-grow flex items-center justify-center px-4 sm:px-8 py-6">
    <div class="w-full max-w-md">
      <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex flex-col items-center justify-center">
          <img src="/logo.png" alt="CeLeste CMS Logo" class="w-24 h-24 mb-2" />
          <h2 class="card-title text-2xl font-bold text-center">{m["auth.loginTitle"]()}</h2>
          <p class="text-center text-base-content/70 mb-6">{m["auth.loginSubtitle"]()}</p>
        </div>

        {#if error}
          <div class="alert alert-error mb-6">
            <AlertCircle class="h-5 w-5" />
            <span>{error}</span>
          </div>
        {/if}

        <form onsubmit={(e) => { e.preventDefault(); handleSubmit(e); }}>
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
          
          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between mb-6">
            <div class="form-control">
              <label class="label cursor-pointer">
                <input 
                  type="checkbox" 
                  class="checkbox checkbox-sm checkbox-primary" 
                  checked={rememberMe}
                  onchange={(e) => rememberMe = e.currentTarget.checked}
                />
                <span class="label-text ml-2">{m["auth.rememberMe"]()}</span>
              </label>
            </div>
            <a href="/admin/forgot-password" class="link link-primary text-sm">{m["common.forgotPassword"]()}</a>
          </div>
          
          <!-- Submit Button -->
          <button
            type="submit"
            disabled={isLoading}
            class="btn btn-primary w-full"
          >
            {#if isLoading}
              <span class="loading loading-spinner"></span>
              <span class="opacity-0">{m["auth.loginButton"]()}</span>
            {:else}
              {m["auth.loginButton"]()}
            {/if}
          </button>
        </form>

        <!-- Link to Signup -->
        <div class="text-center mt-6">
          <p class="text-sm text-base-content/70">
            {m["auth.dontHaveAccount"]()} 
            <a href="/admin/signup" class="link link-primary font-medium">{m["common.signup"]()}</a>
          </p>
        </div>

        <div class="divider mt-6 mb-4"></div>
        <p class="text-xs text-center text-base-content/70">
          {m["auth.support"]()}
        </p>
      </div>
      </div>
    </div>
  </main>
  
  <!-- Footer -->
  <footer class="footer footer-center px-4 sm:px-8 py-6 bg-base-200 text-base-content">
    <p>{m["auth.copyright"]()}</p>
  </footer>
</div>

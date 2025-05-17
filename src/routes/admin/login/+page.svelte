<script lang="ts">
  import { Eye, EyeOff, AlertCircle, Sun, Moon, Loader2 } from '@lucide/svelte';
  import AuthCard from '$lib/components/AuthCard.svelte';
  import { auth } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';

  // Svelte 5 runes for state management
  let email = $state('');
  let password = $state('');
  let rememberMe = $state(false);
  let showPassword = $state(false);
  let error = $state('');
  let isDarkMode = $state(false);
  let isLoading = $state(false);

  function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false');
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    if (!email || !password) {
      error = 'Please enter both email and password';
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      error = 'Please enter a valid email address';
      return;
    }
    
    error = '';
    isLoading = true;
    
    try {
      const result = await auth.login(email, password);
      
      if (result.success) {
        // Redirect to admin dashboard
        goto('/admin');
      } else {
        error = result.message || 'Invalid credentials';
      }
    } catch (e) {
      error = 'An error occurred during login';
      console.error(e);
    } finally {
      isLoading = false;
    }
  }
  
  // Initialize dark mode from localStorage on mount
  $effect(() => {
    if (typeof window !== 'undefined') {
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      isDarkMode = savedDarkMode;
      document.documentElement.classList.toggle('dark', isDarkMode);
    }
  });
</script>

<div class={`min-h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-950 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
  <!-- Header with Theme Toggle -->
  <header class={`w-full p-4 flex justify-end ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-sm`}>
    <button 
      onclick={toggleTheme}
      class={`p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
      aria-label="Toggle theme"
    >
      {#if isDarkMode}
        <Sun class="h-5 w-5" />
      {:else}
        <Moon class="h-5 w-5" />
      {/if}
    </button>
  </header>

  <!-- Main Content - Login Form -->
  <main class="flex-grow flex items-center justify-center p-4">
    <AuthCard 
      title="CeLeste CMS" 
      subtitle="Admin Dashboard Login" 
      errorMessage={error ? error : ''}
      footerText="This is a protected area. Only authorized CMS administrators can access."
      {isDarkMode} 
      className="w-full max-w-md shadow-lg"
    >
      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(e); }}>
        <!-- Email Field -->
        <div class="mb-6">
          <label for="email" class="block text-sm font-medium mb-1">Email</label>
          <input
            id="email"
            type="email"
            bind:value={email}
            class={`w-full px-3 py-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-700 focus:border-indigo-500' : 'bg-white border-gray-300 focus:border-indigo-500'} focus:outline-none focus:ring-1 focus:ring-indigo-500`}
            placeholder="your@email.com"
            required
          />
        </div>
        <!-- Password Field with Toggle -->
        <div class="mb-6">
          <label for="password" class="block text-sm font-medium mb-1">Password</label>
          <div class="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              bind:value={password}
              class={`w-full px-3 py-2 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-700 focus:border-indigo-500' : 'bg-white border-gray-300 focus:border-indigo-500'} focus:outline-none focus:ring-1 focus:ring-indigo-500`}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onclick={togglePasswordVisibility}
              class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
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
        <!-- Remember Me & Forgot Password -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              bind:checked={rememberMe}
              class="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700"
            />
            <label for="remember-me" class="ml-2 text-sm">Remember me</label>
          </div>
          <a href="/admin/forgot-password" class="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">Forgot password?</a>
        </div>
        <!-- Submit Button -->
        <button
          type="submit"
          disabled={isLoading}
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed relative"
        >
          {#if isLoading}
            <span class="absolute inset-0 flex items-center justify-center">
              <Loader2 class="h-5 w-5 animate-spin" />
            </span>
            <span class="opacity-0">Sign In</span>
          {:else}
            Sign In
          {/if}
        </button>
      </form>
    </AuthCard>
  </main>
  <!-- Footer -->
  <footer class={`py-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
    <p>© 2025 CeLeste CMS. All rights reserved.</p>
  </footer>
</div>

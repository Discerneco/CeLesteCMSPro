<script lang="ts">
  import { Eye, EyeOff, AlertCircle, Moon, Sun } from '@lucide/svelte';

  // Runes for state (Svelte 5 official syntax)
  let email = $state('');
  let password = $state('');
  let rememberMe = $state(false);
  let showPassword = $state(false);
  let error = $state('');
  let isDarkMode = $state(false);

  // Theme toggle
  function toggleTheme() {
    isDarkMode.set(!isDarkMode);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }
  }

  // Password visibility toggle
  function togglePasswordVisibility() {
    showPassword.set(!showPassword);
  }

  // Form submission
  function handleSubmit(e: Event) {
    e.preventDefault();
    if (!email || !password) {
      error.set('Please enter both email and password');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      error.set('Please enter a valid email address');
      return;
    }
    error.set('');
    alert('Login attempt with: ' + email);
  }
</script>

<div class={`min-h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-950 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
  <!-- Header with Theme Toggle -->
  <header class={`w-full p-4 flex justify-end ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-sm`}>
    <button
      onclick={toggleTheme}
      class={`p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
      aria-label="Toggle theme"
      type="button"
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
    <div class={`w-full max-w-md ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-lg p-8`}>
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold">CeLeste CMS</h1>
        <p class={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Admin Dashboard Login</p>
      </div>

      {#if error}
        <div class="mb-6 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md flex items-center dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          <AlertCircle class="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      {/if}

      <form onsubmit={handleSubmit}>
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
              checked={rememberMe}
              onchange={() => rememberMe.set(!rememberMe)}
              class="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700"
            />
            <label for="remember-me" class="ml-2 text-sm">Remember me</label>
          </div>
          <a href="#" class="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">Forgot password?</a>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Sign In
        </button>
      </form>

      <div class="mt-8 pt-6 border-t text-center text-sm">
        <p class={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
          This is a protected area. Only authorized CMS administrators can access.
        </p>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class={`py-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
    <p>© 2025 CeLeste CMS. All rights reserved.</p>
  </footer>
</div>

<script lang="ts">
  // Basic Svelte state
  let email = '';
  let password = '';
  let rememberMe = false;
  let showPassword = false;
  let error = '';
  let isDarkMode = false;

  function toggleTheme() {
    isDarkMode = !isDarkMode;
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  function handleSubmit(event: Event) {
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
    alert('Login attempt with: ' + email);
  }
</script>

<div class={`min-h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-950 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
  <!-- Header with Theme Toggle -->
  <header class={`w-full p-4 flex justify-end ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-sm`}>
    <button 
      on:click={toggleTheme}
      class={`p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
      aria-label="Toggle theme"
    >
      {#if isDarkMode}
        <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m8.66-12.66l-.71.71M4.05 19.95l-.71-.71M21 12h-1M4 12H3m16.95 7.95l-.71-.71M4.05 4.05l-.71.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
      {:else}
        <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/></svg>
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
          <svg class="h-5 w-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          <span>{error}</span>
        </div>
      {/if}
      <form on:submit|preventDefault={handleSubmit}>
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
              on:click={togglePasswordVisibility}
              class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {#if showPassword}
                <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.94 17.94A10.05 10.05 0 0112 19c-5.52 0-10-4.48-10-10 0-2.21.72-4.25 1.94-5.94M1 1l22 22"/></svg>
              {:else}
                <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
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

<script>
  import { 
    HelpCircle, 
    LogOut, 
    Menu, 
    MessageSquare, 
    Moon, 
    PieChart, 
    Settings, 
    Sun, 
    Users, 
    Globe,
    Layout,
    FileText,
    UploadCloud,
    Database
  } from '@lucide/svelte';

  // Import reusable components
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
  
  // Import i18n with modern Paraglide pattern
  import * as m from '$lib/paraglide/messages';
  import { setLocale, getLocale, locales } from '$lib/paraglide/runtime.js';
  import { auth } from '$lib/stores/auth';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';

  // Svelte 5 children prop for slot replacement
  let { children, data } = $props();

  // Modern Svelte 5 runes state management
  let theme = $state('light');
  let isSidebarOpen = $state(true);
  
  // Modern DaisyUI theme management
  function handleThemeToggle() {
    theme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
  
  function handleSidebarToggle() {
    isSidebarOpen = !isSidebarOpen;
  }

  function handleLogout() {
    auth.logout();
  }
  
  // Early locale initialization to prevent hydration race conditions
  $effect(() => {
    if (browser) {
      // Check both Paraglide's standard key and our custom key
      const paraglideLocale = localStorage.getItem('PARAGLIDE_LOCALE');
      const customLocale = localStorage.getItem('celestecms-language');
      const savedLanguage = paraglideLocale || customLocale;
      
      if (savedLanguage && locales.includes(savedLanguage)) {
        const currentLocale = getLocale();
        if (currentLocale !== savedLanguage) {
          console.log('🌍 Admin layout locale restoration:', currentLocale, '->', savedLanguage);
          setLocale(savedLanguage);
          
          // Ensure both keys are synchronized
          localStorage.setItem('PARAGLIDE_LOCALE', savedLanguage);
          localStorage.setItem('celestecms-language', savedLanguage);
        }
      }
    }
  });

  // Initialize theme from localStorage on mount (Svelte 5 $effect)
  $effect(() => {
    if (browser) {
      const savedTheme = localStorage.getItem('theme') || 'light';
      theme = savedTheme;
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  });

  // Check if current route is active
  function isActiveRoute(route) {
    return $page.url.pathname === route || $page.url.pathname.startsWith(route === '/admin' ? '/admin' : route + '/');
  }

  // Generate consistent random color for user avatar
  function getAvatarColor(userId) {
    const colors = [
      'bg-primary text-primary-content',
      'bg-secondary text-secondary-content', 
      'bg-accent text-accent-content',
      'bg-info text-info-content',
      'bg-success text-success-content',
      'bg-warning text-warning-content',
      'bg-error text-error-content',
      'bg-neutral text-neutral-content'
    ];
    
    // Simple hash function to get consistent color based on userId
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return colors[Math.abs(hash) % colors.length];
  }

  // Get user initials (2 letters)
  function getUserInitials(user) {
    if (!user) return '??';
    
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || user.email;
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  }
</script>

<div class="h-screen flex flex-col bg-base-200" data-theme={theme}>
  <!-- Header -->
  <div class="navbar bg-base-100 sticky top-0 z-10 shadow-sm">
    <div class="navbar-start">
      <button 
        onclick={handleSidebarToggle} 
        class="btn btn-ghost btn-circle"
      >
        <Menu class="h-5 w-5" />
      </button>
      <h1 class="text-xl font-bold">CeLeste CMS</h1>
    </div>
    
    <div class="navbar-end gap-2">
      <LanguageSwitcher />
      
      <button 
        onclick={handleThemeToggle} 
        class="btn btn-ghost btn-circle"
      >
        {#if theme === 'dark'}
          <Sun class="h-5 w-5" />
        {:else}
          <Moon class="h-5 w-5" />
        {/if}
      </button>
      
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <div class="{data?.user ? getAvatarColor(data.user.id) : 'bg-primary text-primary-content'} rounded-full w-8 h-8 grid place-content-center">
            {data?.user ? getUserInitials(data.user) : '??'}
          </div>
        </div>
        <ul tabindex="-1" class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
          {#if data?.user}
            <li class="menu-title">
              <span class="text-xs">{data.user.username ? '@' + data.user.username : data.user.email}</span>
            </li>
          {/if}
          <li><a href="/admin/profile">{m.user_menu_profile()}</a></li>
          <li><a href="/admin/settings">{m.user_menu_settings()}</a></li>
          <li><button onclick={handleLogout} class="w-full text-left px-4 py-2 hover:bg-base-200">{m.user_menu_logout()}</button></li>
        </ul>
      </div>
    </div>
  </div>
  
  <div class="flex flex-1 overflow-hidden">
    <!-- Sidebar -->
    {#if isSidebarOpen}
      <aside class="w-64 bg-base-100 border-r border-base-300 overflow-y-auto">
        <div class="p-2">
          <style>
            .sidebar-menu li {
              margin-bottom: 4px;
            }
            .sidebar-menu li:last-child {
              margin-bottom: 0;
            }
            .sidebar-menu button {
              @apply w-full text-left;
            }
          </style>
          <ul class="menu menu-md bg-base-100 w-full sidebar-menu">
            <li>
              <a href="/admin" class={isActiveRoute('/admin') && $page.url.pathname === '/admin' ? 'active bg-primary text-primary-content hover:bg-primary-focus' : ''}>
                <PieChart class="h-5 w-5" />
                {m.sidebar_dashboard()}
              </a>
            </li>
            
            <li>
              <a href="/admin/sites" class={isActiveRoute('/admin/sites') ? 'active bg-primary text-primary-content hover:bg-primary-focus' : ''}>
                <Globe class="h-5 w-5" />
                {m.sidebar_sites()}
              </a>
            </li>
            
            <li>
              <a href="/admin/templates" class={isActiveRoute('/admin/templates') ? 'active bg-primary text-primary-content hover:bg-primary-focus' : ''}>
                <Layout class="h-5 w-5" />
                {m.sidebar_templates()}
              </a>
            </li>
            
            <li>
              <a href="/admin/posts" class={isActiveRoute('/admin/posts') ? 'active bg-primary text-primary-content hover:bg-primary-focus' : ''}>
                <MessageSquare class="h-5 w-5" />
                {m.sidebar_posts()}
              </a>
            </li>
            
            <li>
              <a href="/admin/pages" class={isActiveRoute('/admin/pages') ? 'active bg-primary text-primary-content hover:bg-primary-focus' : ''}>
                <FileText class="h-5 w-5" />
                {m.sidebar_pages()}
              </a>
            </li>
            
            <li>
              <a href="/admin/media" class={isActiveRoute('/admin/media') ? 'active bg-primary text-primary-content hover:bg-primary-focus' : ''}>
                <UploadCloud class="h-5 w-5" />
                {m.sidebar_media()}
              </a>
            </li>
            
            <li>
              <a href="/admin/users" class={isActiveRoute('/admin/users') ? 'active bg-primary text-primary-content hover:bg-primary-focus' : ''}>
                <Users class="h-5 w-5" />
                {m.sidebar_users()}
              </a>
            </li>
            
            <li>
              <a href="/admin/plugins" class={isActiveRoute('/admin/plugins') ? 'active bg-primary text-primary-content hover:bg-primary-focus' : ''}>
                <Database class="h-5 w-5" />
                {m.sidebar_plugins()}
              </a>
            </li>
            
            <li>
              <a href="/admin/settings" class={isActiveRoute('/admin/settings') ? 'active bg-primary text-primary-content hover:bg-primary-focus' : ''}>
                <Settings class="h-5 w-5" />
                {m.sidebar_settings()}
              </a>
            </li>
          </ul>
        </div>
        
        <div class="divider"></div>
        
        <div class="p-4 mt-auto">
          <ul class="menu menu-md bg-base-100 w-full sidebar-menu">
            <li>
              <a href="/admin/help">
                <HelpCircle class="h-5 w-5" />
                {m.sidebar_help()}
              </a>
            </li>
            
            <li>
              <button type="button" onclick={handleLogout}>
                <LogOut class="h-5 w-5" />
                {m.sidebar_logout()}
              </button>
            </li>
          </ul>
        </div>
      </aside>
    {/if}
    
    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-6">
      {@render children()}
    </main>
  </div>
</div>

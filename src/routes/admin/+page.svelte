<script>
  import { 
    BarChart, 
    Calendar, 
    CreditCard, 
    DollarSign, 
    Download, 
    Eye, 
    Heart, 
    HelpCircle, 
    LogOut, 
    Menu, 
    MessageSquare, 
    Moon, 
    PieChart, 
    Settings, 
    Sun, 
    User, 
    Users, 
    X,
    Globe,
    Layout,
    FileText,
    UploadCloud,
    Database
  } from '@lucide/svelte';

  // Import reusable components
  import Card from '$lib/components/Card.svelte';
  import ActivityItem from '$lib/components/ActivityItem.svelte';
  import ContentItem from '$lib/components/ContentItem.svelte';
  import SidebarItem from '$lib/components/SidebarItem.svelte';
  import StatCard from '$lib/components/StatCard.svelte';
  import StatusItem from '$lib/components/StatusItem.svelte';
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
  
  // Import i18n
  import { messages, languageTag } from '$lib/i18n';
  import { auth } from '$lib/stores/auth.js';

  // State management with Svelte 5 runes
  let isDarkMode = $state(false);
  let isSidebarOpen = $state(true);
  let currentLanguage = $state(languageTag);
  
  function handleThemeToggle() {
    isDarkMode = !isDarkMode;
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false');
  }
  
  function handleSidebarToggle() {
    isSidebarOpen = !isSidebarOpen;
  }

  function handleLogout() {
    auth.logout();
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

<div class={`h-screen flex flex-col bg-base-200 ${isDarkMode ? 'dark' : ''}`} data-theme={isDarkMode ? 'dark' : 'light'}>
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
        {#if isDarkMode}
          <Sun class="h-5 w-5" />
        {:else}
          <Moon class="h-5 w-5" />
        {/if}
      </button>
      
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <div class="bg-primary text-primary-content rounded-full w-8 h-8 grid place-content-center">
            A
          </div>
        </div>
        <ul tabindex="-1" class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
          <li><a href="/admin/profile">{$messages.userMenu.profile}</a></li>
          <li><a href="/admin/settings">{$messages.userMenu.settings}</a></li>
          <li><button onclick={handleLogout} class="w-full text-left px-4 py-2 hover:bg-base-200">{$messages.userMenu.logout}</button></li>
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
              <a href="/admin" class="active bg-primary text-primary-content hover:bg-primary-focus">
                <PieChart class="h-5 w-5" />
                {$messages.sidebar.dashboard}
              </a>
            </li>
            
            <li>
              <a href="/admin/sites">
                <Globe class="h-5 w-5" />
                {$messages.sidebar.sites}
              </a>
            </li>
            
            <li>
              <a href="/admin/templates">
                <Layout class="h-5 w-5" />
                {$messages.sidebar.templates}
              </a>
            </li>
            
            <li>
              <a href="/admin/posts">
                <MessageSquare class="h-5 w-5" />
                {$messages.sidebar.posts}
              </a>
            </li>
            
            <li>
              <a href="/admin/pages">
                <FileText class="h-5 w-5" />
                {$messages.sidebar.pages}
              </a>
            </li>
            
            <li>
              <a href="/admin/media">
                <UploadCloud class="h-5 w-5" />
                {$messages.sidebar.media}
              </a>
            </li>
            
            <li>
              <a href="/admin/users">
                <Users class="h-5 w-5" />
                {$messages.sidebar.users}
              </a>
            </li>
            
            <li>
              <a href="/admin/plugins">
                <Database class="h-5 w-5" />
                {$messages.sidebar.plugins}
              </a>
            </li>
            
            <li>
              <a href="/admin/settings">
                <Settings class="h-5 w-5" />
                {$messages.sidebar.settings}
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
                {$messages.sidebar.help}
              </a>
            </li>
            
            <li>
              <button type="button" onclick={handleLogout}>
                <LogOut class="h-5 w-5" />
                {$messages.sidebar.logout}
              </button>
            </li>
          </ul>
        </div>
      </aside>
    {/if}
    
    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-6">
      <h2 class="text-2xl font-bold mb-4">{$messages.dashboard.title}</h2>
      <p class="text-base-content/70 mb-8">{$messages.dashboard.welcome}</p>
      
      <!-- Stats Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Stats Cards using DaisyUI card component -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-6">
            <div class="flex items-center justify-between">
              <Globe class="text-primary h-8 w-8" />
              <span class={`badge rounded-full px-3 py-1 font-medium ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'}`}>+1</span>
            </div>
            <div class="mt-4">
              <h3 class="text-2xl font-bold">3</h3>
              <p class="text-sm text-base-content/60">{$messages.dashboard.stats.activeSites}</p>
            </div>
          </div>
        </div>
        
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-6">
            <div class="flex items-center justify-between">
              <MessageSquare class="text-primary h-8 w-8" />
              <span class={`badge rounded-full px-3 py-1 font-medium ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'}`}>+12</span>
            </div>
            <div class="mt-4">
              <h3 class="text-2xl font-bold">48</h3>
              <p class="text-sm text-base-content/60">{$messages.dashboard.stats.posts}</p>
            </div>
          </div>
        </div>
        
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-6">
            <div class="flex items-center justify-between">
              <Users class="text-primary h-8 w-8" />
              <span class={`badge rounded-full px-3 py-1 font-medium ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'}`}>+3</span>
            </div>
            <div class="mt-4">
              <h3 class="text-2xl font-bold">16</h3>
              <p class="text-sm text-base-content/60">{$messages.dashboard.stats.users}</p>
            </div>
          </div>
        </div>
        
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-6">
            <div class="flex items-center justify-between">
              <UploadCloud class="text-primary h-8 w-8" />
              <span class={`badge rounded-full px-3 py-1 font-medium ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'}`}>+28</span>
            </div>
            <div class="mt-4">
              <h3 class="text-2xl font-bold">164</h3>
              <p class="text-sm text-base-content/60">{$messages.dashboard.stats.mediaFiles}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Posts and Activity Sections -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <!-- Recent Posts -->
        <div class="card bg-base-100 shadow-md md:col-span-2">
          <div class="card-body">
            <div class="flex justify-between items-center">
              <h2 class="card-title">{$messages.dashboard.recentPosts}</h2>
              <a href="/admin/posts/new" class="btn btn-sm btn-outline btn-primary">{$messages.dashboard.addPost}</a>
            </div>
            
            <div class="divider my-2"></div>
            
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-medium">Venue selection finalized for the reunion</h3>
                  <p class="text-sm text-primary">Temple Reunion</p>
                  <p class="text-xs text-base-content/50 mt-1">14/04/2025</p>
                </div>
                <button class="btn btn-ghost btn-sm">
                  <Eye class="h-4 w-4 text-primary" />
                </button>
              </div>
              
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-medium">Community Blog Launch</h3>
                  <p class="text-sm text-primary">Community Blog</p>
                  <p class="text-xs text-base-content/50 mt-1">09/04/2025</p>
                </div>
                <button class="btn btn-ghost btn-sm">
                  <Eye class="h-4 w-4 text-primary" />
                </button>
              </div>
              
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-medium">New Portfolio Project</h3>
                  <p class="text-sm text-primary">Portfolio Site</p>
                  <p class="text-xs text-base-content/50 mt-1">04/04/2025</p>
                </div>
                <button class="btn btn-ghost btn-sm">
                  <Eye class="h-4 w-4 text-primary" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recent Activity -->
        <div class="card bg-base-100 shadow-md">
          <div class="card-body">
            <h2 class="card-title">{$messages.dashboard.recentActivity}</h2>
            
            <div class="divider my-2"></div>
            
            <div class="space-y-4">
              <div>
                <p class="text-xs text-primary font-medium">User Login</p>
                <h3 class="font-medium">Maria Silva</h3>
                <p class="text-xs text-base-content/50 mt-1">15/04/2025</p>
              </div>
              
              <div>
                <p class="text-xs text-primary font-medium">Post Published</p>
                <h3 class="font-medium">News Article</h3>
                <p class="text-xs text-base-content/50 mt-1">14/04/2025</p>
              </div>
              
              <div>
                <p class="text-xs text-primary font-medium">New User</p>
                <h3 class="font-medium">Carlos Mendes</h3>
                <p class="text-xs text-base-content/50 mt-1">14/04/2025</p>
              </div>
            </div>
            
            <div class="card-actions justify-end mt-4">
              <a href="/admin/activity" class="link link-primary">{$messages.dashboard.viewAll}</a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- System Status Section -->
      <div class="grid grid-cols-1 gap-6 mb-6">
        <div class="card bg-base-100 shadow-md">
          <div class="card-body">
            <h2 class="card-title">{$messages.dashboard.systemStatus}</h2>
            
            <div class={`p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-green-900/30 text-green-700' : 'bg-green-100 text-green-800'}`}>
              <span>{$messages.dashboard.systemOperational}</span>
            </div>
            
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span>{$messages.dashboard.database}</span>
                <div class="flex items-center gap-2">
                  <span class={`badge font-medium gap-2 ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'}`}>
                    <div aria-label="success" class="status status-success"></div>
                    {$messages.dashboard.operational}
                  </span>
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <span>{$messages.dashboard.api}</span>
                <div class="flex items-center gap-2">
                  <span class={`badge font-medium gap-2 ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'}`}>
                    <div aria-label="success" class="status status-success"></div>
                    {$messages.dashboard.operational}
                  </span>
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <span>{$messages.dashboard.storage}</span>
                <div class="flex items-center gap-2">
                  <span class={`badge font-medium gap-2 ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'}`}>
                    <div aria-label="success" class="status status-success"></div>
                    {$messages.dashboard.operational}
                  </span>
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <span>{$messages.dashboard.webServer}</span>
                <div class="flex items-center gap-2">
                  <span class={`badge font-medium gap-2 ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'}`}>
                    <div aria-label="success" class="status status-success"></div>
                    {$messages.dashboard.operational}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>

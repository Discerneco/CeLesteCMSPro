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
        <ul tabindex="0" class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
          <li><a href="/admin/profile">Profile</a></li>
          <li><a href="/admin/settings">Settings</a></li>
          <li><button onclick={handleLogout} class="w-full text-left px-4 py-2 hover:bg-base-200">Logout</button></li>
        </ul>
      </div>
    </div>
  </div>
  
  <div class="flex flex-1 overflow-hidden">
    <!-- Sidebar -->
    {#if isSidebarOpen}
      <aside class="w-64 bg-base-100 border-r border-base-300 overflow-y-auto">
        <div class="p-4">
          <ul class="menu menu-md bg-base-100 w-full">
            <li>
              <a href="/admin" class="active">
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
          <ul class="menu menu-md bg-base-100 w-full">
            <li>
              <a href="/admin/help">
                <HelpCircle class="h-5 w-5" />
                {$messages.sidebar.help}
              </a>
            </li>
            
            <li>
              <a onclick={handleLogout}>
                <LogOut class="h-5 w-5" />
                {$messages.sidebar.logout}
              </a>
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
        <!-- Stats Cards using DaisyUI stats component -->
        <div class="stats shadow bg-base-100">
          <div class="stat">
            <div class="stat-figure text-primary">
              <Globe class="h-6 w-6" />
            </div>
            <div class="stat-title">{$messages.dashboard.stats.activeSites}</div>
            <div class="stat-value">3</div>
            <div class="stat-desc text-success">+1</div>
          </div>
        </div>
        
        <div class="stats shadow bg-base-100">
          <div class="stat">
            <div class="stat-figure text-primary">
              <MessageSquare class="h-6 w-6" />
            </div>
            <div class="stat-title">{$messages.dashboard.stats.posts}</div>
            <div class="stat-value">48</div>
            <div class="stat-desc text-success">+12</div>
          </div>
        </div>
        
        <div class="stats shadow bg-base-100">
          <div class="stat">
            <div class="stat-figure text-primary">
              <Users class="h-6 w-6" />
            </div>
            <div class="stat-title">{$messages.dashboard.stats.users}</div>
            <div class="stat-value">16</div>
            <div class="stat-desc text-success">+3</div>
          </div>
        </div>
        
        <div class="stats shadow bg-base-100">
          <div class="stat">
            <div class="stat-figure text-primary">
              <UploadCloud class="h-6 w-6" />
            </div>
            <div class="stat-title">{$messages.dashboard.stats.mediaFiles}</div>
            <div class="stat-value">164</div>
            <div class="stat-desc text-success">+28</div>
          </div>
        </div>
      </div>
      
      <!-- Posts and Activity Sections -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <!-- Recent Posts -->
        <div class="card bg-base-100 shadow-xl md:col-span-2">
          <div class="card-body">
            <div class="flex justify-between items-center">
              <h2 class="card-title">Recent Posts</h2>
              <a href="/admin/posts/new" class="btn btn-sm btn-outline btn-primary">Add Post</a>
            </div>
            
            <div class="divider my-2"></div>
            
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-medium">Venue selection finalized for the reunion</h3>
                  <p class="text-sm text-base-content/70">Temple Reunion</p>
                </div>
                <span class="text-sm text-base-content/70">14/04/2025</span>
              </div>
              
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-medium">Community Blog Launch</h3>
                  <p class="text-sm text-base-content/70">Community Blog</p>
                </div>
                <span class="text-sm text-base-content/70">09/04/2025</span>
              </div>
              
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-medium">New Portfolio Project</h3>
                  <p class="text-sm text-base-content/70">Portfolio Site</p>
                </div>
                <span class="text-sm text-base-content/70">04/04/2025</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recent Activity -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Recent Activity</h2>
            
            <div class="divider my-2"></div>
            
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-medium">User Login</h3>
                  <p class="text-sm text-base-content/70">Maria Silva</p>
                </div>
                <span class="text-sm text-base-content/70">15/04/2025</span>
              </div>
              
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-medium">Post Published</h3>
                  <p class="text-sm text-base-content/70">News Article</p>
                </div>
                <span class="text-sm text-base-content/70">14/04/2025</span>
              </div>
              
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-medium">New User</h3>
                  <p class="text-sm text-base-content/70">Carlos Mendes</p>
                </div>
                <span class="text-sm text-base-content/70">14/04/2025</span>
              </div>
            </div>
            
            <div class="card-actions justify-end mt-4">
              <a href="/admin/activity" class="link link-primary">View all</a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- System Status Section -->
      <div class="grid grid-cols-1 gap-6 mb-6">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">{$messages.dashboard.systemStatus}</h2>
            
            <div class="alert alert-success shadow-lg mb-4">
              <span>All systems operational. CeLeste CMS v0.1</span>
            </div>
            
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <div class="badge badge-success badge-sm"></div>
                <span>Database</span>
              </div>
              
              <div class="flex items-center gap-2">
                <div class="badge badge-success badge-sm"></div>
                <span>API</span>
              </div>
              
              <div class="flex items-center gap-2">
                <div class="badge badge-success badge-sm"></div>
                <span>Storage</span>
              </div>
              
              <div class="flex items-center gap-2">
                <div class="badge badge-success badge-sm"></div>
                <span>Web Server</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>

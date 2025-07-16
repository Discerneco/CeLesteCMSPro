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
  
  // Import i18n with modern Paraglide pattern
  import * as m from '$lib/paraglide/messages';
  import { auth } from '$lib/stores/auth';

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
  
  // Initialize theme from localStorage on mount (Svelte 5 $effect)
  $effect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') || 'light';
      theme = savedTheme;
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  });
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
          <div class="bg-primary text-primary-content rounded-full w-8 h-8 grid place-content-center">
            A
          </div>
        </div>
        <ul tabindex="-1" class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
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
              <a href="/admin" class="active bg-primary text-primary-content hover:bg-primary-focus">
                <PieChart class="h-5 w-5" />
                {m.sidebar_dashboard()}
              </a>
            </li>
            
            <li>
              <a href="/admin/sites">
                <Globe class="h-5 w-5" />
                {m.sidebar_sites()}
              </a>
            </li>
            
            <li>
              <a href="/admin/templates">
                <Layout class="h-5 w-5" />
                {m.sidebar_templates()}
              </a>
            </li>
            
            <li>
              <a href="/admin/posts">
                <MessageSquare class="h-5 w-5" />
                {m.sidebar_posts()}
              </a>
            </li>
            
            <li>
              <a href="/admin/pages">
                <FileText class="h-5 w-5" />
                {m.sidebar_pages()}
              </a>
            </li>
            
            <li>
              <a href="/admin/media">
                <UploadCloud class="h-5 w-5" />
                {m.sidebar_media()}
              </a>
            </li>
            
            <li>
              <a href="/admin/users">
                <Users class="h-5 w-5" />
                {m.sidebar_users()}
              </a>
            </li>
            
            <li>
              <a href="/admin/plugins">
                <Database class="h-5 w-5" />
                {m.sidebar_plugins()}
              </a>
            </li>
            
            <li>
              <a href="/admin/settings">
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
      <h2 class="text-2xl font-bold mb-4">{m.dashboard_title()}</h2>
      <p class="text-base-content/70 mb-8">{m.dashboard_welcome()}</p>
      
      <!-- Stats Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Stats Cards using DaisyUI card component -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-6">
            <div class="flex items-center justify-between">
              <Globe class="text-primary h-8 w-8" />
              <span class="badge badge-success">+1</span>
            </div>
            <div class="mt-4">
              <h3 class="text-2xl font-bold">3</h3>
              <p class="text-sm text-base-content/60">{m.dashboard_stats_active_sites()}</p>
            </div>
          </div>
        </div>
        
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-6">
            <div class="flex items-center justify-between">
              <MessageSquare class="text-primary h-8 w-8" />
              <span class="badge badge-success">+12</span>
            </div>
            <div class="mt-4">
              <h3 class="text-2xl font-bold">48</h3>
              <p class="text-sm text-base-content/60">{m.dashboard_stats_posts()}</p>
            </div>
          </div>
        </div>
        
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-6">
            <div class="flex items-center justify-between">
              <Users class="text-primary h-8 w-8" />
              <span class="badge badge-success">+3</span>
            </div>
            <div class="mt-4">
              <h3 class="text-2xl font-bold">16</h3>
              <p class="text-sm text-base-content/60">{m.dashboard_stats_users()}</p>
            </div>
          </div>
        </div>
        
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-6">
            <div class="flex items-center justify-between">
              <UploadCloud class="text-primary h-8 w-8" />
              <span class="badge badge-success">+28</span>
            </div>
            <div class="mt-4">
              <h3 class="text-2xl font-bold">164</h3>
              <p class="text-sm text-base-content/60">{m.dashboard_stats_media_files()}</p>
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
              <h2 class="card-title">{m.dashboard_recent_posts()}</h2>
              <a href="/admin/posts/new" class="btn btn-sm btn-outline btn-primary">{m.dashboard_add_post()}</a>
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
            <h2 class="card-title">{m.dashboard_recent_activity()}</h2>
            
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
              <a href="/admin/activity" class="link link-primary">{m.dashboard_view_all()}</a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- System Status Section -->
      <div class="grid grid-cols-1 gap-6 mb-6">
        <div class="card bg-base-100 shadow-md">
          <div class="card-body">
            <h2 class="card-title">{m.dashboard_system_status()}</h2>
            
            <div class="alert alert-success mb-4">
              <span>{m.dashboard_system_operational()}</span>
            </div>
            
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span>{m.dashboard_database()}</span>
                <div class="flex items-center gap-2">
                  <span class="badge badge-success font-medium gap-2">
                    <div aria-label="success" class="status status-success"></div>
                    {m.dashboard_operational()}
                  </span>
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <span>{m.dashboard_api()}</span>
                <div class="flex items-center gap-2">
                  <span class="badge badge-success font-medium gap-2">
                    <div aria-label="success" class="status status-success"></div>
                    {m.dashboard_operational()}
                  </span>
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <span>{m.dashboard_storage()}</span>
                <div class="flex items-center gap-2">
                  <span class="badge badge-success font-medium gap-2">
                    <div aria-label="success" class="status status-success"></div>
                    {m.dashboard_operational()}
                  </span>
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <span>{m.dashboard_web_server()}</span>
                <div class="flex items-center gap-2">
                  <span class="badge badge-success font-medium gap-2">
                    <div aria-label="success" class="status status-success"></div>
                    {m.dashboard_operational()}
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

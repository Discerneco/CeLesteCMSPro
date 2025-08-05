<script>
  import { 
    Eye, 
    Globe,
    MessageSquare,
    Users,
    UploadCloud
  } from '@lucide/svelte';

  // Import i18n with modern Paraglide pattern
  import * as m from '$lib/paraglide/messages';
  
  // Get data from load function (Svelte 5 runes mode)
  let { data } = $props();
</script>

<!-- Page Header using CMS design tokens -->
<div class="cms-page-header mb-8">
  <div>
    <h1 class="cms-page-title">{m.dashboard_title()}</h1>
    <p class="cms-page-subtitle">{m.dashboard_welcome()}</p>
  </div>
</div>

<!-- Stats Row -->
<div class="cms-grid-stats mb-8">
  <!-- Stats Cards using CMS design tokens -->
  <div class="cms-card">
    <div class="cms-card-body">
      <div class="flex items-center justify-between">
        <Globe class="text-primary h-8 w-8" />
        {#if data.stats.sinceLastSession.sites > 0}
          <span class="badge badge-soft badge-success">+{data.stats.sinceLastSession.sites}</span>
        {/if}
      </div>
      <div class="mt-4">
        <h3 class="text-2xl font-bold">{data.stats.total.sites}</h3>
        <p class="text-sm text-base-content/60">{m.dashboard_stats_active_sites()}</p>
      </div>
    </div>
  </div>
  
  <div class="cms-card">
    <div class="cms-card-body">
      <div class="flex items-center justify-between">
        <MessageSquare class="text-primary h-8 w-8" />
        {#if data.stats.sinceLastSession.posts > 0}
          <span class="badge badge-soft badge-success">+{data.stats.sinceLastSession.posts}</span>
        {/if}
      </div>
      <div class="mt-4">
        <h3 class="text-2xl font-bold">{data.stats.total.posts}</h3>
        <p class="text-sm text-base-content/60">{m.dashboard_stats_posts()}</p>
      </div>
    </div>
  </div>
  
  <div class="cms-card">
    <div class="cms-card-body">
      <div class="flex items-center justify-between">
        <Users class="text-primary h-8 w-8" />
        {#if data.stats.sinceLastSession.users > 0}
          <span class="badge badge-soft badge-success">+{data.stats.sinceLastSession.users}</span>
        {/if}
      </div>
      <div class="mt-4">
        <h3 class="text-2xl font-bold">{data.stats.total.users}</h3>
        <p class="text-sm text-base-content/60">{m.dashboard_stats_users()}</p>
      </div>
    </div>
  </div>
  
  <div class="cms-card">
    <div class="cms-card-body">
      <div class="flex items-center justify-between">
        <UploadCloud class="text-primary h-8 w-8" />
        {#if data.stats.sinceLastSession.media > 0}
          <span class="badge badge-soft badge-success">+{data.stats.sinceLastSession.media}</span>
        {/if}
      </div>
      <div class="mt-4">
        <h3 class="text-2xl font-bold">{data.stats.total.media}</h3>
        <p class="text-sm text-base-content/60">{m.dashboard_stats_media_files()}</p>
      </div>
    </div>
  </div>
</div>

<!-- Posts and Activity Sections -->
<div class="cms-grid-content mb-6">
  <!-- Recent Posts -->
  <div class="cms-card md:col-span-2">
    <div class="cms-card-body">
      <div class="flex justify-between items-center">
        <h2 class="cms-card-title">{m.dashboard_recent_posts()}</h2>
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
  <div class="cms-card">
    <div class="cms-card-body">
      <h2 class="cms-card-title">{m.dashboard_recent_activity()}</h2>
      
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
  <div class="cms-card">
    <div class="cms-card-body">
      <h2 class="cms-card-title">{m.dashboard_system_status()}</h2>
      
      <div class="alert alert-success alert-soft mb-4">
        <span>{m.dashboard_system_operational()}</span>
      </div>
      
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span>{m.dashboard_database()}</span>
          <div class="flex items-center gap-2">
            <span class="badge badge-soft badge-success font-medium gap-2">
              <div aria-label="success" class="status status-success"></div>
              {m.dashboard_operational()}
            </span>
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <span>{m.dashboard_api()}</span>
          <div class="flex items-center gap-2">
            <span class="badge badge-soft badge-success font-medium gap-2">
              <div aria-label="success" class="status status-success"></div>
              {m.dashboard_operational()}
            </span>
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <span>{m.dashboard_storage()}</span>
          <div class="flex items-center gap-2">
            <span class="badge badge-soft badge-success font-medium gap-2">
              <div aria-label="success" class="status status-success"></div>
              {m.dashboard_operational()}
            </span>
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <span>{m.dashboard_web_server()}</span>
          <div class="flex items-center gap-2">
            <span class="badge badge-soft badge-success font-medium gap-2">
              <div aria-label="success" class="status status-success"></div>
              {m.dashboard_operational()}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
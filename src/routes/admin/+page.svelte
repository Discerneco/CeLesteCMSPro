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

  // Basic state management
  let isDarkMode = false;
  let isSidebarOpen = true;
  let selectedLanguage = 'en';
  
  function toggleTheme() {
    isDarkMode = !isDarkMode;
  }
  
  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
  }
  
  function toggleLanguage() {
    selectedLanguage = selectedLanguage === 'en' ? 'pt' : 'en';
  }
</script>

<div class={`h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-950 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
  <!-- Header -->
  <header class={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b p-4 flex items-center justify-between sticky top-0 z-10`}>
    <div class="flex items-center">
      <button 
        on:click={toggleSidebar} 
        class={`p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} mr-2`}
      >
        <Menu class="h-5 w-5" />
      </button>
      <h1 class="text-xl font-bold">CeLeste CMS</h1>
    </div>
    
    <div class="flex items-center gap-4">
      <button 
        on:click={toggleLanguage}
        class={`px-3 py-1 rounded-md text-sm font-medium ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
      >
        {selectedLanguage === 'en' ? 'EN' : 'PT'}
      </button>
      
      <button 
        on:click={toggleTheme} 
        class={`p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
      >
        {#if isDarkMode}
          <Sun class="h-5 w-5" />
        {:else}
          <Moon class="h-5 w-5" />
        {/if}
      </button>
      
      <div class="relative">
        <button class="flex items-center gap-2">
          <div class={`h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white`}>
            A
          </div>
        </button>
      </div>
    </div>
  </header>
  
  <div class="flex flex-1 overflow-hidden">
    <!-- Sidebar -->
    {#if isSidebarOpen}
      <aside class={`w-64 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-r overflow-y-auto`}>
        <div class="p-4">
          <nav class="space-y-1">
            <a
              href="/admin"
              class={`flex items-center gap-3 px-3 py-2 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200`}
            >
              <PieChart class="h-5 w-5" />
              <span class="text-sm font-medium">{selectedLanguage === 'en' ? 'Dashboard' : 'Painel'}</span>
            </a>
            
            <a
              href="/admin/sites"
              class={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
            >
              <Globe class="h-5 w-5" />
              <span class="text-sm font-medium">Sites</span>
            </a>
            
            <a
              href="/admin/templates"
              class={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
            >
              <Layout class="h-5 w-5" />
              <span class="text-sm font-medium">Templates</span>
            </a>
            
            <a
              href="/admin/content"
              class={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
            >
              <MessageSquare class="h-5 w-5" />
              <span class="text-sm font-medium">{selectedLanguage === 'en' ? 'Content' : 'Conteúdo'}</span>
            </a>
            
            <a
              href="/admin/pages"
              class={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
            >
              <FileText class="h-5 w-5" />
              <span class="text-sm font-medium">{selectedLanguage === 'en' ? 'Pages' : 'Páginas'}</span>
            </a>
            
            <a
              href="/admin/media"
              class={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
            >
              <UploadCloud class="h-5 w-5" />
              <span class="text-sm font-medium">{selectedLanguage === 'en' ? 'Media' : 'Mídia'}</span>
            </a>
            
            <a
              href="/admin/users"
              class={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
            >
              <Users class="h-5 w-5" />
              <span class="text-sm font-medium">{selectedLanguage === 'en' ? 'Users' : 'Usuários'}</span>
            </a>
            
            <a
              href="/admin/plugins"
              class={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
            >
              <Database class="h-5 w-5" />
              <span class="text-sm font-medium">Plugins</span>
            </a>
            
            <a
              href="/admin/settings"
              class={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
            >
              <Settings class="h-5 w-5" />
              <span class="text-sm font-medium">{selectedLanguage === 'en' ? 'Settings' : 'Configurações'}</span>
            </a>
          </nav>
        </div>
        
        <div class={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4 mt-auto`}>
          <a
            href="/admin/help"
            class={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
          >
            <HelpCircle class="h-5 w-5" />
            <span class="text-sm font-medium">{selectedLanguage === 'en' ? 'Help' : 'Ajuda'}</span>
          </a>
          
          <a
            href="/admin/logout"
            class={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
          >
            <LogOut class="h-5 w-5" />
            <span class="text-sm font-medium">{selectedLanguage === 'en' ? 'Logout' : 'Sair'}</span>
          </a>
        </div>
      </aside>
    {/if}
    
    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-6">
      <h2 class="text-2xl font-bold mb-6">{selectedLanguage === 'en' ? 'Dashboard' : 'Painel'}</h2>
      <p class="text-gray-500 dark:text-gray-400 mb-8">{selectedLanguage === 'en' ? 'Welcome to CeLeste CMS administration.' : 'Bem-vindo à administração do CeLeste CMS.'}</p>
      
      <!-- Stats Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Stats Cards -->
        <div class={`rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} p-6`}>
          <div class="flex items-center justify-between">
            <Globe class="h-8 w-8 text-indigo-600" />
            <span class={`text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>
              +1
            </span>
          </div>
          <div class="mt-4">
            <h3 class="text-2xl font-bold">3</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{selectedLanguage === 'en' ? 'Active Sites' : 'Sites Ativos'}</p>
          </div>
        </div>
        
        <div class={`rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} p-6`}>
          <div class="flex items-center justify-between">
            <MessageSquare class="h-8 w-8 text-green-600" />
            <span class={`text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>
              +12
            </span>
          </div>
          <div class="mt-4">
            <h3 class="text-2xl font-bold">48</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{selectedLanguage === 'en' ? 'Content Items' : 'Itens de Conteúdo'}</p>
          </div>
        </div>
        
        <div class={`rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} p-6`}>
          <div class="flex items-center justify-between">
            <Users class="h-8 w-8 text-amber-600" />
            <span class={`text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>
              +3
            </span>
          </div>
          <div class="mt-4">
            <h3 class="text-2xl font-bold">16</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{selectedLanguage === 'en' ? 'Users' : 'Usuários'}</p>
          </div>
        </div>
        
        <div class={`rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} p-6`}>
          <div class="flex items-center justify-between">
            <UploadCloud class="h-8 w-8 text-purple-600" />
            <span class={`text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>
              +28
            </span>
          </div>
          <div class="mt-4">
            <h3 class="text-2xl font-bold">164</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{selectedLanguage === 'en' ? 'Media Files' : 'Arquivos de Mídia'}</p>
          </div>
        </div>
      </div>
      
      <!-- System Status Section -->
      <div class="grid grid-cols-1 gap-6 mb-6">
        <div class={`rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} overflow-hidden`}>
          <div class={`p-4 flex justify-between items-center border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 class="font-medium">{selectedLanguage === 'en' ? 'System Status' : 'Status do Sistema'}</h3>
          </div>
          <div class="p-4">
            <div class={`mb-4 p-4 rounded-md ${isDarkMode ? 'bg-green-900/30 border border-green-800' : 'bg-green-100 border border-green-200'}`}>
              <p class={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-800'}`}>
                {selectedLanguage === 'en' ? 'All systems operational. CeLeste CMS v0.1' : 'Todos os sistemas operacionais. CeLeste CMS v0.1'}
              </p>
            </div>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="font-medium text-sm">{selectedLanguage === 'en' ? 'Database' : 'Banco de Dados'}</span>
                <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>
                  <span class="w-2 h-2 mr-1.5 rounded-full bg-green-400"></span>
                  {selectedLanguage === 'en' ? 'Operational' : 'Operacional'}
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="font-medium text-sm">{selectedLanguage === 'en' ? 'Media Storage' : 'Armazenamento de Mídia'}</span>
                <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>
                  <span class="w-2 h-2 mr-1.5 rounded-full bg-green-400"></span>
                  {selectedLanguage === 'en' ? 'Operational' : 'Operacional'}
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="font-medium text-sm">{selectedLanguage === 'en' ? 'API Services' : 'Serviços de API'}</span>
                <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>
                  <span class="w-2 h-2 mr-1.5 rounded-full bg-green-400"></span>
                  {selectedLanguage === 'en' ? 'Operational' : 'Operacional'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Content and Activity Sections -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <!-- Recent Content -->
        <div class={`rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} overflow-hidden md:col-span-2`}>
          <div class={`p-4 flex justify-between items-center border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 class="font-medium">{selectedLanguage === 'en' ? 'Recent Content' : 'Conteúdo Recente'}</h3>
            <a href="#" class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              {selectedLanguage === 'en' ? 'View all' : 'Ver todos'}
            </a>
          </div>
          <div class="p-4 space-y-3">
            <!-- Content Items -->
            <div class={`p-3 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} mb-2`}>
              <h4 class="font-medium">Summer Event Page</h4>
              <div class="flex justify-between mt-1">
                <p class="text-xs text-gray-500 dark:text-gray-400">templereunion.org</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Today, 10:30 AM</p>
              </div>
            </div>
            
            <div class={`p-3 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} mb-2`}>
              <h4 class="font-medium">About Us</h4>
              <div class="flex justify-between mt-1">
                <p class="text-xs text-gray-500 dark:text-gray-400">discerneco.com</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Yesterday, 3:45 PM</p>
              </div>
            </div>
            
            <div class={`p-3 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} mb-2`}>
              <h4 class="font-medium">Contact Information</h4>
              <div class="flex justify-between mt-1">
                <p class="text-xs text-gray-500 dark:text-gray-400">templereunion.org</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">May 10, 2025</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recent Activity -->
        <div class={`rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} overflow-hidden`}>
          <div class={`p-4 flex justify-between items-center border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 class="font-medium">{selectedLanguage === 'en' ? 'Recent Activity' : 'Atividade Recente'}</h3>
          </div>
          <div class="p-4 space-y-2">
            <!-- Activity Items -->
            <div class={`p-3 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} mb-2`}>
              <div class="flex items-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 mr-3">
                  <Eye class="h-4 w-4" />
                </div>
                <div>
                  <p class="text-sm font-medium">Content updated</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Today, 10:30 AM</p>
                </div>
              </div>
            </div>
            
            <div class={`p-3 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} mb-2`}>
              <div class="flex items-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center bg-green-100 text-green-600 mr-3">
                  <FileText class="h-4 w-4" />
                </div>
                <div>
                  <p class="text-sm font-medium">New page created</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Yesterday, 3:45 PM</p>
                </div>
              </div>
            </div>
            
            <div class={`p-3 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} mb-2`}>
              <div class="flex items-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center bg-amber-100 text-amber-600 mr-3">
                  <Settings class="h-4 w-4" />
                </div>
                <div>
                  <p class="text-sm font-medium">Settings changed</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">May 10, 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>

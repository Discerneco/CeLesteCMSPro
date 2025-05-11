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

  // State management with Svelte 5 runes
  let isDarkMode = $state(false);
  let isSidebarOpen = $state(true);
  let selectedLanguage = $state('en');
  
  function handleThemeToggle() {
    isDarkMode = !isDarkMode;
  }
  
  function handleSidebarToggle() {
    isSidebarOpen = !isSidebarOpen;
  }
  
  function handleLanguageToggle() {
    selectedLanguage = selectedLanguage === 'en' ? 'pt' : 'en';
  }
</script>

<div class={`h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-950 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
  <!-- Header -->
  <header class={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b p-4 flex items-center justify-between sticky top-0 z-10`}>
    <div class="flex items-center">
      <button 
        onclick={handleSidebarToggle} 
        class={`p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} mr-2`}
      >
        <Menu class="h-5 w-5" />
      </button>
      <h1 class="text-xl font-bold">CeLeste CMS</h1>
    </div>
    
    <div class="flex items-center gap-4">
      <button 
        onclick={handleLanguageToggle}
        class={`px-3 py-1 rounded-md text-sm font-medium ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
      >
        {selectedLanguage === 'en' ? 'EN' : 'PT'}
      </button>
      
      <button 
        onclick={handleThemeToggle} 
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
            <SidebarItem 
              icon={PieChart} 
              label={selectedLanguage === 'en' ? 'Dashboard' : 'Painel'} 
              href="/admin" 
              isActive={true} 
              isDarkMode={isDarkMode} 
            />
            
            <SidebarItem 
              icon={Globe} 
              label="Sites" 
              href="/admin/sites" 
              isDarkMode={isDarkMode} 
            />
            
            <SidebarItem 
              icon={Layout} 
              label="Templates" 
              href="/admin/templates" 
              isDarkMode={isDarkMode} 
            />
            
            <SidebarItem 
              icon={MessageSquare} 
              label={selectedLanguage === 'en' ? 'Posts' : 'Posts'} 
              href="/admin/posts" 
              isDarkMode={isDarkMode} 
            />
            
            <SidebarItem 
              icon={FileText} 
              label={selectedLanguage === 'en' ? 'Pages' : 'Páginas'} 
              href="/admin/pages" 
              isDarkMode={isDarkMode} 
            />
            
            <SidebarItem 
              icon={UploadCloud} 
              label={selectedLanguage === 'en' ? 'Media' : 'Mídia'} 
              href="/admin/media" 
              isDarkMode={isDarkMode} 
            />
            
            <SidebarItem 
              icon={Users} 
              label={selectedLanguage === 'en' ? 'Users' : 'Usuários'} 
              href="/admin/users" 
              isDarkMode={isDarkMode} 
            />
            
            <SidebarItem 
              icon={Database} 
              label="Plugins" 
              href="/admin/plugins" 
              isDarkMode={isDarkMode} 
            />
            
            <SidebarItem 
              icon={Settings} 
              label={selectedLanguage === 'en' ? 'Settings' : 'Configurações'} 
              href="/admin/settings" 
              isDarkMode={isDarkMode} 
            />
          </nav>
        </div>
        
        <div class={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4 mt-auto`}>
          <nav class="space-y-1">
            <SidebarItem 
              icon={HelpCircle} 
              label={selectedLanguage === 'en' ? 'Help' : 'Ajuda'} 
              href="/admin/help" 
              isDarkMode={isDarkMode} 
            />
            
            <SidebarItem 
              icon={LogOut} 
              label={selectedLanguage === 'en' ? 'Logout' : 'Sair'} 
              href="/admin/logout" 
              isDarkMode={isDarkMode} 
            />
          </nav>
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
        <StatCard 
          icon={Globe} 
          title={selectedLanguage === 'en' ? 'Active Sites' : 'Sites Ativos'} 
          value="3" 
          change="+1" 
          {isDarkMode} 
        />
        
        <StatCard 
          icon={MessageSquare} 
          title={selectedLanguage === 'en' ? 'Posts' : 'Posts'} 
          value="48" 
          change="+12" 
          {isDarkMode} 
        />
        
        <StatCard 
          icon={Users} 
          title={selectedLanguage === 'en' ? 'Users' : 'Usuários'} 
          value="16" 
          change="+3" 
          {isDarkMode} 
        />
        
        <StatCard 
          icon={UploadCloud} 
          title={selectedLanguage === 'en' ? 'Media Files' : 'Arquivos de Mídia'} 
          value="164" 
          change="+28" 
          {isDarkMode} 
        />
      </div>
      
      <!-- Posts and Activity Sections -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <!-- Recent Posts -->
        <Card 
          title={selectedLanguage === 'en' ? 'Recent Posts' : 'Posts Recentes'} 
          {isDarkMode} 
          className="md:col-span-2"
        >
          <svelte:fragment slot="actions">
            <a href="/admin/posts/new" class="text-sm px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
              {selectedLanguage === 'en' ? 'Add Post' : 'Adicionar Post'}
            </a>
          </svelte:fragment>
          <ContentItem 
            title="Venue selection finalized for the reunion" 
            site="Temple Reunion" 
            date="14/04/2025" 
            {isDarkMode} 
          />
          
          <ContentItem 
            title="Community Blog Launch" 
            site="Community Blog" 
            date="09/04/2025" 
            {isDarkMode} 
          />
          
          <ContentItem 
            title="New Portfolio Project" 
            site="Portfolio Site" 
            date="04/04/2025" 
            {isDarkMode} 
          />
        </Card>
        
        <!-- Recent Activity -->
        <Card title={selectedLanguage === 'en' ? 'Recent Activity' : 'Atividade Recente'} isDarkMode={isDarkMode}>
          <ActivityItem 
            type={selectedLanguage === 'en' ? 'User Login' : 'Login de Usuário'} 
            name="Maria Silva" 
            date="15/04/2025" 
            {isDarkMode} 
          />
          
          <ActivityItem 
            type={selectedLanguage === 'en' ? 'Post Published' : 'Post Publicado'} 
            name="News Article" 
            date="14/04/2025" 
            {isDarkMode} 
          />
          
          <ActivityItem 
            type={selectedLanguage === 'en' ? 'New User' : 'Novo Usuário'} 
            name="Carlos Mendes" 
            date="14/04/2025" 
            {isDarkMode} 
          />
          
          <a href="/admin/activity" class="text-indigo-600 dark:text-indigo-400 text-sm hover:underline block mt-4">
            {selectedLanguage === 'en' ? 'View all' : 'Ver todos'}
          </a>
        </Card>
      </div>
      
      <!-- System Status Section -->
      <div class="grid grid-cols-1 gap-6 mb-6">
        <Card title={selectedLanguage === 'en' ? 'System Status' : 'Status do Sistema'} isDarkMode={isDarkMode}>
          <div class={`mb-4 p-4 rounded-md ${isDarkMode ? 'bg-green-900/30 border border-green-800' : 'bg-green-100 border border-green-200'}`}>
            <p class={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-800'}`}>
              {selectedLanguage === 'en' ? 'All systems operational. CeLeste CMS v0.1' : 'Todos os sistemas operacionais. CeLeste CMS v0.1'}
            </p>
          </div>
          
          <div class="space-y-4">
            <StatusItem 
              name={selectedLanguage === 'en' ? 'Database' : 'Banco de Dados'} 
              status="operational" 
            />
            
            <StatusItem 
              name={selectedLanguage === 'en' ? 'Media Storage' : 'Armazenamento de Mídia'} 
              status="operational" 
            />
            
            <StatusItem 
              name={selectedLanguage === 'en' ? 'API Services' : 'Serviços de API'} 
              status="operational" 
            />
          </div>
        </Card>
      </div>
    </main>
  </div>
</div>

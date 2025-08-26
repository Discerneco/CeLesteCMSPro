<script>
  // Props with defaults
  export let variant = 'full';
  export let maxWidth = 'max-w-4xl';
  export let showSidebar = false;
  export let sidebarPosition = 'right';
  export let sidebarContent = null;
  export let context = null;

  // Get content from context (page content)
  $: content = context?.page?.content || 'Content goes here';
  
  // Sidebar content (can be customized)
  const defaultSidebarContent = `
    <div class="bg-gray-50 rounded-lg p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">About</h3>
      <p class="text-gray-600 text-sm leading-relaxed">
        Discover more content and insights on our website. 
        Follow us for the latest updates and articles.
      </p>
    </div>
    
    <div class="bg-gray-50 rounded-lg p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Posts</h3>
      <div class="space-y-3">
        <a href="./blog/" class="block text-gray-800 hover:text-blue-600 text-sm font-medium">
          View All Posts →
        </a>
      </div>
    </div>
    
    <div class="bg-gray-50 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h3>
      <a href="./contact/" class="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
        Contact Us
      </a>
    </div>
  `;

  // Format content (basic markdown-like formatting)
  function formatContent(content) {
    if (!content) return '';
    
    // Simple paragraph formatting
    let formatted = content
      .split('\n\n')
      .filter(p => p.trim())
      .map(p => {
        // Basic markdown-like heading support
        if (p.startsWith('# ')) {
          return `<h1 class="text-3xl font-bold text-gray-900 mb-6 mt-8">${p.slice(2)}</h1>`;
        }
        if (p.startsWith('## ')) {
          return `<h2 class="text-2xl font-bold text-gray-900 mb-4 mt-6">${p.slice(3)}</h2>`;
        }
        if (p.startsWith('### ')) {
          return `<h3 class="text-xl font-semibold text-gray-900 mb-3 mt-5">${p.slice(4)}</h3>`;
        }
        
        // Regular paragraphs
        return `<p class="text-gray-700 leading-relaxed mb-4">${p.trim()}</p>`;
      })
      .join('\n');
    
    // Basic link formatting [text](url) -> <a href="url">text</a>
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, 
      '<a href="$2" class="text-blue-600 hover:text-blue-700 underline">$1</a>');
    
    // Bold **text** -> <strong>text</strong>
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, 
      '<strong class="font-semibold">$1</strong>');
    
    // Italic *text* -> <em>text</em>
    formatted = formatted.replace(/\*([^*]+)\*/g, 
      '<em class="italic">$1</em>');
    
    return formatted;
  }
</script>

{#if variant === 'sidebar'}
  <!-- Content with sidebar layout -->
  <section class="py-16 bg-white">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {#if sidebarPosition === 'left'}
          <!-- Left sidebar -->
          <aside class="lg:col-span-1">
            <div class="sticky top-8">
              {@html sidebarContent || defaultSidebarContent}
            </div>
          </aside>
          
          <!-- Main content -->
          <main class="lg:col-span-3">
            <div class="prose prose-lg max-w-none">
              {@html formatContent(content)}
            </div>
          </main>
        {:else}
          <!-- Main content -->
          <main class="lg:col-span-3">
            <div class="prose prose-lg max-w-none">
              {@html formatContent(content)}
            </div>
          </main>
          
          <!-- Right sidebar (default) -->
          <aside class="lg:col-span-1">
            <div class="sticky top-8">
              {@html sidebarContent || defaultSidebarContent}
            </div>
          </aside>
        {/if}
      </div>
    </div>
  </section>
{:else if variant === 'narrow'}
  <!-- Narrow centered content -->
  <section class="py-16 bg-white">
    <div class="container mx-auto px-4">
      <div class="max-w-2xl mx-auto">
        <div class="prose prose-lg">
          {@html formatContent(content)}
        </div>
      </div>
    </div>
  </section>
{:else if variant === 'wide'}
  <!-- Wide content layout -->
  <section class="py-16 bg-white">
    <div class="px-4">
      <div class="max-w-7xl mx-auto">
        <div class="prose prose-lg max-w-none">
          {@html formatContent(content)}
        </div>
      </div>
    </div>
  </section>
{:else}
  <!-- Full width content (default) -->
  <section class="py-16 bg-white">
    <div class="container mx-auto px-4">
      <div class="{maxWidth} mx-auto">
        <div class="prose prose-lg max-w-none">
          {@html formatContent(content)}
        </div>
      </div>
    </div>
  </section>
{/if}

<style>
  /* Custom prose styles for better typography */
  :global(.prose h1) {
    @apply text-3xl font-bold text-gray-900 mb-6 mt-8;
  }
  
  :global(.prose h2) {
    @apply text-2xl font-bold text-gray-900 mb-4 mt-6;
  }
  
  :global(.prose h3) {
    @apply text-xl font-semibold text-gray-900 mb-3 mt-5;
  }
  
  :global(.prose p) {
    @apply text-gray-700 leading-relaxed mb-4;
  }
  
  :global(.prose a) {
    @apply text-blue-600 hover:text-blue-700 underline;
  }
  
  :global(.prose ul) {
    @apply list-disc list-inside mb-4 space-y-2;
  }
  
  :global(.prose ol) {
    @apply list-decimal list-inside mb-4 space-y-2;
  }
  
  :global(.prose li) {
    @apply text-gray-700;
  }
  
  :global(.prose blockquote) {
    @apply border-l-4 border-gray-300 pl-4 italic text-gray-600 my-6;
  }
  
  :global(.prose code) {
    @apply bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm;
  }
  
  :global(.prose pre) {
    @apply bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-6;
  }
  
  :global(.prose img) {
    @apply rounded-lg shadow-md my-6;
  }
</style>
<script>
  // Props with defaults
  export let variant = 'grid';
  export let limit = 6;
  export let featured = false;
  export let showAuthor = true;
  export let showDate = true;
  export let showExcerpt = true;
  export let columns = 3;
  export let title = '';
  export let subtitle = '';
  export let context = null;

  // Get posts from context
  $: posts = context?.posts || [];
  
  // Filter and limit posts
  $: filteredPosts = posts
    .filter(post => featured ? post.featured : true)
    .slice(0, limit);

  // Grid columns class
  $: gridClass = columns === 2 
    ? 'grid-cols-1 md:grid-cols-2' 
    : columns === 4 
    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'; // default 3

  // Format date
  function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  // Truncate text
  function truncate(text, length = 120) {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }
</script>

{#if filteredPosts.length > 0}
  <section class="py-16 bg-white">
    <div class="container mx-auto px-4">
      <!-- Section header -->
      {#if title || subtitle}
        <div class="text-center mb-12">
          {#if title}
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          {/if}
          {#if subtitle}
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
          {/if}
        </div>
      {/if}

      {#if variant === 'list'}
        <!-- List layout -->
        <div class="space-y-8 max-w-4xl mx-auto">
          {#each filteredPosts as post}
            <article class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-8 border border-gray-100">
              <div class="flex flex-col">
                <h3 class="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                  <a href="./blog/{post.slug}/">{post.title}</a>
                </h3>
                
                <!-- Meta information -->
                {#if showAuthor || showDate}
                  <div class="flex items-center text-sm text-gray-500 mb-4">
                    {#if showAuthor && post.author}
                      <span class="font-medium">{post.author}</span>
                    {/if}
                    {#if showAuthor && showDate && post.author}
                      <span class="mx-2">•</span>
                    {/if}
                    {#if showDate}
                      <time datetime={post.createdAt}>{formatDate(post.createdAt)}</time>
                    {/if}
                  </div>
                {/if}
                
                <!-- Excerpt -->
                {#if showExcerpt && post.excerpt}
                  <p class="text-gray-600 mb-4 leading-relaxed">{truncate(post.excerpt, 200)}</p>
                {/if}
                
                <!-- Read more link -->
                <div class="flex justify-end">
                  <a 
                    href="./blog/{post.slug}/"
                    class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Read More
                    <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </article>
          {/each}
        </div>
      {:else if variant === 'featured'}
        <!-- Featured layout with larger first post -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {#each filteredPosts as post, i}
            {#if i === 0}
              <!-- Featured post (large) -->
              <article class="lg:col-span-2 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <div class="p-8">
                  <h3 class="text-3xl font-bold text-gray-900 mb-4 hover:text-blue-600 transition-colors">
                    <a href="./blog/{post.slug}/">{post.title}</a>
                  </h3>
                  
                  {#if showAuthor || showDate}
                    <div class="flex items-center text-sm text-gray-500 mb-4">
                      {#if showAuthor && post.author}
                        <span class="font-medium">{post.author}</span>
                      {/if}
                      {#if showAuthor && showDate && post.author}
                        <span class="mx-2">•</span>
                      {/if}
                      {#if showDate}
                        <time datetime={post.createdAt}>{formatDate(post.createdAt)}</time>
                      {/if}
                    </div>
                  {/if}
                  
                  {#if showExcerpt && post.excerpt}
                    <p class="text-gray-600 mb-6 leading-relaxed text-lg">{truncate(post.excerpt, 300)}</p>
                  {/if}
                  
                  <a 
                    href="./blog/{post.slug}/"
                    class="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Read Article
                    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </a>
                </div>
              </article>
            {:else}
              <!-- Regular posts (smaller) -->
              <article class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden {i === 1 ? 'lg:col-span-1' : ''}">
                <div class="p-6">
                  <h3 class="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                    <a href="./blog/{post.slug}/">{post.title}</a>
                  </h3>
                  
                  {#if showDate}
                    <time class="text-sm text-gray-500 mb-3 block" datetime={post.createdAt}>
                      {formatDate(post.createdAt)}
                    </time>
                  {/if}
                  
                  {#if showExcerpt && post.excerpt}
                    <p class="text-gray-600 mb-4 text-sm leading-relaxed">{truncate(post.excerpt, 100)}</p>
                  {/if}
                  
                  <a 
                    href="./blog/{post.slug}/"
                    class="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Read More →
                  </a>
                </div>
              </article>
            {/if}
          {/each}
        </div>
      {:else}
        <!-- Grid layout (default) -->
        <div class="grid {gridClass} gap-8">
          {#each filteredPosts as post}
            <article class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-gray-100">
              <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                  <a href="./blog/{post.slug}/">{post.title}</a>
                </h3>
                
                <!-- Meta information -->
                {#if showAuthor || showDate}
                  <div class="flex items-center text-sm text-gray-500 mb-3">
                    {#if showAuthor && post.author}
                      <span class="font-medium">{post.author}</span>
                    {/if}
                    {#if showAuthor && showDate && post.author}
                      <span class="mx-2">•</span>
                    {/if}
                    {#if showDate}
                      <time datetime={post.createdAt}>{formatDate(post.createdAt)}</time>
                    {/if}
                  </div>
                {/if}
                
                <!-- Excerpt -->
                {#if showExcerpt && post.excerpt}
                  <p class="text-gray-600 mb-4 text-sm leading-relaxed">{truncate(post.excerpt, 120)}</p>
                {/if}
                
                <!-- Read more link -->
                <a 
                  href="./blog/{post.slug}/"
                  class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Read More
                  <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </a>
              </div>
            </article>
          {/each}
        </div>
      {/if}
      
      <!-- View all posts link -->
      {#if posts.length > limit}
        <div class="text-center mt-12">
          <a 
            href="./blog/"
            class="inline-flex items-center bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            View All Posts
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>
      {/if}
    </div>
  </section>
{/if}
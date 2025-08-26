<script>
  // Props with defaults
  export let variant = 'center';
  export let title = 'Welcome';
  export let subtitle = 'Your journey starts here';
  export let background = 'gradient';
  export let height = '60vh';
  export let buttonText = 'Get Started';
  export let buttonUrl = '/';

  // Dynamic styling based on props
  $: backgroundClass = background === 'gradient' 
    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
    : background === 'dark'
    ? 'bg-gray-900 text-white' 
    : background === 'light'
    ? 'bg-gray-100 text-gray-900'
    : 'bg-gradient-to-br from-blue-600 to-purple-600 text-white';
</script>

<section 
  class="relative flex items-center justify-center {backgroundClass}"
  style="min-height: {height};"
>
  {#if variant === 'left'}
    <!-- Left-aligned hero -->
    <div class="container mx-auto py-16">
      <div class="max-w-2xl">
        <h1 class="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          {title}
        </h1>
        {#if subtitle}
          <p class="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
            {subtitle}
          </p>
        {/if}
        {#if buttonText && buttonUrl}
          <a 
            href={buttonUrl}
            class="inline-block bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            {buttonText}
          </a>
        {/if}
      </div>
    </div>
  {:else if variant === 'split'}
    <!-- Split hero -->
    <div class="container mx-auto py-16">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 class="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {title}
          </h1>
          {#if subtitle}
            <p class="text-lg md:text-xl mb-8 opacity-90 leading-relaxed">
              {subtitle}
            </p>
          {/if}
          {#if buttonText && buttonUrl}
            <a 
              href={buttonUrl}
              class="inline-block bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              {buttonText}
            </a>
          {/if}
        </div>
        <div class="hidden lg:block">
          <div class="aspect-square bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
            <div class="text-6xl opacity-50">🚀</div>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <!-- Center-aligned hero (default) -->
    <div class="text-center py-16">
      <div class="max-w-4xl mx-auto container">
        <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          {title}
        </h1>
        {#if subtitle}
          <p class="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        {/if}
        {#if buttonText && buttonUrl}
          <a 
            href={buttonUrl}
            class="inline-block bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            {buttonText}
          </a>
        {/if}
      </div>
    </div>
  {/if}
</section>
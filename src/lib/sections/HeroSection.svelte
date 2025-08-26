<script>
  // Props with defaults
  export let variant = 'center';
  export let title = 'Welcome';
  export let subtitle = 'Your journey starts here';
  export let background = 'gradient';
  export let height = '60vh';
  export let buttonText = 'Get Started';
  export let buttonUrl = './';
  export let backgroundImage = null;
  export let context = null;

  // Dynamic styling based on props
  let backgroundClass = '';
  let textColorClass = 'text-white';
  
  $: {
    if (background === 'gradient') {
      backgroundClass = 'bg-gradient-to-br from-blue-600 to-purple-600';
      textColorClass = 'text-white';
    } else if (background === 'dark') {
      backgroundClass = 'bg-gray-900';
      textColorClass = 'text-white';
    } else if (background === 'light') {
      backgroundClass = 'bg-gray-100';
      textColorClass = 'text-gray-900';
    } else if (background === 'image' && backgroundImage) {
      backgroundClass = `bg-cover bg-center bg-no-repeat`;
      textColorClass = 'text-white';
    } else {
      // Default gradient
      backgroundClass = 'bg-gradient-to-br from-blue-600 to-purple-600';
      textColorClass = 'text-white';
    }
  }

  // Style based on height prop
  $: minHeightStyle = `min-height: ${height}`;
  
  // Background image style
  $: backgroundStyle = background === 'image' && backgroundImage 
    ? `background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${backgroundImage}'); ${minHeightStyle}`
    : minHeightStyle;
</script>

<section 
  class="relative flex items-center justify-center {backgroundClass} {textColorClass}"
  style={backgroundStyle}
>
  {#if variant === 'left'}
    <!-- Left-aligned hero -->
    <div class="container mx-auto px-4 py-16">
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
    <!-- Split hero with content on left, space for image on right -->
    <div class="container mx-auto px-4 py-16">
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
          <!-- Space for illustration/image -->
          <div class="aspect-square bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
            <div class="text-6xl opacity-50">🚀</div>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <!-- Center-aligned hero (default) -->
    <div class="text-center px-4 py-16">
      <div class="max-w-4xl mx-auto">
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
  
  <!-- Optional overlay for better text readability on image backgrounds -->
  {#if background === 'image' && backgroundImage}
    <div class="absolute inset-0 bg-black bg-opacity-40"></div>
    <div class="relative z-10 w-full">
      <!-- Content is rendered above with relative z-10 positioning -->
    </div>
  {/if}
</section>
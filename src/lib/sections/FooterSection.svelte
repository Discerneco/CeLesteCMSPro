<script>
  // Props with defaults
  export let variant = 'minimal';
  export let siteName = 'Site';
  export let showLinks = true;
  export let showSocial = false;
  export let showCopyright = true;
  export let customText = '';
  export let context = null;

  // Use site name from context if available
  $: displaySiteName = context?.site?.name || siteName;
  
  // Default navigation links
  const navLinks = [
    { title: 'Home', url: './' },
    { title: 'Blog', url: './blog/' },
    { title: 'About', url: './about/' },
    { title: 'Contact', url: './contact/' }
  ];

  // Social media links (configurable)
  const socialLinks = [
    { name: 'Twitter', url: '#', icon: 'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z' },
    { name: 'GitHub', url: '#', icon: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22' },
    { name: 'LinkedIn', url: '#', icon: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' }
  ];

  // Current year
  const currentYear = new Date().getFullYear();
</script>

{#if variant === 'full'}
  <!-- Full footer with sections -->
  <footer class="bg-gray-900 text-gray-300">
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Brand section -->
        <div class="lg:col-span-1">
          <h3 class="text-xl font-bold text-white mb-4">{displaySiteName}</h3>
          <p class="text-gray-400 mb-4 leading-relaxed">
            {customText || 'Building amazing websites with modern technology and clean design.'}
          </p>
          {#if showSocial}
            <div class="flex space-x-4">
              {#each socialLinks as social}
                <a 
                  href={social.url} 
                  class="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={social.icon}></path>
                  </svg>
                </a>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Quick links -->
        {#if showLinks}
          <div class="lg:col-span-1">
            <h4 class="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul class="space-y-2">
              {#each navLinks as link}
                <li>
                  <a href={link.url} class="text-gray-400 hover:text-white transition-colors">
                    {link.title}
                  </a>
                </li>
              {/each}
            </ul>
          </div>

          <!-- Resources -->
          <div class="lg:col-span-1">
            <h4 class="text-lg font-semibold text-white mb-4">Resources</h4>
            <ul class="space-y-2">
              <li><a href="./privacy/" class="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="./terms/" class="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="./sitemap.xml" class="text-gray-400 hover:text-white transition-colors">Sitemap</a></li>
            </ul>
          </div>
        {/if}

        <!-- Contact info -->
        <div class="lg:col-span-1">
          <h4 class="text-lg font-semibold text-white mb-4">Get in Touch</h4>
          <ul class="space-y-2 text-gray-400">
            <li>
              <a href="./contact/" class="hover:text-white transition-colors">
                Contact Us
              </a>
            </li>
            <li>
              <a href="mailto:hello@{displaySiteName.toLowerCase().replace(/\s+/g, '')}.com" class="hover:text-white transition-colors">
                Email Us
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Copyright bar -->
    {#if showCopyright}
      <div class="border-t border-gray-800">
        <div class="container mx-auto px-4 py-6">
          <div class="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© {currentYear} {displaySiteName}. All rights reserved.</p>
            <p class="mt-2 md:mt-0">
              Built with <span class="text-red-400">♥</span> using CeLeste CMS
            </p>
          </div>
        </div>
      </div>
    {/if}
  </footer>
{:else if variant === 'social'}
  <!-- Social-focused footer -->
  <footer class="bg-gray-100 text-gray-800">
    <div class="container mx-auto px-4 py-8">
      <div class="text-center">
        <h3 class="text-2xl font-bold mb-4">{displaySiteName}</h3>
        {#if customText}
          <p class="text-gray-600 mb-6 max-w-md mx-auto">{customText}</p>
        {/if}
        
        {#if showSocial}
          <div class="flex justify-center space-x-6 mb-6">
            {#each socialLinks as social}
              <a 
                href={social.url} 
                class="text-gray-600 hover:text-gray-900 transition-colors p-2"
                aria-label={social.name}
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={social.icon}></path>
                </svg>
              </a>
            {/each}
          </div>
        {/if}
        
        {#if showLinks}
          <div class="flex justify-center space-x-6 mb-6 text-sm">
            {#each navLinks as link}
              <a href={link.url} class="text-gray-600 hover:text-gray-900 transition-colors">
                {link.title}
              </a>
            {/each}
          </div>
        {/if}
        
        {#if showCopyright}
          <p class="text-sm text-gray-500">
            © {currentYear} {displaySiteName}. Built with CeLeste CMS.
          </p>
        {/if}
      </div>
    </div>
  </footer>
{:else}
  <!-- Minimal footer (default) -->
  <footer class="bg-gray-100 text-gray-800">
    <div class="container mx-auto px-4 py-6">
      <div class="text-center">
        {#if showCopyright}
          <p class="text-sm">
            © {currentYear} {displaySiteName}. 
            {#if customText}
              {customText}
            {:else}
              Built with CeLeste CMS.
            {/if}
          </p>
        {/if}
        
        {#if showLinks}
          <div class="flex justify-center space-x-4 mt-4 text-sm">
            <a href="./privacy/" class="text-gray-600 hover:text-gray-900 transition-colors">Privacy</a>
            <a href="./terms/" class="text-gray-600 hover:text-gray-900 transition-colors">Terms</a>
            <a href="./contact/" class="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
          </div>
        {/if}
      </div>
    </div>
  </footer>
{/if}
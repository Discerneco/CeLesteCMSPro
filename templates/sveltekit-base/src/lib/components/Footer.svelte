<script>
  import { base } from '$app/paths';
  
  // Props with defaults
  export let variant = 'minimal';
  export let siteName = 'Site';
  export let showLinks = true;
  export let showCopyright = true;
  export let customText = '';

  // Current year
  const currentYear = new Date().getFullYear();
</script>

{#if variant === 'full'}
  <!-- Full footer with sections -->
  <footer class="bg-gray-900 text-gray-300">
    <div class="container mx-auto py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Brand section -->
        <div class="lg:col-span-1">
          <h3 class="text-xl font-bold text-white mb-4">{siteName}</h3>
          <p class="text-gray-400 mb-4 leading-relaxed">
            {customText || 'Building amazing websites with modern technology and clean design.'}
          </p>
        </div>

        <!-- Quick links -->
        {#if showLinks}
          <div class="lg:col-span-1">
            <h4 class="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul class="space-y-2">
              <li><a href="{base}/" class="text-gray-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="{base}/blog" class="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="{base}/about" class="text-gray-400 hover:text-white transition-colors">About</a></li>
              <li><a href="{base}/contact" class="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <!-- Resources -->
          <div class="lg:col-span-1">
            <h4 class="text-lg font-semibold text-white mb-4">Resources</h4>
            <ul class="space-y-2">
              <li><a href="{base}/contact" class="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
        {/if}

        <!-- Contact info -->
        <div class="lg:col-span-1">
          <h4 class="text-lg font-semibold text-white mb-4">Get in Touch</h4>
          <ul class="space-y-2 text-gray-400">
            <li>
              <a href="{base}/contact" class="hover:text-white transition-colors">
                Contact Us
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Copyright bar -->
    {#if showCopyright}
      <div class="border-t border-gray-800">
        <div class="container mx-auto py-6">
          <div class="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© {currentYear} {siteName}. All rights reserved.</p>
            <p class="mt-2 md:mt-0">
              Built with <span class="text-red-400">♥</span> using CeLeste CMS
            </p>
          </div>
        </div>
      </div>
    {/if}
  </footer>
{:else}
  <!-- Minimal footer (default) -->
  <footer class="bg-gray-100 text-gray-800">
    <div class="container mx-auto py-6">
      <div class="text-center">
        {#if showCopyright}
          <p class="text-sm">
            © {currentYear} {siteName}. 
            {#if customText}
              {customText}
            {:else}
              Built with CeLeste CMS.
            {/if}
          </p>
        {/if}
        
        {#if showLinks}
          <div class="flex justify-center space-x-4 mt-4 text-sm">
            <a href="{base}/contact" class="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
          </div>
        {/if}
      </div>
    </div>
  </footer>
{/if}
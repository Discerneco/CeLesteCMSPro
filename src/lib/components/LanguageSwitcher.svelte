<!-- src/lib/components/LanguageSwitcher.svelte -->
<script lang="ts">
  import { Globe } from '@lucide/svelte';
  import { setLocale, getLocale, locales } from '$lib/paraglide/runtime.js';
  import { browser } from '$app/environment';
  
  // Language display names
  const languageNames = {
    'en': 'English',
    'pt-br': 'Português (BR)'
  } as const;
  
  // ✅ Svelte 5 runes - reactive state with hydration safety
  let currentLanguage = $state('');
  let isInitialized = $state(false);
  
  // ✅ Initialize locale safely after hydration
  $effect(() => {
    if (browser) {
      // Initialize from localStorage first if available for consistency
      const savedLanguage = localStorage.getItem('celestecms-language');
      if (savedLanguage && locales.includes(savedLanguage)) {
        currentLanguage = savedLanguage;
        // Ensure Paraglide runtime is also set
        if (getLocale() !== savedLanguage) {
          setLocale(savedLanguage);
        }
      } else {
        currentLanguage = getLocale();
      }
      isInitialized = true;
    }
  });
  
  // ✅ Update current language when locale changes (after initialization)
  $effect(() => {
    if (isInitialized) {
      const runtimeLocale = getLocale();
      if (currentLanguage !== runtimeLocale) {
        currentLanguage = runtimeLocale;
      }
    }
  });
  
  function switchLanguage(lang: string) {
    try {
      console.log('🌍 Switching language from', currentLanguage, 'to', lang);
      
      // ✅ Store in localStorage using Paraglide's expected key
      if (browser) {
        localStorage.setItem('PARAGLIDE_LOCALE', lang);
        localStorage.setItem('celestecms-language', lang); // Keep for backward compatibility
        console.log('💾 Saved language to localStorage:', lang);
      }
      
      // ✅ Update Paraglide locale - this will trigger reactivity throughout the app
      setLocale(lang as any);
      currentLanguage = lang;
      
      console.log('✅ Language switched successfully to:', lang);
      
    } catch (error) {
      console.error('❌ Language switch failed:', error);
    }
  }
</script>

<div class="dropdown dropdown-end">
  <button 
    tabindex="0" 
    class="btn btn-sm bg-base-200 border-base-300 hover:bg-base-300 m-1 flex items-center gap-2"
    aria-label="Choose language"
  >
    <Globe class="h-4 w-4" />
    <span>{!isInitialized ? '...' : (currentLanguage in languageNames ? languageNames[currentLanguage as keyof typeof languageNames] : currentLanguage)}</span>
  </button>
  <ul tabindex="0" role="menu" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
    {#each locales as lang}
      <li>
        <button 
          class="flex justify-between items-center {isInitialized && lang === currentLanguage ? 'active' : ''}"
          onclick={() => switchLanguage(lang)}
        >
          <span>{lang in languageNames ? languageNames[lang as keyof typeof languageNames] : lang}</span>
          {#if isInitialized && lang === currentLanguage}
            <span class="text-success">✓</span>
          {/if}
        </button>
      </li>
    {/each}
  </ul>
</div>

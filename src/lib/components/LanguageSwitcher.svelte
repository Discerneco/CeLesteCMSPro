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
  
  // ✅ Svelte 5 runes - reactive state
  let currentLanguage = $state(getLocale());
  
  // ✅ Update current language when locale changes
  $effect(() => {
    currentLanguage = getLocale();
  });
  
  function switchLanguage(lang: string) {
    try {
      console.log('🌍 Switching language from', currentLanguage, 'to', lang);
      
      // ✅ Store in localStorage FIRST for persistence across navigation
      if (browser) {
        localStorage.setItem('celestecms-language', lang);
        console.log('💾 Saved language to localStorage:', lang);
      }
      
      // ✅ Update Paraglide locale
      setLocale(lang as any);
      currentLanguage = lang;
      
      // ✅ Force page refresh for full language switch
      // This ensures all content updates properly (Paraglide 2.0 way)
      if (browser) {
        // Get current path without language prefix
        const currentPath = window.location.pathname;
        const pathWithoutLang = currentPath.replace(/^\/(en|pt-br)/, '') || '/';
        
        // Navigate to the same path with new language
        const newPath = lang === 'en' ? pathWithoutLang : `/${lang}${pathWithoutLang}`;
        window.location.href = newPath;
      }
      
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
    <span>{currentLanguage in languageNames ? languageNames[currentLanguage as keyof typeof languageNames] : currentLanguage}</span>
  </button>
  <ul tabindex="0" role="menu" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
    {#each locales as lang}
      <li>
        <button 
          class="flex justify-between items-center {lang === currentLanguage ? 'active' : ''}"
          onclick={() => switchLanguage(lang)}
        >
          <span>{lang in languageNames ? languageNames[lang as keyof typeof languageNames] : lang}</span>
          {#if lang === currentLanguage}
            <span class="text-success">✓</span>
          {/if}
        </button>
      </li>
    {/each}
  </ul>
</div>

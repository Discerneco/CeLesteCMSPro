<!-- src/lib/components/LanguageSwitcher.svelte -->
<script lang="ts">
  import { Globe } from '@lucide/svelte';
  import { setLocale, getLocale, locales } from '$lib/paraglide/runtime.js';
  
  // Language display names
  const languageNames = {
    'en': 'English',
    'pt-br': 'Português (BR)'
  } as const;
  
  // ✅ Simple state
  let currentLanguage = $state(getLocale());
  
  function switchLanguage(lang: string) {
    try {
      // Store in localStorage first for persistence
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('language', lang);
      }
      
      // ✅ Use setLocale with default behavior (page reload)
      // This is how Paraglide 2.0 is designed to work
      setLocale(lang as any);
      
    } catch (error) {
      console.error('❌ Language switch failed:', error);
    }
  }
</script>

<div class="dropdown dropdown-end">
  <button tabindex="0" class="btn btn-sm bg-base-200 border-base-300 hover:bg-base-300 m-1 flex items-center gap-2">
    <Globe class="h-4 w-4" />
    <span>{currentLanguage in languageNames ? languageNames[currentLanguage as keyof typeof languageNames] : currentLanguage}</span>
  </button>
  <ul tabindex="0" role="menu" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
    {#each locales as lang}
      <li>
        <button 
          class="{lang === currentLanguage ? 'active' : ''}"
          onclick={() => switchLanguage(lang)}
        >
          {lang in languageNames ? languageNames[lang as keyof typeof languageNames] : lang}
          {#if lang === currentLanguage}
            ✓
          {/if}
        </button>
      </li>
    {/each}
  </ul>
</div>

<!-- src/lib/components/LanguageSwitcher.svelte -->
<script lang="ts">
  import { Globe } from '@lucide/svelte';
  // ✅ Updated imports for Paraglide 2.0
  import { setLocale, getLocale, locales } from '$lib/paraglide/runtime.js';
  
  // Language display names
  const languageNames = {
    'en': 'English',
    'pt-br': 'Português (BR)'
  } as const;
  
  // ✅ Use Paraglide 2.0's getLocale function
  let currentLanguage = $state(getLocale());
  
  // ✅ Update current language when locale changes
  $effect(() => {
    currentLanguage = getLocale();
  });
  
  function switchLanguage(lang: string) {
    // ✅ Use setLocale instead of setLanguageTag
    setLocale(lang as any);
    
    // Store in localStorage for persistence
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('language', lang);
    }
    
    // Close the dropdown
    if (document.activeElement && 'blur' in document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }
  }
</script>

<div class="dropdown dropdown-end">
  <button tabindex="0" class="btn btn-sm bg-base-200 border-base-300 hover:bg-base-300 m-1 flex items-center gap-2">
    <Globe class="h-4 w-4" />
    <span>{currentLanguage in languageNames ? languageNames[currentLanguage as keyof typeof languageNames] : currentLanguage}</span>
  </button>
  <ul tabindex="0" role="menu" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
    <!-- ✅ Use locales instead of availableLanguageTags -->
    {#each locales as lang}
      <li>
        <button 
          class="{lang === currentLanguage ? 'active' : ''}"
          onclick={() => switchLanguage(lang)}
        >
          {lang in languageNames ? languageNames[lang as keyof typeof languageNames] : lang}
        </button>
      </li>
    {/each}
  </ul>
</div>

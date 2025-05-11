<!-- src/lib/components/LanguageSwitcher.svelte -->
<script lang="ts">
  import { Globe } from '@lucide/svelte';
  import { languageStore, setLanguage, availableLanguageTags, languageNames } from '$lib/i18n/language';
  import { m } from '$lib/i18n';
  
  // Use Svelte 5 runes
  let currentLanguage = $state('');
  let isOpen = $state(false);
  
  // Subscribe to the language store
  $effect(() => {
    const unsubscribe = languageStore.subscribe(value => {
      currentLanguage = value;
    });
    
    return () => {
      unsubscribe();
    };
  });
  
  function switchLanguage(lang: string) {
    setLanguage(lang);
    isOpen = false;
  }
  
  function toggleDropdown() {
    isOpen = !isOpen;
  }
  
  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (isOpen && target && !target.closest('.language-switcher')) {
      isOpen = false;
    }
  }
  
  $effect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<div class="relative language-switcher">
  <button 
    class="flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    aria-label="Switch language"
    onclick={toggleDropdown}
  >
    <Globe class="h-4 w-4" />
    <span>{currentLanguage in languageNames ? languageNames[currentLanguage as keyof typeof languageNames] : currentLanguage}</span>
  </button>
  
  {#if isOpen}
    <div class="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-20 border border-gray-200 dark:border-gray-700">
      {#each availableLanguageTags as lang}
        <button
          class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 {lang === currentLanguage ? 'bg-gray-100 dark:bg-gray-700' : ''}"
          onclick={() => switchLanguage(lang)}
        >
          {lang in languageNames ? languageNames[lang as keyof typeof languageNames] : lang}
        </button>
      {/each}
    </div>
  {/if}
</div>

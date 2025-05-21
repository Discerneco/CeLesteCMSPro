<!-- src/lib/components/LanguageSwitcher.svelte -->
<script lang="ts">
  import { Globe } from '@lucide/svelte';
  import { languageStore, setLanguage, availableLanguageTags, languageNames } from '$lib/i18n/language';
  
  // Use Svelte 5 runes
  let currentLanguage = $state('');
  
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
    
    // Close the dropdown by removing focus from the currently focused element
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
    {#each availableLanguageTags as lang}
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

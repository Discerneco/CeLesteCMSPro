<!-- src/lib/components/LanguageSwitcher.svelte -->
<script lang="ts">
  import { Globe } from '@lucide/svelte';
  import { languageStore, setLanguage, availableLanguageTags, languageNames } from '$lib/i18n/language';
  
  // Use Svelte 5 runes
  let currentLanguage = $state('');
  let detailsElement = $state<HTMLDetailsElement | null>(null);
  
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
    
    // Close the dropdown
    if (detailsElement) {
      detailsElement.open = false;
    }
  }
</script>

<details 
  bind:this={detailsElement}
  class="dropdown dropdown-end"
>
  <summary class="btn btn-sm bg-base-200 border-base-300 hover:bg-base-300 m-1 flex items-center gap-2">
    <Globe class="h-4 w-4" />
    <span>{currentLanguage in languageNames ? languageNames[currentLanguage as keyof typeof languageNames] : currentLanguage}</span>
  </summary>
  <ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
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
</details>

#!/usr/bin/env node

/**
 * Script to fix the LanguageSwitcher component for proper Paraglide 2.0 integration
 */

const fs = require('fs');
const path = require('path');

const COMPONENT_PATH = './src/lib/components/LanguageSwitcher.svelte';

const FIXED_COMPONENT = `<!-- src/lib/components/LanguageSwitcher.svelte -->
<script lang="ts">
  import { Globe } from '@lucide/svelte';
  import { getLocale, locales, localizeHref } from '$lib/paraglide/runtime';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  
  // Language display names
  const languageNames = {
    'en': 'English',
    'pt-br': 'Português (BR)'
  } as const;
  
  // ✅ Simple reactive state - trust Paraglide strategy system
  let currentLanguage = $state(getLocale());
  
  // ✅ React to Paraglide runtime changes
  $effect(() => {
    currentLanguage = getLocale();
  });
  
  // ✅ Simple language switching using localizeHref
  function switchLanguage(targetLocale: string) {
    // Generate correct URL for target language
    const localizedUrl = localizeHref($page.url.pathname, { 
      locale: targetLocale 
    });
    
    // Navigate to localized URL - strategy system handles the rest
    goto(localizedUrl);
  }
</script>

<!-- Clean DaisyUI dropdown -->
<div class="dropdown dropdown-end">
  <div tabindex="0" role="button" class="btn btn-sm btn-ghost gap-2">
    <Globe class="h-4 w-4" />
    <span>
      {currentLanguage in languageNames 
        ? languageNames[currentLanguage as keyof typeof languageNames] 
        : currentLanguage}
    </span>
  </div>
  
  <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box w-52 p-2 shadow">
    {#each locales as locale}
      <li>
        <button 
          class="flex justify-between items-center"
          class:active={locale === currentLanguage}
          onclick={() => switchLanguage(locale)}
        >
          <span>
            {locale in languageNames 
              ? languageNames[locale as keyof typeof languageNames] 
              : locale}
          </span>
          {#if locale === currentLanguage}
            <span class="text-success">✓</span>
          {/if}
        </button>
      </li>
    {/each}
  </ul>
</div>`;

console.log('🔧 Fixing LanguageSwitcher component...');

try {
  // Backup original file
  if (fs.existsSync(COMPONENT_PATH)) {
    const backupPath = COMPONENT_PATH + '.backup';
    fs.copyFileSync(COMPONENT_PATH, backupPath);
    console.log('💾 Original component backed up to:', backupPath);
  }
  
  // Write fixed component
  fs.writeFileSync(COMPONENT_PATH, FIXED_COMPONENT);
  console.log('✅ LanguageSwitcher component fixed!');
  
  console.log('\n🎯 What was fixed:');
  console.log('  - Removed manual URL detection');
  console.log('  - Removed force synchronization');
  console.log('  - Simplified to trust Paraglide strategy system');
  console.log('  - Clean DaisyUI dropdown implementation');
  
  console.log('\n🚀 Next steps:');
  console.log('  1. pnpm dev');
  console.log('  2. Test language switching at http://localhost:5173/admin/login');
  console.log('  3. Check debug info shows synced state');
  
} catch (error) {
  console.error('❌ Error fixing component:', error);
}

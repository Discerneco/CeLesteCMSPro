# Internationalization & Language Guide for CeLesteCMS Pro

This guide explains how to implement and use internationalization (i18n) in CeLesteCMS Pro using a hybrid approach with Svelte 5 runes and SvelteKit stores for optimal reactivity and compatibility.

## Table of Contents

1. [Overview](#overview)
2. [Project Setup](#project-setup)
3. [Configuration](#configuration)
4. [Message Organization](#message-organization)
5. [SvelteKit Integration](#sveltekit-integration)
6. [Using Messages in Components](#using-messages-in-components)
7. [Language Detection and Persistence](#language-detection-and-persistence)
8. [Build Integration](#build-integration)
9. [Best Practices](#best-practices)
10. [Examples](#examples)

## Overview

CeLesteCMS Pro uses a hybrid approach for internationalization that combines:

- **Svelte 5 runes** for component-level reactivity
- **Svelte stores** for cross-component state management
- **JSON message files** for language content
- Support for multiple languages (currently English and Brazilian Portuguese)
- Full compatibility with Svelte 5

## Project Setup

### Required Packages

The following packages are already installed in CeLesteCMS Pro:

```bash
npm install @inlang/paraglide-js
```

For development, you may also need:

```bash
npm install -D @inlang/sdk
```

## Configuration

Create an `inlang.config.js` file in the project root:

```javascript
// inlang.config.js
import { defineConfig } from "@inlang/sdk"

export default defineConfig({
  sourceLanguageTag: "en",
  languageTags: ["en", "pt-br"],
  modules: [
    // Plugin for message extraction
    "https://cdn.jsdelivr.net/npm/@inlang/plugin-json@latest/dist/index.js",
    // SvelteKit integration
    "https://cdn.jsdelivr.net/npm/@inlang/sdk-js-adapter@latest/dist/index.js"
  ],
  // Where to store message files
  pathPattern: "./src/lib/i18n/messages/{languageTag}.json"
})
```

## Message Organization

### Directory Structure

Messages should be organized in JSON files:

```
src/
└── lib/
    └── i18n/
        ├── index.js        # Main export file
        ├── language.js     # Language store
        └── messages/
            ├── en.json     # English messages
            └── pt-br.json  # Brazilian Portuguese messages
```

### Message Format

Message files should use a structured JSON format:

```json
// src/lib/i18n/messages/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome to CeLeste CMS administration.",
    "stats": {
      "activeSites": "Active Sites",
      "posts": "Posts",
      "users": "Users",
      "mediaFiles": "Media Files"
    }
  },
  "sidebar": {
    "dashboard": "Dashboard",
    "sites": "Sites",
    "templates": "Templates",
    "posts": "Posts",
    "pages": "Pages",
    "media": "Media",
    "users": "Users",
    "plugins": "Plugins",
    "settings": "Settings",
    "help": "Help",
    "logout": "Logout"
  }
}
```

```json
// src/lib/i18n/messages/pt-br.json
{
  "common": {
    "save": "Salvar",
    "cancel": "Cancelar",
    "delete": "Excluir",
    "edit": "Editar"
  },
  "dashboard": {
    "title": "Painel",
    "welcome": "Bem-vindo à administração do CeLeste CMS.",
    "stats": {
      "activeSites": "Sites Ativos",
      "posts": "Posts",
      "users": "Usuários",
      "mediaFiles": "Arquivos de Mídia"
    }
  },
  "sidebar": {
    "dashboard": "Painel",
    "sites": "Sites",
    "templates": "Templates",
    "posts": "Posts",
    "pages": "Páginas",
    "media": "Mídia",
    "users": "Usuários",
    "plugins": "Plugins",
    "settings": "Configurações",
    "help": "Ajuda",
    "logout": "Sair"
  }
}
```

## SvelteKit Integration

### Language Store

Create a language store to manage the current language:

```javascript
// src/lib/i18n/language.js
import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { availableLanguageTags, sourceLanguageTag } from './generated/runtime';

// Get initial language from localStorage or default to source language
const getInitialLanguage = () => {
  if (browser) {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage && availableLanguageTags.includes(storedLanguage)) {
      return storedLanguage;
    }
  }
  return sourceLanguageTag;
};

// Create a writable store
const languageStore = writable(getInitialLanguage());

// Export a function to get the current language
export const language = () => {
  let currentLanguage;
  languageStore.subscribe(value => {
    currentLanguage = value;
  })();
  return currentLanguage;
};

// Export a function to set the language
export const setLanguage = (newLanguage) => {
  if (availableLanguageTags.includes(newLanguage)) {
    languageStore.set(newLanguage);
    if (browser) {
      localStorage.setItem('language', newLanguage);
    }
  } else {
    console.error(`Language ${newLanguage} is not available`);
  }
};

// Export the store for reactive use
export const languageTag = languageStore;
```

### Main Export File

Create an index file to export a reactive messages store:

```typescript
// src/lib/i18n/index.ts
import { derived } from 'svelte/store';
import { languageStore } from './language';
import en from './messages/en.json';
import ptBr from './messages/pt-br.json';

const messagesMap: Record<string, typeof en> = {
  'en': en,
  'pt-br': ptBr
};

// Export a derived store that updates when the language changes
export const messages = derived(languageStore, (lang: string) => messagesMap[lang] || messagesMap['en']);

// Re-export language functions
export * from './language';
```

### Server-Side Detection

Add language detection in SvelteKit hooks:

```javascript
// src/hooks.server.js
import { availableLanguageTags, sourceLanguageTag } from '$lib/i18n/generated/runtime';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  // Get preferred language from cookie or accept-language header
  const preferredLanguage = event.cookies.get('language') || 
    event.request.headers.get('accept-language')?.split(',')[0]?.split('-')[0] || 
    sourceLanguageTag;
  
  // Set language if it's available, otherwise use source language
  const language = availableLanguageTags.includes(preferredLanguage) 
    ? preferredLanguage 
    : sourceLanguageTag;
  
  // Make language available to load functions
  event.locals.language = language;
  
  // Resolve the request
  const response = await resolve(event);
  
  return response;
}
```

## Using Messages in Components

### With Svelte 5 Runes and Stores

```svelte
<script>
  import { messages, languageTag, setLanguage } from '$lib/i18n';
  
  // Use Svelte 5 runes for local state
  let currentLanguage = $state(languageTag);
  
  function toggleLanguage() {
    setLanguage(currentLanguage === 'en' ? 'pt-br' : 'en');
  }
</script>

<!-- Use $messages for reactive access to translations -->
<h1>{$messages.dashboard.title}</h1>
<p>{$messages.dashboard.welcome}</p>

<button on:click={toggleLanguage}>
  Switch to {currentLanguage === 'en' ? 'Portuguese' : 'English'}
</button>
```

### Language Switcher Component

Create a reusable language switcher:

```svelte
<!-- src/lib/components/LanguageSwitcher.svelte -->
<script lang="ts">
  import { Globe } from '@lucide/svelte';
  import { languageStore, setLanguage, availableLanguageTags, languageNames } from '$lib/i18n/language';
  
  // Use Svelte 5 runes for local state
  let currentLanguage = $state('');
  let isOpen = $state(false);
  
  // Subscribe to the language store with $effect
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
```

## Language Detection and Persistence

### Browser Detection

Paraglide can detect the user's preferred language from browser settings:

```javascript
// Detect browser language
const detectBrowserLanguage = () => {
  if (browser) {
    const browserLang = navigator.language.split('-')[0];
    if (availableLanguageTags.includes(browserLang)) {
      return browserLang;
    }
  }
  return sourceLanguageTag;
};
```

### URL-Based Language

For shareable links with language preferences:

```javascript
// In a +page.js or +layout.js file
export function load({ url }) {
  const langParam = url.searchParams.get('lang');
  if (langParam && availableLanguageTags.includes(langParam)) {
    return {
      lang: langParam
    };
  }
  return {};
}
```

### Persisting Language Choice

Store language preference in localStorage:

```javascript
// Already implemented in the language store
if (browser) {
  localStorage.setItem('language', newLanguage);
}
```

## Build Integration

Paraglide works with Vite and SvelteKit's build process. Messages are compiled at build time for optimal performance.

Add a build step to your package.json:

```json
"scripts": {
  "paraglide:compile": "paraglide-js compile",
  "build": "paraglide-js compile && vite build"
}
```

## Best Practices

### General Guidelines

1. **Structured Messages**: Group messages by feature or component
2. **Consistent Keys**: Use consistent naming for message keys
3. **Avoid String Concatenation**: Use message parameters instead
4. **Fallback to Source Language**: Always provide a fallback
5. **Lazy Loading**: Consider lazy loading messages for large applications
6. **Use Type Safety**: Leverage TypeScript for type-safe message access
7. **Separate UI from Text**: Keep UI logic separate from translatable text

### Svelte 5 Runes Compatibility

1. **Component-Level Runes**: Use `$state` and `$effect` for component-level reactivity
2. **Cross-Component State**: Use Svelte stores for shared state across components
3. **Store Auto-Subscription**: Use the `$messages` syntax in templates for reactivity
4. **Explicit Types**: Always type your parameters to avoid TypeScript errors
5. **Avoid Direct Runes Import**: Don't import runes directly in .ts files, use them in .svelte files
6. **Reactive Subscriptions**: Use `$effect` for subscribing to stores in components
7. **Clean Unsubscribe**: Always return a cleanup function from `$effect` when subscribing

## Examples

### Example 1: Dashboard Page

```svelte
<!-- src/routes/admin/+page.svelte -->
<script>
  import { messages, languageTag } from '$lib/i18n';
  import { Globe, Sun, Moon, Menu } from '@lucide/svelte';
  import Card from '$lib/components/Card.svelte';
  import StatCard from '$lib/components/StatCard.svelte';
  import SidebarItem from '$lib/components/SidebarItem.svelte';
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
  
  // State management with Svelte 5 runes
  let isDarkMode = $state(false);
  let isSidebarOpen = $state(true);
  let currentLanguage = $state(languageTag);
  
  function handleThemeToggle() {
    isDarkMode = !isDarkMode;
  }
  
  function handleSidebarToggle() {
    isSidebarOpen = !isSidebarOpen;
  }
</script>

<div class={`h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-950 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
  <!-- Header -->
  <header class={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b p-4 flex items-center justify-between sticky top-0 z-10`}>
    <div class="flex items-center">
      <button 
        onclick={handleSidebarToggle} 
        class={`p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} mr-2`}
      >
        <Menu class="h-5 w-5" />
      </button>
      <h1 class="text-xl font-bold">CeLeste CMS</h1>
    </div>
    
    <div class="flex items-center gap-4">
      <LanguageSwitcher />
      
      <button 
        onclick={handleThemeToggle} 
        class={`p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
      >
        {#if isDarkMode}
          <Sun class="h-5 w-5" />
        {:else}
          <Moon class="h-5 w-5" />
        {/if}
      </button>
    </div>
  </header>
  
  <main>
    <!-- Using $messages for reactive access to translations -->
    <h2>{$messages.dashboard.title}</h2>
    <p>{$messages.dashboard.welcome}</p>
    
    <!-- Stats Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard 
        icon={Globe} 
        title={$messages.dashboard.stats.activeSites} 
        value="3" 
        change="+1" 
        {isDarkMode} 
      />
    </div>
  </main>
</div>
```

### Example 2: Form with Validation Messages

```svelte
<!-- src/routes/admin/login/+page.svelte -->
<script>
  import { messages } from '$lib/i18n';
  
  let email = $state('');
  let password = $state('');
  let errors = $state({});
  
  function validateForm() {
    errors = {};
    
    if (!email) {
      errors.email = $messages.forms.validation.required;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = $messages.forms.validation.invalidEmail;
    }
    
    if (!password) {
      errors.password = $messages.forms.validation.required;
    } else if (password.length < 8) {
      errors.password = $messages.forms.validation.passwordTooShort;
    }
    
    return Object.keys(errors).length === 0;
  }
  
  function handleSubmit() {
    if (validateForm()) {
      // Submit form
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <div class="mb-4">
    <label for="email">{$messages.forms.email}</label>
    <input 
      id="email"
      type="email"
      bind:value={email}
      class="w-full p-2 border rounded"
    />
    {#if errors.email}
      <p class="text-red-500 text-sm mt-1">{errors.email}</p>
    {/if}
  </div>
  
  <div class="mb-4">
    <label for="password">{$messages.forms.password}</label>
    <input 
      id="password"
      type="password"
      bind:value={password}
      class="w-full p-2 border rounded"
    />
    {#if errors.password}
      <p class="text-red-500 text-sm mt-1">{errors.password}</p>
    {/if}
  </div>
  
  <button type="submit" class="bg-blue-500 text-white p-2 rounded">
    {$messages.forms.login}
  </button>
</form>
```

---

This guide provides a comprehensive approach to implementing internationalization in CeLesteCMS Pro. Follow these patterns to ensure consistent language support across all screens and components.

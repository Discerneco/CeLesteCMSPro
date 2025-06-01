# Paraglide 2.0 Internationalization Guide for CeLesteCMS Pro

**⚠️ Updated for Paraglide 2.0 - Official Documentation**

This guide explains how to implement and use internationalization (i18n) in CeLesteCMS Pro using **Paraglide 2.0** with SvelteKit and the strategy system for automatic language detection.

## Table of Contents

1. [Overview](#overview)
2. [Paraglide 2.0 Architecture](#paraglide-20-architecture)
3. [Project Setup](#project-setup)
4. [Configuration](#configuration)
5. [Strategy System](#strategy-system)
6. [Message Organization](#message-organization)
7. [SvelteKit Integration](#sveltekit-integration)
8. [Using Messages in Components](#using-messages-in-components)
9. [Language Switching](#language-switching)
10. [Prerendering & SEO](#prerendering--seo)
11. [Advanced Configuration](#advanced-configuration)
12. [Best Practices](#best-practices)
13. [Migration from 1.x](#migration-from-1x)

## Overview

CeLesteCMS Pro uses **Paraglide 2.0** - a modern, framework-agnostic i18n library that:

- **Compiles translations** at build time for optimal performance
- **Tree-shakes unused messages** automatically
- **Provides full TypeScript safety** with auto-generated types
- **Uses strategy system** for automatic language detection
- **Works with Svelte 5 runes** out of the box
- **Supports SSR, SSG, and CSR** seamlessly

### Key 2.0 Changes

- ✅ **No framework-specific adapters** - Universal Vite plugin
- ✅ **Strategy-based language detection** - Automatic URL/cookie handling
- ✅ **Simplified setup** - No ParaglideJS component needed
- ✅ **Framework agnostic** - Same plugin works everywhere
- ✅ **Better TypeScript** - Improved type generation

## Paraglide 2.0 Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Strategy      │───▶│   Paraglide      │───▶│   Components    │
│   System        │    │   Runtime        │    │                 │
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│ 1. URL          │    │ • Message        │    │ • Auto-reactive │
│ 2. Cookie       │    │   functions      │    │ • Type-safe     │
│ 3. baseLocale   │    │ • Locale state   │    │ • Tree-shaken   │
└─────────────────┘    │ • Localization   │    └─────────────────┘
                       └──────────────────┘
```

## Project Setup

### Installation

CeLesteCMS Pro already has the correct packages:

```bash
# Already installed in your project
npm install @inlang/paraglide-js
```

### Initialize Paraglide

```bash
# Run once to set up project structure
npx @inlang/paraglide-js init
```

This creates:
- `project.inlang/settings.json` - Project configuration
- `messages/{locale}.json` - Translation files
- Updates `vite.config.ts` - Adds the plugin

## Configuration

### Project Configuration

Your `project.inlang/settings.json` is correctly configured:

```json
{
  "$schema": "https://inlang.com/schema/project-settings",
  "modules": [
    "https://cdn.jsdelivr.net/npm/@inlang/plugin-message-format@4/dist/index.js",
    "https://cdn.jsdelivr.net/npm/@inlang/plugin-m-function-matcher@2/dist/index.js"
  ],
  "plugin.inlang.messageFormat": {
    "pathPattern": "./messages/{locale}.json"
  },
  "baseLocale": "en",
  "locales": ["en", "pt-br"]
}
```

### Vite Configuration

Your `vite.config.ts` is correctly configured for Paraglide 2.0:

```typescript
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltekit(),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/lib/paraglide',
      // 🎯 Strategy system - the heart of 2.0
      strategy: ['url', 'cookie', 'baseLocale']
    })
  ]
});
```

### App HTML Configuration

Update `src/app.html` to use the correct placeholder:

```html
<!doctype html>
<!-- ✅ Correct 2.0 placeholder -->
<html lang="%lang%">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

## Strategy System

The strategy system is **the core of Paraglide 2.0**. It automatically determines the user's language in this order:

### Strategy Order: `['url', 'cookie', 'baseLocale']`

1. **URL Strategy** (`/pt-br/admin/login`)
   - Checks URL path for language prefix
   - If found, uses that language
   - Automatically sets cookie for persistence

2. **Cookie Strategy** (`locale=pt-br`)
   - If no URL language, checks `locale` cookie
   - Uses saved language preference
   - Maintains consistency across navigation

3. **Base Locale Strategy** (`en`)
   - Final fallback to your base language
   - Ensures app always has a valid locale

### How It Works

```typescript
// User visits: /pt-br/admin/login
// Strategy detects: "pt-br" from URL
// Result: locale = "pt-br", cookie = "pt-br"

// User navigates: /admin/dashboard (no language in URL)
// Strategy detects: "pt-br" from cookie
// Result: locale = "pt-br" (maintained)

// New user visits: /admin/login (no URL, no cookie)
// Strategy detects: falls back to "en"
// Result: locale = "en"
```

## Message Organization

### Directory Structure

```
messages/
├── en.json     # English (base locale)
└── pt-br.json  # Brazilian Portuguese

src/lib/paraglide/  # Generated by Paraglide
├── messages/
│   ├── en.js       # Compiled English functions
│   └── pt-br.js    # Compiled Portuguese functions
├── messages.js     # All message exports
└── runtime.js      # Runtime functions
```

### Message Format

Messages use a structured JSON format with parameters:

```json
// messages/en.json
{
  "auth": {
    "loginTitle": "Sign In",
    "loginSubtitle": "Welcome back to CeLeste CMS",
    "emailLabel": "Email Address",
    "passwordLabel": "Password",
    "loginButton": "Sign In",
    "forgotPassword": "Forgot password?",
    "rememberMe": "Remember me",
    "invalidCredentials": "Invalid email or password",
    "welcomeUser": "Welcome back, {name}!"
  },
  "dashboard": {
    "title": "Dashboard", 
    "welcome": "Welcome to CeLeste CMS administration",
    "stats": {
      "users": "Users",
      "posts": "Posts", 
      "pages": "Pages"
    }
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "loading": "Loading..."
  }
}
```

```json
// messages/pt-br.json
{
  "auth": {
    "loginTitle": "Entrar",
    "loginSubtitle": "Bem-vindo de volta ao CeLeste CMS",
    "emailLabel": "Endereço de E-mail",
    "passwordLabel": "Senha",
    "loginButton": "Entrar",
    "forgotPassword": "Esqueceu a senha?",
    "rememberMe": "Lembrar de mim",
    "invalidCredentials": "E-mail ou senha inválidos",
    "welcomeUser": "Bem-vindo de volta, {name}!"
  },
  "dashboard": {
    "title": "Painel",
    "welcome": "Bem-vindo à administração do CeLeste CMS",
    "stats": {
      "users": "Usuários",
      "posts": "Posts",
      "pages": "Páginas"
    }
  },
  "common": {
    "save": "Salvar",
    "cancel": "Cancelar", 
    "delete": "Excluir",
    "loading": "Carregando..."
  }
}
```

## SvelteKit Integration

### No Hooks Needed!

**Paraglide 2.0 handles everything automatically**. No need for:
- ❌ Custom hooks
- ❌ ParaglideJS component
- ❌ Manual store management
- ❌ Language detection logic

The strategy system manages all language detection and persistence.

### Optional: Custom Hooks (Advanced)

Only add hooks if you need custom behavior:

```typescript
// src/hooks.server.ts (optional)
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Your existing auth logic here
  const session = await auth.api.getSession({
    headers: event.request.headers
  });
  
  event.locals.session = session;
  
  // Paraglide strategy handles language automatically
  return resolve(event);
};
```

## Using Messages in Components

### Basic Usage

```svelte
<!-- src/routes/admin/+page.svelte -->
<script lang="ts">
  // Import messages - type-safe and tree-shaken
  import * as m from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  
  // Svelte 5 runes for local state
  let userCount = $state(1234);
  let userName = $state('João');
  
  // Get current locale (reactive)
  let currentLocale = $state(getLocale());
</script>

<svelte:head>
  <title>{m.dashboard.title()} - CeLeste CMS</title>
</svelte:head>

<main>
  <h1>{m.dashboard.title()}</h1>
  <p>{m.dashboard.welcome()}</p>
  
  <!-- With parameters -->
  <p>{m.auth.welcomeUser({ name: userName })}</p>
  
  <!-- Reactive to locale changes -->
  <p>Current language: {currentLocale}</p>
  
  <!-- Using in conditions -->
  <p>{userCount === 1 ? m.dashboard.stats.user : m.dashboard.stats.users}</p>
</main>
```

### Available Runtime Functions

```typescript
import { 
  getLocale,      // Get current locale
  setLocale,      // Set locale (triggers strategy)
  locales,        // Array of available locales ['en', 'pt-br']
  localizeHref    // Create language-aware URLs
} from '$lib/paraglide/runtime';

// Examples
const current = getLocale();           // "pt-br"
const available = locales;             // ["en", "pt-br"]
const url = localizeHref('/admin');    // "/pt-br/admin"
const enUrl = localizeHref('/admin', { locale: 'en' }); // "/admin"
```

## Language Switching

### Correct Language Switcher

**Use `localizeHref()` for proper URL generation:**

```svelte
<!-- src/lib/components/LanguageSwitcher.svelte -->
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
  
  // ✅ Reactive current language
  let currentLanguage = $state(getLocale());
  
  // ✅ Update when locale changes
  $effect(() => {
    currentLanguage = getLocale();
  });
  
  // ✅ Proper language switching using localizeHref
  function switchLanguage(targetLocale: string) {
    // Generate correct URL for target language
    const localizedUrl = localizeHref($page.url.pathname, { 
      locale: targetLocale 
    });
    
    // Navigate to localized URL
    goto(localizedUrl);
  }
</script>

<div class="dropdown dropdown-end">
  <button 
    class="btn btn-sm btn-ghost gap-2"
    aria-label="Choose language"
  >
    <Globe class="h-4 w-4" />
    <span>
      {currentLanguage in languageNames 
        ? languageNames[currentLanguage as keyof typeof languageNames] 
        : currentLanguage}
    </span>
  </button>
  
  <ul class="dropdown-content menu bg-base-100 rounded-box w-52 p-2 shadow">
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
</div>
```

### How Language Switching Works

```typescript
// User clicks "Português" on /admin/dashboard
switchLanguage('pt-br');

// ↓ localizeHref generates: "/pt-br/admin/dashboard"
// ↓ goto() navigates to the localized URL
// ↓ Strategy detects "pt-br" from URL
// ↓ Updates locale + sets cookie
// ↓ All messages switch to Portuguese
// ✅ Language persists across navigation
```

## Prerendering & SEO

### Enable Prerendering

For static site generation, add to your layout:

```typescript
// src/routes/+layout.ts
export const prerender = true;
```

### Generate All Language Pages

Add invisible anchor tags to ensure all language variants are generated:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { page } from '$app/stores';
  import { locales, localizeHref } from '$lib/paraglide/runtime';
</script>

<slot />

<!-- Generate all language variants for static generation -->
<div style="display:none">
  {#each locales as locale}
    <a href={localizeHref($page.url.pathname, { locale })}>{locale}</a>
  {/each}
</div>
```

### SEO Best Practices

```svelte
<!-- src/routes/admin/+page.svelte -->
<script>
  import * as m from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { page } from '$app/stores';
  
  let currentLocale = $state(getLocale());
</script>

<svelte:head>
  <!-- Localized title -->
  <title>{m.dashboard.title()} - CeLeste CMS</title>
  
  <!-- Language alternatives for SEO -->
  <link rel="alternate" hreflang="en" 
        href={localizeHref($page.url.pathname, { locale: 'en' })} />
  <link rel="alternate" hreflang="pt-br" 
        href={localizeHref($page.url.pathname, { locale: 'pt-br' })} />
  
  <!-- Current language -->
  <meta property="og:locale" content={currentLocale} />
</svelte:head>
```

## Advanced Configuration

### Edge Runtime Support

For Cloudflare Pages (your deployment target):

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    sveltekit(),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/lib/paraglide',
      strategy: ['url', 'cookie', 'baseLocale'],
      // ✅ Disable AsyncLocalStorage for edge compatibility
      disableAsyncLocalStorage: true
    })
  ]
});
```

⚠️ **Only use `disableAsyncLocalStorage: true` in serverless environments.**

### Custom Strategy Configuration

You can customize the strategy order:

```typescript
// Different strategy orders for different needs

// URL-first (default - good for SEO)
strategy: ['url', 'cookie', 'baseLocale']

// Cookie-first (good for SPAs)
strategy: ['cookie', 'url', 'baseLocale']

// URL-only (no persistence)
strategy: ['url', 'baseLocale']
```

### TypeScript Configuration

Ensure proper types in `src/app.d.ts`:

```typescript
// src/app.d.ts
import type { AvailableLanguageTag } from '$lib/paraglide/runtime';

declare global {
  namespace App {
    interface Locals {
      // Your existing locals
      session?: any;
    }
    // Paraglide types are automatically included
  }
}

export {};
```

## Best Practices

### Message Organization

1. **Group by feature**: `auth.*`, `dashboard.*`, `common.*`
2. **Use consistent naming**: camelCase for keys
3. **Prefer parameters over concatenation**:
   ```json
   // ✅ Good
   "welcomeUser": "Welcome, {name}!"
   
   // ❌ Avoid
   "welcome": "Welcome",
   "user": "{name}!"
   ```

### Component Patterns

1. **Import messages at component level**:
   ```svelte
   <script>
     import * as m from '$lib/paraglide/messages';
     // Use m.* directly in template
   </script>
   ```

2. **Use Svelte 5 runes for reactivity**:
   ```svelte
   <script>
     let currentLocale = $state(getLocale());
     
     $effect(() => {
       // React to locale changes
       console.log('Language changed to:', getLocale());
     });
   </script>
   ```

3. **Keep messages close to usage**:
   ```svelte
   <!-- ✅ Good - clear context -->
   <button>{m.common.save()}</button>
   
   <!-- ❌ Avoid - unclear context -->
   <button>{m.save()}</button>
   ```

### Performance Tips

1. **Messages are tree-shaken** - Only imported messages are bundled
2. **Use conditional imports** for large features:
   ```typescript
   // Only load when needed
   const { adminMessages } = await import('$lib/paraglide/admin');
   ```

3. **Leverage SvelteKit's code splitting** - Route-based message loading

### Development Workflow

1. **Use the inlang VSCode extension** for inline translation editing
2. **Run type checking** after adding new messages:
   ```bash
   npm run check
   ```
3. **Test language switching** in development mode
4. **Verify prerendering** generates all language variants

## Migration from 1.x

If migrating from Paraglide 1.x:

### Remove Old Dependencies

```bash
# Remove old packages
npm uninstall @inlang/paraglide-sveltekit

# Keep only the new package
npm install @inlang/paraglide-js
```

### Update Configuration

1. **Remove old hooks** - Delete custom language detection
2. **Update app.html** - Change `%paraglide.lang%` to `%lang%`
3. **Remove manual stores** - Let strategy system handle state
4. **Replace manual URL building** - Use `localizeHref()`

### Update Components

```diff
- import { languageTag, setLanguageTag } from '$lib/paraglide/runtime';
+ import { getLocale, setLocale, localizeHref } from '$lib/paraglide/runtime';

- setLanguageTag('pt-br');
+ goto(localizeHref($page.url.pathname, { locale: 'pt-br' }));
```

## Troubleshooting

### Language Doesn't Persist

**Check:**
1. ✅ Strategy includes `'cookie'`
2. ✅ Using `localizeHref()` for navigation  
3. ✅ URLs include language prefix (`/pt-br/admin`)

### Messages Not Updating

**Check:**
1. ✅ Import messages in component: `import * as m from '$lib/paraglide/messages'`
2. ✅ Use messages directly: `{m.dashboard.title()}`
3. ✅ No manual language overrides in hooks

### TypeScript Errors

**Check:**
1. ✅ Run `npm run check` after adding messages
2. ✅ Message keys match JSON structure
3. ✅ Parameters match message placeholders

### Build Errors

**Check:**
1. ✅ Paraglide plugin before SvelteKit in `vite.config.ts`
2. ✅ Valid JSON in message files
3. ✅ No syntax errors in `project.inlang/settings.json`

---

## Summary

Paraglide 2.0 provides a **modern, automatic approach** to internationalization:

- ✅ **Strategy system** handles language detection automatically
- ✅ **No manual hooks** or complex setup required
- ✅ **Type-safe messages** with full IDE support
- ✅ **Perfect Svelte 5 compatibility** with runes
- ✅ **Optimal performance** with tree-shaking and compilation
- ✅ **SEO-friendly** with proper URL structure

The key is to **trust the strategy system** and use `localizeHref()` for navigation instead of fighting it with manual state management.

For the most up-to-date information, visit the [official Paraglide documentation](https://inlang.com/m/gerre34r/library-inlang-paraglideJs/sveltekit).

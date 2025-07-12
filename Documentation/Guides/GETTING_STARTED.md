# Getting Started with CeLesteCMS Pro

This guide will help you set up CeLesteCMS Pro for application development.

## Core Technologies

### Framework
- **SvelteKit**: Full-stack framework built on Svelte 5
- **TypeScript**: For type safety and better developer experience

### UI & Design
- **TailwindCSS**: Utility-first CSS framework
- **DaisyUI**: Component library built on top of Tailwind

### Database
- **Cloudflare D1**: Serverless SQLite database distributed globally
- **Drizzle ORM**: TypeScript ORM for database operations

### Testing
- **Vitest**: Unit and component testing framework built on Vite
- **Playwright**: End-to-end testing framework for browser testing

### Content Authoring
- **MDSvex**: Markdown preprocessor for Svelte with component support

### Internationalization
- **Paraglide**: Type-safe i18n solution optimized for SvelteKit
- **Supported Languages**: English (en) and Portuguese Brazil (pt-BR)

### Development Tools
- **Storybook**: UI component explorer and documentation
- **ESLint**: Code linting
- **Prettier**: Code formatting

## Development Environment Setup

### 1. Set up SvelteKit project with TypeScript
```bash
npx sv create celestecms-pro
cd celestecms-pro
npm install
```

During setup, select the following options:
- TypeScript: Yes
- ESLint: Yes
- Prettier: Yes
- Vitest: Yes
- Playwright: Yes
- TailwindCSS: Yes
- Drizzle: Yes (SQLite adapter)
- Storybook: Yes
- SvelteKit-adapter: Yes (Cloudflare)
- MDSvex: Yes
- Paraglide: Yes
- Oslo + Arctic: Yes (for authentication)

### 2. Add Cloudflare D1 integration
```bash
npm install @cloudflare/workers-types
npm install drizzle-orm drizzle-kit
```

### 3. Set up DaisyUI
```bash
npm install daisyui@latest
```

Update your `tailwind.config.js` to include DaisyUI:
```javascript
module.exports = {
  //...
  plugins: [require("daisyui")],
}
```

### 4. Configure Paraglide for Internationalization
```bash
npm install @inlang/paraglide-js
```

Create a Paraglide configuration file:
```javascript
// paraglide.config.js
export default {
  project: {
    sourceLanguageTag: "en",
    languageTags: ["en", "pt-BR"],
  },
  plugins: [
    // Add plugins as needed
  ]
}
```

Create translation files for each language:
```javascript
// src/i18n/en.json
{
  "welcome": "Welcome to CeLesteCMS Pro",
  "dashboard": "Dashboard",
  "content": "Content"
}

// src/i18n/pt-BR.json
{
  "welcome": "Bem-vindo ao CeLesteCMS Pro",
  "dashboard": "Painel de Controle",
  "content": "Conteúdo"
}
```

### 5. Set up authentication system
```bash
npm install @oslojs/crypto @oslojs/encoding @oslojs/cookie arctic
```

### 6. Add deployment adapters
```bash
npm install @sveltejs/adapter-cloudflare @sveltejs/adapter-vercel -D
```

### 7. Configure Cloudflare integration
```bash
npm install @cloudflare/workers-sdk
```

### 8. Install application development dependencies
```bash
npm install svelte-forms-lib zod
npm install svelte-dnd-action
npm install chart.js svelte-chartjs
```

## Package Reference

### Core Packages

| Package | Purpose | Documentation |
|---------|---------|---------------|
| `@sveltejs/kit` | SvelteKit framework | [docs](https://kit.svelte.dev/docs) |
| `svelte` | Svelte framework | [docs](https://svelte.dev/docs) |
| `tailwindcss` | CSS framework | [docs](https://tailwindcss.com/docs) |
| `daisyui` | UI component library | [docs](https://daisyui.com/docs) |
| `drizzle-orm` | Database ORM | [docs](https://orm.drizzle.team/docs/overview) |
| `@cloudflare/workers-types` | Types for Cloudflare Workers | [docs](https://developers.cloudflare.com/workers/) |

### Testing Packages

| Package | Purpose | Documentation |
|---------|---------|---------------|
| `vitest` | Unit and component testing | [docs](https://vitest.dev/guide/) |
| `@playwright/test` | End-to-end testing | [docs](https://playwright.dev/docs/intro) |

### Deployment Adapters

| Package | Purpose | Documentation |
|---------|---------|---------------|
| `@sveltejs/adapter-cloudflare` | Cloudflare Pages deployment | [docs](https://kit.svelte.dev/docs/adapter-cloudflare) |
| `@sveltejs/adapter-vercel` | Vercel deployment | [docs](https://kit.svelte.dev/docs/adapter-vercel) |

### Content & Internationalization

| Package | Purpose | Documentation |
|---------|---------|---------------|
| `mdsvex` | Markdown in Svelte | [docs](https://mdsvex.pngwn.io/) |
| `@inlang/paraglide-js` | Internationalization (en, pt-BR) | [docs](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) |

## Creating Your First Application

### 1. Define a Custom Data Model
Create a new data model in `src/lib/models/`:

```typescript
// src/lib/models/product.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(),
  imageUrl: text('image_url'),
  category: text('category'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});
```

### 2. Create Application Components
Build reusable components in `src/lib/components/app/`:

```typescript
// src/lib/components/app/ProductCard.svelte
<script lang="ts">
  export let product: {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
  };
</script>

<div class="product-card">
  <img src={product.imageUrl} alt={product.name} />
  <h3>{product.name}</h3>
  <p>{product.description}</p>
  <p class="price">${product.price / 100}</p>
  <button>Add to Cart</button>
</div>

<style>
  .product-card {
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 1rem;
    transition: transform 0.2s;
  }
  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }
  .price {
    font-weight: bold;
    font-size: 1.2rem;
  }
</style>
```

### 3. Create API Endpoints
Set up endpoints in `src/routes/api/`:

```typescript
// src/routes/api/products/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { products } from '$lib/models/product';

export async function GET({ platform }) {
  try {
    const allProducts = await db.select().from(products).all();
    return json(allProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
```

### 4. Create Application Pages
Build pages in `src/routes/`:

```typescript
// src/routes/products/+page.svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import ProductCard from '$lib/components/app/ProductCard.svelte';
  
  let products = [];
  
  onMount(async () => {
    const response = await fetch('/api/products');
    if (response.ok) {
      products = await response.json();
    }
  });
</script>

<h1>Products</h1>

<div class="product-grid">
  {#each products as product}
    <ProductCard {product} />
  {/each}
</div>

<style>
  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 2rem;
  }
</style>
```

## Next Steps

1. Explore the plugin development documentation
2. Learn about custom field types
3. Discover application deployment options
4. Join our developer community

For more detailed documentation, visit our [Developer Portal](https://docs.celestecms.com).

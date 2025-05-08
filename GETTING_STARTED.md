# Getting Started with CeLesteCMS Pro

This guide will help you set up CeLesteCMS Pro for application development.

## Development Environment Setup

### 1. Set up SvelteKit project with TypeScript
```bash
npm create svelte@latest celestecms-pro
cd celestecms-pro
npm install
```

### 2. Add Cloudflare D1 integration
```bash
npm install @cloudflare/workers-types
npm install drizzle-orm drizzle-kit
```

### 3. Set up authentication system
```bash
npm install jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs
```

### 4. Add GitHub API integration
```bash
npm install @octokit/rest
```

### 5. Configure Cloudflare integration
```bash
npm install @cloudflare/workers-sdk
```

### 6. Install application development dependencies
```bash
npm install svelte-forms-lib zod
npm install svelte-dnd-action
npm install chart.js svelte-chartjs
```

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

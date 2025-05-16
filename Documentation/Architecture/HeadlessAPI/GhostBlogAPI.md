# Ghost Blog API Architecture & Inspiration for CeLesteCMS Pro

This document explores how Ghost's API-first approach can be used as inspiration for CeLesteCMS Pro's headless architecture.

## Ghost Blog Overview

[Ghost](https://ghost.org/) is an open-source headless CMS built with Node.js that provides a robust API-first architecture. It has evolved from a monolithic structure to a fully decoupled headless CMS that allows for flexible frontend implementations.

## Ghost's Architecture

Ghost uses a modern, decoupled architecture with the following components:

### Core API Layer

- **Content API**: Public, read-only API for delivering content to any frontend
- **Admin API**: Private, authenticated API for content management
- **JavaScript SDK**: Client library for easy API consumption
- **Webhooks**: For integration with external services and triggering builds

### Database & Storage

- Uses Bookshelf.js ORM (conceptually similar to Drizzle ORM)
- Supports SQLite in development and MySQL in production
- Adapters for different storage options (local, cloud storage, etc.)

### Codebase Structure

Ghost separates its codebase into two main directories:
- `core`: Core application files (API, database models, services)
- `content`: User-modifiable files (themes, images, data)

## How CeLesteCMS Pro Can Adopt Ghost's Approach

### 1. Dual API System

Similar to Ghost, CeLesteCMS Pro can implement:

```typescript
// src/lib/server/api/index.ts
import { Router } from 'express';
import { contentApi } from './content';
import { adminApi } from './admin';

export function createApiRouter() {
  const router = Router();
  
  // Public Content API (similar to Ghost's Content API)
  router.use('/v1/content', contentApi);
  
  // Admin API with authentication (similar to Ghost's Admin API)
  router.use('/v1/admin', adminApi);
  
  return router;
}
```

### 2. Content API Implementation

```typescript
// src/lib/server/api/content/index.ts
import { Router } from 'express';
import { getDb } from '$lib/server/db';
import { posts, pages } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

export const contentApi = Router();

// Get all posts
contentApi.get('/posts', async (req, res) => {
  const db = getDb(req.platform);
  const allPosts = await db.query.posts.findMany({
    with: {
      author: true,
      tags: true
    },
    orderBy: [posts.publishedAt, 'desc']
  });
  
  res.json({
    posts: allPosts,
    meta: {
      pagination: {
        page: 1,
        limit: allPosts.length,
        total: allPosts.length
      }
    }
  });
});

// Get a single post by slug
contentApi.get('/posts/:slug', async (req, res) => {
  const { slug } = req.params;
  const db = getDb(req.platform);
  
  const post = await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
    with: {
      author: true,
      tags: true
    }
  });
  
  if (!post) {
    return res.status(404).json({
      error: 'Post not found'
    });
  }
  
  res.json({
    post
  });
});
```

### 3. JavaScript SDK

Following Ghost's example, CeLesteCMS Pro can build a lightweight JavaScript SDK:

```typescript
// src/lib/sdk/index.ts
export class CelesteSDK {
  private apiUrl: string;
  private apiKey: string;
  
  constructor(options: { apiUrl: string; apiKey: string }) {
    this.apiUrl = options.apiUrl;
    this.apiKey = options.apiKey;
  }
  
  async getPosts(options = {}) {
    const response = await fetch(`${this.apiUrl}/content/posts`, {
      headers: {
        'Authorization': `Token ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return await response.json();
  }
  
  async getPost(slug: string) {
    const response = await fetch(`${this.apiUrl}/content/posts/${slug}`, {
      headers: {
        'Authorization': `Token ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return await response.json();
  }
}
```

## Local Development with Online Publishing

Ghost demonstrates that a headless CMS can run locally while publishing content online. CeLesteCMS Pro can implement this approach by:

1. Running the admin interface locally
2. Using API tokens to authenticate with remote deployment services
3. Pushing content to Cloudflare Pages, Vercel, Netlify, or other platforms

```typescript
// src/lib/deployment/index.ts
export async function deployContent(content, platform = 'cloudflare') {
  switch (platform) {
    case 'cloudflare':
      return await CloudflareDeployment.deploy(content);
    case 'vercel':
      return await VercelDeployment.deploy(content);
    case 'netlify':
      return await NetlifyDeployment.deploy(content);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}
```

### Local Admin Architecture

The local admin + online deployment architecture works as follows:

```
┌─────────────────┐          ┌─────────────────┐
│ Local CMS Admin │  ─────►  │ Cloudflare API  │
└─────────────────┘          └────────┬────────┘
                                      │
                                      ▼
                            ┌─────────────────┐
                            │ Cloudflare Pages│
                            │ (Public Site)   │
                            └─────────────────┘
```

This architecture provides several advantages:

1. **Development Speed**: Faster local development cycle without cloud deployments
2. **Cost Efficiency**: Reduced cloud resource usage
3. **Offline Development**: Ability to work without constant internet connection
4. **Total Control**: More control over the admin environment

### Mobile Compatibility

When using a local admin approach, there are implications for mobile usage:

- The admin interface is typically used on desktop/laptop computers
- Content managers can't easily publish from mobile devices
- The published frontend is fully mobile-compatible

For mobile admin access, a full cloud-based solution is preferable, though there are potential hybrid approaches such as:

1. A dedicated mobile admin app that connects to the API
2. A responsive web admin that's hosted separately from the local instance
3. Remote access to the local admin through VPN or similar technologies

## Key Takeaways from Ghost's Architecture

1. **API-First Design**: Ghost prioritizes API design over UI implementation, making it flexible
2. **Clear Separation**: The Content API and Admin API have distinct purposes and security models
3. **SDK Approach**: By providing SDK tools, Ghost simplifies integration for developers
4. **Webhooks**: Event-driven architecture allows for automation and integrations
5. **Database Abstraction**: Using an ORM provides flexibility in database choice

## Resources

- [Ghost API Documentation](https://ghost.org/docs/content-api/)
- [Ghost Architecture Overview](https://ghost.org/docs/architecture/)
- [Ghost on GitHub](https://github.com/TryGhost/Ghost)

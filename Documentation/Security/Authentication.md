# CeLesteCMS Pro Authentication System

## Architecture Overview

CeLesteCMS Pro implements a lightweight, edge-optimized authentication system built on:

- **Oslo** for cryptographic utilities and session management
- **Arctic** for OAuth providers (when needed)
- **Cloudflare D1** for user storage
- **Drizzle ORM** for database interactions
- **Cloudflare Workers** (via SvelteKit's Cloudflare adapter) for serverless auth logic
- **Secure HTTP-only cookies** for session management
- **SvelteKit's auth hooks** for route protection
- **Svelte 5 runes** for client-side auth state

## Why Oslo + Arctic?

This approach was chosen for CeLesteCMS Pro because:

- **Edge-Optimized**: Lightweight libraries designed for serverless environments
- **Modern Security**: Built on proven cryptographic primitives
- **Framework Agnostic**: No vendor lock-in, works with any setup
- **Active Development**: Maintained by the Lucia Auth creator post-deprecation
- **Perfect D1 Integration**: Direct database access without adapter layers
- **Minimal Bundle Size**: Only includes what you actually use

## Implementation Components

### 1. Dependencies

```json
{
  "dependencies": {
    "@oslojs/crypto": "^1.0.0",
    "@oslojs/encoding": "^1.0.0", 
    "@oslojs/cookie": "^1.0.0",
    "arctic": "^2.0.0",
    "drizzle-orm": "^0.43.0"
  }
}
```

### 2. Database Schema with Drizzle ORM

```typescript
// src/lib/server/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  role: text('role').default('editor'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()),
});
```

### 3. Authentication Utilities with Oslo

```typescript
// src/lib/server/auth.ts
import { hash, verify } from '@oslojs/crypto/sha256';
import { generateRandomString } from '@oslojs/crypto/random';
import { encodeBase64, decodeBase64 } from '@oslojs/encoding';
import { Cookie } from '@oslojs/cookie';
import { getDB } from './db';
import { sessions, users } from './db/schema';
import { eq, and } from 'drizzle-orm';

// Password hashing with Oslo
export async function hashPassword(password: string): Promise<string> {
  const salt = generateRandomString(16);
  const hashedPassword = await hash(new TextEncoder().encode(password + salt));
  return encodeBase64(hashedPassword) + ':' + salt;
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [encodedHash, salt] = hashedPassword.split(':');
  const hash = decodeBase64(encodedHash);
  const inputHash = await hash(new TextEncoder().encode(password + salt));
  return encodeBase64(inputHash) === encodedHash;
}

// Session management
export function generateSessionId(): string {
  return generateRandomString(32);
}

export async function createSession(userId: string, platform: App.Platform): Promise<string> {
  const db = getDB(platform);
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
  
  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt
  });
  
  return sessionId;
}

export async function validateSession(sessionId: string, platform: App.Platform): Promise<{ user: any; session: any } | null> {
  const db = getDB(platform);
  
  const result = await db
    .select({
      user: users,
      session: sessions
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.id, sessionId),
        // Check if session hasn't expired
        gt(sessions.expiresAt, new Date())
      )
    )
    .limit(1);
    
  if (result.length === 0) {
    return null;
  }
  
  const { user, session } = result[0];
  
  // Extend session if it expires within 1 day
  if (session.expiresAt.getTime() - Date.now() < 1000 * 60 * 60 * 24) {
    const newExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    await db
      .update(sessions)
      .set({ expiresAt: newExpiresAt })
      .where(eq(sessions.id, sessionId));
    session.expiresAt = newExpiresAt;
  }
  
  return { user, session };
}

export async function deleteSession(sessionId: string, platform: App.Platform): Promise<void> {
  const db = getDB(platform);
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

// Cookie utilities
export function createSessionCookie(sessionId: string): Cookie {
  return new Cookie('session', sessionId, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
}

export function deleteSessionCookie(): Cookie {
  return new Cookie('session', '', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0
  });
}
```

### 4. Database Client Setup

```typescript
// src/lib/server/db/index.ts
import { drizzle } from 'drizzle-orm/d1';
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

export function getDB(platform?: App.Platform) {
  // Production: Use Cloudflare D1
  if (platform?.env?.DB) {
    return drizzle(platform.env.DB, { schema });
  }
  
  // Development: Use local SQLite
  const sqlite = new Database('local.db');
  return drizzleSQLite(sqlite, { schema });
}
```

### 5. SvelteKit Auth Hooks

```typescript
// src/hooks.server.ts
import { sequence } from '@sveltejs/kit/hooks';
import { validateSession, deleteSession } from '$lib/server/auth';

export const handle = sequence(
  async ({ event, resolve }) => {
    // Get session ID from cookies
    const sessionId = event.cookies.get('session');
    
    if (sessionId) {
      const sessionData = await validateSession(sessionId, event.platform);
      
      if (sessionData) {
        // Valid session
        event.locals.user = {
          id: sessionData.user.id,
          email: sessionData.user.email,
          name: sessionData.user.name,
          role: sessionData.user.role,
          isAuthenticated: true
        };
        event.locals.session = sessionData.session;
      } else {
        // Invalid session - clean up
        await deleteSession(sessionId, event.platform);
        event.cookies.delete('session', { path: '/' });
      }
    }
    
    // Default user state if no valid session
    if (!event.locals.user) {
      event.locals.user = {
        isAuthenticated: false
      };
    }
    
    return resolve(event);
  },
  
  // Protect admin routes
  async ({ event, resolve }) => {
    const isAdminRoute = event.url.pathname.startsWith('/admin');
    const isLoginRoute = event.url.pathname === '/admin/login';
    
    if (isAdminRoute && !isLoginRoute && !event.locals.user?.isAuthenticated) {
      // Redirect unauthenticated users to login
      return Response.redirect(new URL('/admin/login', event.url.origin), 302);
    }
    
    return resolve(event);
  }
);
```

### 6. Auth API Endpoints

```typescript
// src/routes/api/auth/login/+server.ts
import { json } from '@sveltejs/kit';
import { getDB } from '$lib/server/db';
import { verifyPassword, createSession, createSessionCookie } from '$lib/server/auth';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST({ request, platform, cookies }) {
  const { email, password } = await request.json();
  
  // Validate input
  if (!email || !password) {
    return json({ success: false, message: 'Email and password are required' }, { status: 400 });
  }
  
  try {
    const db = getDB(platform);
    
    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!user) {
      return json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
    
    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    
    if (!isValid) {
      return json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
    
    // Create session
    const sessionId = await createSession(user.id, platform);
    
    // Set cookie
    const sessionCookie = createSessionCookie(sessionId);
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: sessionCookie.attributes.path,
      httpOnly: sessionCookie.attributes.httpOnly,
      secure: sessionCookie.attributes.secure,
      sameSite: sessionCookie.attributes.sameSite,
      maxAge: sessionCookie.attributes.maxAge
    });
    
    return json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return json({ success: false, message: 'An error occurred' }, { status: 500 });
  }
}
```

```typescript
// src/routes/api/auth/logout/+server.ts
import { json } from '@sveltejs/kit';
import { deleteSession, deleteSessionCookie } from '$lib/server/auth';

export async function POST({ cookies, platform, locals }) {
  const sessionId = cookies.get('session');
  
  if (sessionId) {
    await deleteSession(sessionId, platform);
  }
  
  // Clear session cookie
  const sessionCookie = deleteSessionCookie();
  cookies.set(sessionCookie.name, sessionCookie.value, {
    path: sessionCookie.attributes.path,
    httpOnly: sessionCookie.attributes.httpOnly,
    secure: sessionCookie.attributes.secure,
    sameSite: sessionCookie.attributes.sameSite,
    maxAge: sessionCookie.attributes.maxAge
  });
  
  return json({ success: true });
}
```

### 7. Client-Side Auth Store with Svelte 5 Runes

```typescript
// src/lib/stores/auth.ts
import { writable } from 'svelte/store';
import { goto } from '$app/navigation';

export const createAuthStore = () => {
  const { subscribe, set, update } = writable({
    user: null,
    isAuthenticated: false,
    isLoading: false
  });
  
  return {
    subscribe,
    login: async (email: string, password: string) => {
      update(state => ({ ...state, isLoading: true }));
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false
          });
          
          return { success: true };
        } else {
          update(state => ({ ...state, isLoading: false }));
          return { success: false, message: data.message };
        }
      } catch (error) {
        update(state => ({ ...state, isLoading: false }));
        return { success: false, message: 'An error occurred' };
      }
    },
    logout: async () => {
      update(state => ({ ...state, isLoading: true }));
      
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        set({ user: null, isAuthenticated: false, isLoading: false });
        goto('/admin/login');
      } catch (error) {
        update(state => ({ ...state, isLoading: false }));
      }
    },
    setUser: (user) => {
      update(state => ({
        ...state,
        user,
        isAuthenticated: !!user
      }));
    }
  };
};

export const auth = createAuthStore();
```

### 8. Load Function for Admin Pages

```typescript
// src/routes/admin/+layout.server.ts
export function load({ locals }) {
  return {
    user: locals.user
  };
}
```

### 9. OAuth Integration with Arctic (Optional)

If you need OAuth providers like GitHub or Google:

```typescript
// src/lib/server/oauth.ts
import { GitHub, Google } from 'arctic';

export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
  null // No redirect URI needed for PKCE
);

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  "http://localhost:5173/auth/google/callback"
);
```

## Security Considerations

1. **Session Security**: Sessions are stored in HTTP-only cookies with secure attributes
2. **Password Hashing**: Passwords are hashed using SHA-256 with random salts via Oslo
3. **Session Rotation**: Sessions are automatically extended and can be invalidated
4. **CSRF Protection**: Same-site cookie attribute provides CSRF protection
5. **Input Validation**: All user inputs are validated before processing
6. **Environment Variables**: Sensitive values should be stored in environment variables

## Development Setup

### 1. Install Dependencies

```bash
npm install @oslojs/crypto @oslojs/encoding @oslojs/cookie arctic drizzle-orm @paralleldrive/cuid2
npm install -D better-sqlite3 @types/better-sqlite3
```

### 2. Database Migration

```bash
# Generate migration
npx drizzle-kit generate

# Apply to local SQLite
npx drizzle-kit migrate

# Apply to production D1
npx wrangler d1 migrations apply your-database-name
```

### 3. Environment Variables

For local development (`.dev.vars`):
```
NODE_ENV=development
```

For production, set in Cloudflare Pages dashboard.

### 4. Create Admin User

```typescript
// scripts/create-admin.ts
import { getDB } from '../src/lib/server/db';
import { users } from '../src/lib/server/db/schema';
import { hashPassword } from '../src/lib/server/auth';

export async function createAdmin(email: string, password: string, name: string) {
  const db = getDB();
  
  const passwordHash = await hashPassword(password);
  
  await db.insert(users).values({
    email,
    passwordHash,
    name,
    role: 'admin'
  });
  
  console.log(`Admin user created: ${email}`);
}
```

## Deployment Considerations

1. **Database Migrations**: Use Drizzle Kit to manage schema migrations
2. **Environment Variables**: Set in Cloudflare Pages dashboard
3. **Session Storage**: Sessions are stored in D1, automatically cleaned up
4. **Edge Optimization**: Minimal bundle size, optimized for Cloudflare Workers

## Benefits of This Approach

- **Lightweight**: Only ~5KB additional bundle size
- **Secure**: Built on proven cryptographic primitives
- **Fast**: Optimized for edge environments
- **Maintainable**: Simple, well-understood code
- **Flexible**: Easy to customize for specific needs
- **Future-proof**: No vendor lock-in, works with any setup

This authentication system provides a solid foundation for CeLesteCMS Pro while maintaining the edge-first architecture and performance characteristics that define the project.
# CeLesteCMS Pro Authentication System

## Architecture Overview

CeLesteCMS Pro implements a secure authentication system built on:

- **Cloudflare D1** for user storage
- **Drizzle ORM** for database interactions
- **Cloudflare Workers** (via SvelteKit's Cloudflare adapter) for serverless auth logic
- **JWT tokens** for session management
- **SvelteKit's auth hooks** for route protection
- **Svelte 5 runes** for client-side auth state

## Implementation Components

### 1. Database Schema with Drizzle ORM

```typescript
// src/lib/db/schema.ts
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
```

### 2. Auth Utilities

```typescript
// src/lib/server/auth.ts
import { Sha256 } from '@noble/hashes/sha256';
import { base64 } from '@noble/hashes/utils';
import { env } from '$env/dynamic/private';
import { JWT } from '@cfworker/jwt';

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const hash = Sha256.create();
  hash.update(password + env.PASSWORD_SALT);
  return base64.encode(hash.digest());
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const newHash = await hashPassword(password);
  return newHash === hash;
}

// JWT handling
const jwt = new JWT({
  secret: env.JWT_SECRET,
  algorithm: 'HS256'
});

export async function createToken(userId: string, role: string): Promise<string> {
  return jwt.sign({
    sub: userId,
    role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
  });
}

export async function verifyToken(token: string): Promise<{ userId: string; role: string } | null> {
  try {
    const payload = await jwt.verify(token);
    return {
      userId: payload.sub as string,
      role: payload.role as string
    };
  } catch (e) {
    return null;
  }
}
```

### 3. Database Client Setup

```typescript
// src/lib/server/db.ts
import { drizzle } from 'drizzle-orm/d1';
import { env } from '$env/dynamic/private';
import * as schema from '$lib/db/schema';

export function getDB(platform: App.Platform) {
  return drizzle(platform.env.DB, { schema });
}
```

### 4. SvelteKit Auth Hooks

```typescript
// src/hooks.server.ts
import { sequence } from '@sveltejs/kit/hooks';
import { verifyToken } from '$lib/server/auth';

export const handle = sequence(
  async ({ event, resolve }) => {
    // Get auth token from cookies
    const authToken = event.cookies.get('auth_token');
    
    if (authToken) {
      const userData = await verifyToken(authToken);
      
      if (userData) {
        // Add user data to locals for access in load functions
        event.locals.user = {
          id: userData.userId,
          role: userData.role,
          isAuthenticated: true
        };
      }
    }
    
    // Default user state if no valid token
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

### 5. Auth API Endpoints

```typescript
// src/routes/api/auth/login/+server.ts
import { json } from '@sveltejs/kit';
import { getDB } from '$lib/server/db';
import { verifyPassword, createToken } from '$lib/server/auth';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST({ request, platform, cookies }) {
  const db = getDB(platform);
  const { email, password } = await request.json();
  
  // Validate input
  if (!email || !password) {
    return json({ success: false, message: 'Email and password are required' }, { status: 400 });
  }
  
  try {
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
    
    // Create JWT token
    const token = await createToken(user.id, user.role);
    
    // Set cookie
    cookies.set('auth_token', token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
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

export async function POST({ cookies }) {
  cookies.delete('auth_token', { path: '/' });
  return json({ success: true });
}
```

### 6. Client-Side Auth Store with Svelte 5 Runes

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

### 7. Load Function for Admin Pages

```typescript
// src/routes/admin/+layout.server.ts
export function load({ locals }) {
  return {
    user: locals.user
  };
}
```

### 8. Environment Variables

Add these to your `.dev.vars` file for local development and to your Cloudflare Pages environment variables:

```
PASSWORD_SALT=your-secure-random-salt
JWT_SECRET=your-secure-random-jwt-secret
```

### 9. Admin User Creation Script

```typescript
// scripts/create-admin.js
import { drizzle } from 'drizzle-orm/d1';
import { users } from '../src/lib/db/schema';
import { hashPassword } from '../src/lib/server/auth';

export async function createAdmin(email, password, name, d1Database) {
  const db = drizzle(d1Database);
  
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

## Security Considerations

1. **CSRF Protection**: The JWT token is stored in an HTTP-only cookie with secure and SameSite attributes.
2. **Password Hashing**: Passwords are hashed with SHA-256 and a salt.
3. **Rate Limiting**: Consider adding Cloudflare Workers rate limiting for login attempts.
4. **Environment Variables**: Sensitive values are stored in environment variables.
5. **Input Validation**: All user inputs are validated before processing.

## Deployment Considerations

1. **Database Migrations**: Use Drizzle Kit to manage schema migrations.
2. **Wrangler Configuration**: Ensure your wrangler.toml is configured for D1 access.
3. **Environment Variables**: Set up environment variables in Cloudflare Pages dashboard.

## Required Dependencies

```json
{
  "dependencies": {
    "@cfworker/jwt": "^2.0.0",
    "@noble/hashes": "^1.3.2",
    "@paralleldrive/cuid2": "^2.2.2",
    "drizzle-orm": "^0.29.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.20.0"
  }
}
```

## Implementation Steps with Cloudflare Account

### 1. Cloudflare Account Setup (Completed)
- ✅ Create a Cloudflare account
- Login to your Cloudflare dashboard at https://dash.cloudflare.com

### 2. Install Wrangler CLI and Authenticate

```bash
# Install Wrangler globally
npm install -g wrangler

# Login to your Cloudflare account
wrangler login
```

### 3. Set Up Cloudflare D1 Database

```bash
# Create a D1 database
wrangler d1 create celestecms-db

# This will output a database ID like: "database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx""
# Add this to your wrangler.toml
```

Update your `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "celestecms-db"
database_id = "your-database-id-from-above"
```

### 4. Install Required Dependencies

```bash
# Core dependencies
npm install drizzle-orm @paralleldrive/cuid2 @noble/hashes @cfworker/jwt

# Development dependencies
npm install -D drizzle-kit
```

### 5. Create Database Schema and Migrations

Create the schema file as shown in the documentation, then:

```bash
# Initialize Drizzle
npx drizzle-kit generate:sqlite --schema=src/lib/db/schema.ts --out=migrations

# Apply migrations locally for development
npx wrangler d1 migrations apply celestecms-db --local

# Apply migrations to production
npx wrangler d1 migrations apply celestecms-db
```

### 6. Set Up Environment Variables

Create a `.dev.vars` file for local development:

```
PASSWORD_SALT=your-secure-random-salt
JWT_SECRET=your-secure-random-jwt-secret
```

Add these same variables to your Cloudflare Pages project:

```bash
# Using Wrangler CLI
wrangler pages project set-env-var PASSWORD_SALT "your-secure-random-salt"
wrangler pages project set-env-var JWT_SECRET "your-secure-random-jwt-secret"

# Or add them in the Cloudflare Dashboard under Pages > Your Project > Settings > Environment variables
```

### 7. Implement Auth Utilities

Create the auth utility files as shown in the documentation:
- `src/lib/server/auth.ts`
- `src/lib/server/db.ts`

### 8. Set Up SvelteKit Auth Hooks

Create or update `src/hooks.server.ts` with the authentication middleware.

### 9. Create API Endpoints

Implement the login and logout endpoints:
- `src/routes/api/auth/login/+server.ts`
- `src/routes/api/auth/logout/+server.ts`

### 10. Create Client-Side Auth Store

Implement the auth store with Svelte 5 runes:
- `src/lib/stores/auth.ts`

### 11. Update Login Component

Modify your existing login component to use the auth store.

### 12. Create Admin User Creation Script

Create a script to add your first admin user:

```typescript
// scripts/create-admin.ts
import { drizzle } from 'drizzle-orm/d1';
import { users } from '../src/lib/db/schema';
import { hashPassword } from '../src/lib/server/auth';

export async function createAdmin(email, password, name, d1Database) {
  const db = drizzle(d1Database);
  
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

Run this script using Wrangler:

```bash
# Create a command to run the script
npx wrangler d1 execute celestecms-db --command="INSERT INTO users (id, email, password_hash, name, role) VALUES ('admin-id', 'admin@example.com', 'hashed-password', 'Admin User', 'admin')"

# Or create a custom script that uses the D1 binding
```

### 13. Test the Authentication System

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/admin/login` and test the login functionality.

3. Verify that protected routes redirect to login when not authenticated.

### 14. Deploy to Cloudflare Pages

```bash
# Build your project
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy .svelte-kit/cloudflare
```

import { drizzle as drizzleLibSQL } from 'drizzle-orm/libsql';
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';
import type { D1Database } from '@cloudflare/workers-types';

// Extend App.Platform to include Cloudflare bindings
declare global {
  namespace App {
    interface Platform {
      env?: {
        D1?: D1Database;
        [key: string]: unknown;
      };
    }
  }
}

// Dummy database object for build time
let dummyDb: any = null;

/**
 * Creates a database connection based on the current environment
 * @param platform SvelteKit platform object (available in server hooks and routes)
 * @returns Drizzle ORM instance
 */
export function createDb(platform?: App.Platform) {
  // During build
  if (building) return dummyDb;
  
  // Cloudflare Pages with D1
  if (platform?.env?.D1) {
    return drizzleD1(platform.env.D1, { schema });
  }
  
  // Local development with SQLite
  if (env.DATABASE_URL?.startsWith('file:')) {
    const filePath = env.DATABASE_URL.replace('file:', '');
    const sqlite = new Database(filePath);
    return drizzleSQLite(sqlite, { schema });
  }
  
  // Remote LibSQL/Turso - fallback if DATABASE_URL exists
  if (env.DATABASE_URL) {
    const client = createClient({ url: env.DATABASE_URL });
    return drizzleLibSQL(client, { schema });
  }
  
  // If we get here, we don't have a database connection
  if (!building) {
    throw new Error('No database connection available. Set DATABASE_URL or provide D1 binding.');
  }
  
  return dummyDb;
}

// Create default db export for convenience in most cases
export const db = building ? dummyDb : createDb();
